import * as faker from "faker";
import { AudienceListResource, AudienceResource } from "../../src/clients";
import { fixture } from "./fluse";

type Args = {
  name?: string;
  labels?: Record<string, string>;
  kind?: "random" | "static";
  members?: string[];
  percentage?: number;
};

export const audienceResourceFixture = fixture<AudienceResource, Args>({
  create: (_, args) => {
    return args.kind === "static"
      ? {
          apiVersion: "keat.io/v1alpha1",
          kind: "Audience",
          metadata: {
            name: args.name ?? faker.random.word(),
            labels: args.labels ?? undefined,
          },
          spec: {
            kind: "static",
            members: args.members ?? [],
          },
        }
      : {
          apiVersion: "keat.io/v1alpha1",
          kind: "Audience",
          metadata: {
            name: args.name ?? faker.random.word(),
            labels: args.labels ?? undefined,
          },
          spec: {
            kind: "random",
            percentage: args.percentage ?? Math.random() * 100,
          },
        };
  },
});

type ListArgs = {
  audiences: AudienceResource[];
};

export const audienceListResourceFixture = fixture<
  AudienceListResource,
  ListArgs
>({
  create: (_, args) => {
    return {
      apiVersion: "keat.io/v1alpha1",
      kind: "AudienceList",
      metadata: {},
      items: args.audiences ?? [],
    };
  },
});
