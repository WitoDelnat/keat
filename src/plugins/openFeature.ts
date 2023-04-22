import { isAny } from "../core/matchers";
import { createPlugin } from "../core/plugin";

import { OpenFeature, Provider, Client, Hook } from "@openfeature/js-sdk";

type OpenFeatureOptions = {
  name?: string;
  hooks?: Hook[];
};

export const openFeature = (
  provide: () => Promise<Provider> | Provider,
  { name, hooks }: OpenFeatureOptions = {}
) => {
  let client: Client;

  return createPlugin({
    onPluginInit: async () => {
      const provider = await provide();
      OpenFeature.setProvider(provider);

      if (hooks) {
        OpenFeature.addHooks(...hooks);
      }

      client = OpenFeature.getClient(name);
    },
    async onIdentify({ user }) {
      client.setContext({
        targetingKey: user?.id ?? user?.sub ?? user?.email,
        ...user,
      });
    },
    matcher: isAny,
    evaluate({ feature, variate }) {
      return false;

      // This does not work out well for Keat.
      // Client preferredly does not await as it blocks renders.
      // There is no way to get flags eagerly / subscribe to changes with ProviderEvents.ConfigurationChanged?

      // switch (typeof variate) {
      //   case "string":
      //     const stringDetails = await client.getStringDetails(feature, "");
      //     if (stringDetails.reason === "DEFAULT") return false;
      //     return stringDetails.value === variate;
      //   case "boolean":
      //     const booleanDetails = await client.getBooleanDetails(feature, false);
      //     if (booleanDetails.reason === "DEFAULT") return false;
      //     return booleanDetails.value === variate;
      //   case "number":
      //     const numberDetails = await client.getNumberDetails(feature, -1);
      //     if (numberDetails.reason === "DEFAULT") return false;
      //     return numberDetails.value === variate;
      //   default:
      //     return false;
      // }
    },
  });
};
