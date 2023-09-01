import { getAllHttpServices } from "@typespec/http";
import { resolveVersions } from "@typespec/versioning";
import { CHANGELOGEmitterOptions, reportDiagnostic } from "./lib.js";
import { EmitContext, Namespace, compilerAssert, resolvePath } from "@typespec/compiler";

const defaultOptions: CHANGELOGEmitterOptions = {
  "output-file": "CHANGELOG.md",
}

export async function $onEmit(context: EmitContext<CHANGELOGEmitterOptions>) {
  const options = resolveOptions(context);
  if (options.fromVersion === options.toVersion) {
    reportDiagnostic(context.program, {
      code: "single-version",
      target: options.namespace,
    });
    return;
  }
  console.log(options);
}

interface CHANGELOGEmitterConfiguration {
  outputFile: string;
  fromVersion: string;
  toVersion: string;
  namespace: Namespace;
}

function resolveOptions(context: EmitContext<CHANGELOGEmitterOptions>): CHANGELOGEmitterConfiguration {
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

  let fromVersion = resolvedOptions.from;
  let toVersion = resolvedOptions.to;
  const checkDefined = (ver?: string): string | undefined => {
    if (ver && !versions.some((v) => v === ver)) {
      reportDiagnostic(context.program, {
        code: "namespace-undefined",
        target: service.namespace,
        format: {
          version: ver,
        },
      })
    }
    return ver;
  }

  return {
    outputFile: resolvePath(context.emitterOutputDir, resolvedOptions["output-file"]),
    fromVersion: checkDefined(fromVersion) || versions.at(0)!,
    toVersion: checkDefined(toVersion) || versions.at(-1)!,
    namespace: ns,
  };
}
