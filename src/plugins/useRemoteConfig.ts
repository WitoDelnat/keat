import { pause } from "../core/display";
import { Plugin } from "../core/plugin";

type RemoteConfigPluginOptions = {
  retries?: number;
};

const DEFAULT_OPTIONS = {
  retries: 3,
};

export const useRemoteConfig = (
  url: string,
  rawOptions?: RemoteConfigPluginOptions
): Plugin => {
  const options = { ...DEFAULT_OPTIONS, ...rawOptions };

  return {
    onPluginInit: async (_ctx, { setConfig }) => {
      let timeout = 50;
      for (let i = 0; i < options.retries; i++) {
        try {
          const response = await fetch(url);

          if (!response.ok) throw new Error("fetch failed");

          const remoteConfig = await response.json();
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
