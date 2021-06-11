import * as z from "zod";
import { AudienceDefinition } from "../keat-core";

export type AudienceResource = z.infer<typeof AudienceResourceSchema>;
export const AudienceResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z
    .object({
      name: z.string(),
      labels: z.record(z.string()).optional(),
    })
    .nonstrict(),
  spec: z.union([
    z.object({
      kind: z.literal("static"),
      members: z.array(z.string()),
      key: z.string().optional(),
    }),
    z.object({
      kind: z.literal("random"),
      percentage: z.number(),
    }),
    z.object({
      kind: z.literal("sticky"),
      percentage: z.number(),
      key: z.string().optional(),
    }),
  ]),
});

export type AudienceListResource = z.infer<typeof AudienceListResourceSchema>;
export const AudienceListResourceSchema = z.object({
  apiVersion: z.string(),
  kind: z.string(),
  metadata: z.any(),
  items: z.array(AudienceResourceSchema),
});

export function toAudienceDefinition(
  audience: AudienceResource
): AudienceDefinition {
  switch (audience.spec.kind) {
    case "static": {
      return {
        kind: "static",
        name: audience.metadata.name,
        members: audience.spec.members,
        key: audience.spec.key,
      };
    }
    case "random": {
      return {
        kind: "random",
        name: audience.metadata.name,
        percentage: audience.spec.percentage,
      };
    }
    case "sticky": {
      return {
        kind: "sticky",
        name: audience.metadata.name,
        percentage: audience.spec.percentage,
        key: audience.spec.key,
      };
    }
  }
}
