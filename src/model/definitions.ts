import * as z from "zod";

export type Definitions = z.infer<typeof definitionsSchema>;

export type AudienceDefinition = z.infer<typeof audienceDefinitionSchema>;
export type StaticAudienceDefinition = z.infer<
  typeof staticAudienceDefinitionSchema
>;
export type RandomAudienceDefinition = z.infer<
  typeof randomAudienceDefinitionSchema
>;

export type Labels = z.infer<typeof labelsSchema>;
export type FeatureDefinition = z.infer<typeof featureDefinitionSchema>;

export const randomAudienceDefinitionSchema = z.object({
  kind: z.literal("random"),
  name: z.string(),
  percentage: z.number(),
});

export const staticAudienceDefinitionSchema = z.object({
  kind: z.literal("static"),
  name: z.string(),
  members: z.array(z.string()),
});

export const audienceDefinitionSchema = z.union([
  staticAudienceDefinitionSchema,
  randomAudienceDefinitionSchema,
]);

export const labelsSchema = z.record(z.string());

export const featureDefinitionSchema = z.object({
  name: z.string(),
  enabled: z.boolean().optional(),
  labels: labelsSchema.optional(),
  audiences: z.array(z.string()),
});

export const definitionsSchema = z.object({
  audiences: z.array(audienceDefinitionSchema).optional(),
  features: z.array(featureDefinitionSchema),
});
