import type { SourceNewFormPayload } from "../validators/source-new.schema";

export type SourceType = SourceNewFormPayload["type"];
export type SourceNewFormValues = SourceNewFormPayload;

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  web: "Site web",
  api: "API",
  reseau: "Réseau",
};
