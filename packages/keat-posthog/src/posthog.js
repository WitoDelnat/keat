import posthogUpstream from "posthog-js";
import { createPlugin, flagsToConfig, isAny } from "keat";
export const posthog = (apiTokenOrClient, options) => {
    let client;
    return createPlugin({
        onPluginInit: async ({ variates }, { setConfig, onChange }) => {
            return new Promise((r) => {
                if (typeof apiTokenOrClient === "string") {
                    client = posthogUpstream;
                    client.init(apiTokenOrClient, {
                        loaded: () => {
                            r();
                        },
                        ...options,
                    });
                }
                else {
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
            return variate === client.getFeatureFlag(feature);
        },
    });
};
