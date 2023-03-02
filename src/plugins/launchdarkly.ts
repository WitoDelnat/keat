import { initialize, LDClient, LDOptions } from "launchdarkly-js-client-sdk";
import { flagsToConfig } from "../core";
import { isNone } from "../core/matchers";
import { createPlugin } from "../core/plugin";

export const launchDarkly = (clientId: string, options?: LDOptions) => {
  let client: LDClient;

  return createPlugin({
    onPluginInit: async ({ variates }, { setConfig, onChange }) => {
      client = initialize(clientId, { kind: "user", anonymous: true }, options);

      return new Promise<void>((r) => {
        function cleanup() {
          client.off("ready", handleReady);
          client.off("failed", handleFailure);
        }
        function handleFailure() {
          cleanup();
          r();
        }
        function handleReady() {
          cleanup();
          const flags = client.allFlags();
          const config = flagsToConfig(flags, variates);
          setConfig(config);
          r();
        }
        client.on("failed", handleFailure);
        client.on("ready", () => {
          handleReady();
        });
        client.on("change", () => {
          const flags = client.allFlags();
          const config = flagsToConfig(flags, variates);
          setConfig(config);
          onChange();
        });
      });
    },
    async onIdentify({ user }) {
      await client.identify({
        kind: "user",
        key: user?.id ?? user?.sub ?? user?.email,
        ...user,
      });
    },
    matcher: isNone,
  });
};
