import { createTypeSpecLibrary, JSONSchemaType, paramMessage } from "@typespec/compiler";

export interface CHANGELOGEmitterOptions {
  /**
   * Name of the output file.
   *
   * @default CHANGELOG.md
   */
  "output-file"?: string;

  /**
   * The minimum version to generate CHANGELOG entries.
   */
  "from"?: string;

  /**
   * The maximum version to generate CHANGELOG entries.
   */
  "to"?: string;
}

const EmitterOptionsSchema: JSONSchemaType<CHANGELOGEmitterOptions> = {
  type: "object",
  additionalProperties: false,
  properties: {
    "output-file": {
      type: "string",
      nullable: true,
      description: "Name of the output file.",
    },
    "from": {
      type: "string",
      nullable: true,
      description: "The minimum version to generate CHANGELOG entries.",
    },
    "to": {
      type: "string",
      nullable: true,
      description: "The maximum version to generate CHANGELOG entries.",
    },
  },
}

export const $lib = createTypeSpecLibrary({
  name: "@typespec/changelog",
  diagnostics: {
    "multiple-namespaces": {
      severity: "warning",
      messages: {
        default: paramMessage`Ignoring additional service namespace '${"ns"}'.`,
      },
    },
    "single-version": {
      severity: "warning",
      messages: {
        default: "Skipping CHANGELOG with only single version."
      },
    },
    "namespace-undefined": {
      severity: "error",
      messages: {
        default: paramMessage`Version '${"version"}' not defined.`
      }
    }
  },
  emitter: {
    options: EmitterOptionsSchema as JSONSchemaType<CHANGELOGEmitterOptions>,
  },
});

export const { reportDiagnostic, createStateSymbol } = $lib;
