import * as faker from "faker";
import { FeatureListResource, FeatureResource } from "./featureResource";
import { fixture } from "../utils/testing/fluse";

type Args = {
  name?: string;
  enabled?: boolean;
  audiences?: string[];
  labels?: Record<string, string>;
};

export const featureResourceFixture = fixture<FeatureResource, Args>({
  create: (_, args) => {
    return {
      apiVersion: "keat.io/v1alpha1",
      kind: "Feature",
      metadata: {
        name: args.name ?? faker.random.word(),
        labels: args.labels ?? undefined,
      },
      spec: {
        enabled: args.enabled ?? true,
        audiences: args.audiences ?? ["everyone"],
      },
    };
  },
});

type ListArgs = {
  features: FeatureResource[];
};

export const featureListResourceFixture = fixture<
  FeatureListResource,
  ListArgs
>({
  create: (_, args) => {
    return {
      apiVersion: "keat.io/v1alpha1",
      kind: "FeatureList",
      metadata: {},
      items: args.features ?? [],
    };
  },
});
