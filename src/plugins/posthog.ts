import posthogUpstream, { PostHog, PostHogConfig } from "posthog-js";
import { flagsToConfig } from "../core";
import { isAny, isNone } from "../core/matchers";
import { createPlugin } from "../core/plugin";

export const posthog = (
  apiTokenOrClient: string | PostHog,
  options?: Partial<PostHogConfig>
) => {
  let client: PostHog;

  return createPlugin({
    onPluginInit: async ({ variates }, { setConfig, onChange }) => {
      return new Promise<void>((r) => {
        console.log("START");
        if (typeof apiTokenOrClient === "string") {
          client = posthogUpstream;
          client.init(apiTokenOrClient, {
            loaded: () => {
              r();
            },
            ...options,
          });
        } else {
          client = apiTokenOrClient;
        }
        client.onFeatureFlags((_, flags) => {
          const config = flagsToConfig(flags, variates);
          setConfig(config);
          onChange();
        });
      });
    },
    async onIdentify({ user }) {
      const id = user?.id ?? user?.sub ?? user?.email;
      client.identify(id, user);
    },
    matcher: isAny,
    evaluate({ feature, variate }) {
      console.log("eval", feature, variate, client.getFeatureFlag(feature));
      return variate === client.getFeatureFlag(feature);
    },
  });
};
