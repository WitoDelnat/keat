import * as z from "zod";
import { FeatureDefinition } from "../keat-core";

export type FeatureResource = z.infer<typeof FeatureResourceSchema>;
const FeatureResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z
    .object({
      name: z.string(),
      labels: z.record(z.string()).optional(),
    })
    .nonstrict(),
  spec: z.object({
    enabled: z.boolean(),
    audiences: z.array(z.string()).optional(),
  }),
});

export type FeatureListResource = z.infer<typeof FeatureListResourceSchema>;
export const FeatureListResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z.any(),
  items: z.array(FeatureResourceSchema),
});

export function toFeatureDefinition(
  feature: FeatureResource
): FeatureDefinition {
  return {
    name: feature.metadata.name,
    labels: feature.metadata.labels,
    enabled: feature.spec.enabled,
    audiences: feature.spec.audiences,
  };
}
