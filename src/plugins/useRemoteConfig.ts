import { Config } from "../core";
import { Plugin } from "../core/plugin";

type RemoteConfigPluginOptions = {
  interval?: number;
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

  const fetchConfig = async (url: string) => {
    let timeout = 100;
    for (let i = 0; i < options.retries; i++) {
      try {
        const response = await fetch(url);

        if (!response.ok) throw new Error("fetch failed");

        const remoteConfig = await response.json();
        return remoteConfig;
      } catch (err) {
        timeout = timeout * 2;
        await pause(timeout);
      }
    }
  };

  const backgroundTask = async (
    interval: number,
    setConfig: (newConfig: Config) => void
  ) => {
    try {
      while (true) {
        await pause(interval * 1000);
        const remoteConfig = await fetchConfig(url);
        setConfig(remoteConfig);
      }
    } catch {
      return;
    }
  };

  return {
    onPluginInit: async (_ctx, { setConfig }) => {
      const remoteConfig = await fetchConfig(url);
      setConfig(remoteConfig);

      if (options.interval !== undefined) {
        backgroundTask(options.interval, setConfig);
      }
    },
  };
};

function pause(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
