import { Config } from "../types";
import { Plugin } from "./plugin";

type FetchOncePluginOptions = {
  fetch: () => Promise<Config>;
  retries?: number;
};

const DEFAULT_OPTIONS = {
  retries: 3,
};

export const useFetchOnce = (rawOptions: FetchOncePluginOptions): Plugin => {
  const options = { ...DEFAULT_OPTIONS, ...rawOptions };

  return {
    onPluginInit: async ({ setConfig }) => {
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
  };
};
