import { getAllHttpServices } from "@typespec/http";
import { resolveVersions } from "@typespec/versioning";
import { CHANGELOGEmitterOptions, reportDiagnostic } from "./lib.js";
import { EmitContext, Namespace, compilerAssert, resolvePath } from "@typespec/compiler";

const defaultOptions: CHANGELOGEmitterOptions = {
  "output-file": "CHANGELOG.md",
}

export async function $onEmit(context: EmitContext<CHANGELOGEmitterOptions>) {
  const options = resolveOptions(context);
  if (options === undefined) {
    return;
  }
  console.log(options);
}

interface CHANGELOGEmitterConfiguration {
  outputFile: string;
  versions: string[];
  namespace: Namespace;
}

function resolveOptions(context: EmitContext<CHANGELOGEmitterOptions>): CHANGELOGEmitterConfiguration | undefined {
  const resolvedOptions = { ...defaultOptions, ...context.options };
  const [services] = getAllHttpServices(context.program);
  const service = services.shift();
  compilerAssert(service, "No project namespace defined.")

  const ns = service.namespace;
  services.forEach((s) => reportDiagnostic(context.program, {
    code: "multiple-namespaces",
    target: ns,
    format: {
      ns: s.namespace.name,
    },
  }));

  const versions =
    resolveVersions(context.program, ns).map((version) => version.rootVersion!)
    .map((v) => v.value)
    .sort((a, b) => a.localeCompare(b));

  let hasError = false;
  const indexOf = (ver: string | undefined, index?: number): number | undefined => {
    if (!ver) {
      return index;
    }

    let idx = versions.indexOf(ver);
    if (idx < 0) {
      reportDiagnostic(context.program, {
        code: "namespace-undefined",
        target: service.namespace,
        format: {
          version: ver,
        },
      });
      hasError = true;
      return undefined;
    }

    return idx;
  }

  let fromVersion = indexOf(resolvedOptions.from, 0);
  if (hasError) {
    return undefined;
  }

  let toVersion = indexOf(resolvedOptions.to);
  if (hasError) {
    return undefined;
  }

  if (toVersion !== undefined) {
    // Array.slice is exclusive of end, so increment end.
    toVersion++;
  }

  const selected = versions.slice(fromVersion, toVersion);
  if (selected.length <= 1) {
    reportDiagnostic(context.program, {
      code: "invalid-selection",
      target: ns,
    });
    return undefined;
  }

  return {
    outputFile: resolvePath(context.emitterOutputDir, resolvedOptions["output-file"]),
    versions: selected,
    namespace: ns,
  };
}
