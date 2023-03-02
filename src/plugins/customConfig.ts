import { Config, createPlugin, isNone } from "../core";

type CustomConfigPluginOptions = {
  fetch: () => Promise<Config>;
  retries?: number;
};

const DEFAULT_OPTIONS = {
  retries: 3,
};

export const customConfig = (rawOptions: CustomConfigPluginOptions) => {
  const options = { ...DEFAULT_OPTIONS, ...rawOptions };

  return createPlugin({
    onPluginInit: async (_ctx, { setConfig }) => {
      let timeout = 50;
      for (let i = 0; i < options.retries; i++) {
        try {
          const remoteConfig = await options.fetch();
          setConfig(remoteConfig);
          break;
        } catch (err) {
          timeout = timeout * 2;
          await new Promise<void>((r) => setTimeout(r, timeout));
        }
      }
    },
    matcher: isNone,
  });
};
