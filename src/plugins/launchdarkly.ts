import {
  initialize,
  LDClient,
  LDContext,
  LDFlagChangeset,
  LDFlagSet,
} from "launchdarkly-js-client-sdk";
import { isAny, Plugin } from "../core/plugin";

type LaunchDarklyPluginOptions = {
  clientId: string;
};

export const remoteConfig = (options: LaunchDarklyPluginOptions): Plugin => {
  let client: LDClient;
  let flags: LDFlagSet = {};

  return {
    onPluginInit: async (_ctx, { onChange }) => {
      client = initialize(options.clientId, {
        anonymous: true,
        kind: "user",
      });

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
          flags = client.allFlags();
          r();
        }
        client.on("failed", handleFailure);
        client.on("ready", handleReady);

        client.on("change", (changes: LDFlagChangeset) => {
          for (const [flag, { current }] of Object.entries(changes)) {
            flags[flag] = current;
          }
          onChange();
        });
      });
    },
    onIdentify({ user }) {
      const context: LDContext = {
        kind: "user",
        key: user?.id ?? user?.sub ?? user?.email,
        ...user,
      };
      client.identify(context);
    },
    matcher: isAny,
    evaluate({ feature, variate }) {
      return flags[feature] === variate;
    },
  };
};
