import { Config } from "../core";
import { Plugin } from "../core/plugin";

type EnvConfigPluginOptions = {
  envFn?: (env: string) => string;
};

// const DEFAULT_ENV_FN = (env) => process.env[env];
const DEFAULT_OPTIONS = {
  retries: 3,
};

export const envConfig = (
  env: Record<string, string | string[]>,
  rawOptions?: EnvConfigPluginOptions
): Plugin => {
  const options = { ...DEFAULT_OPTIONS, ...rawOptions };

  return {
    onPluginInit: async (_ctx, { setConfig }) => {
      // map env with envFn and fromEnv.
      // setConfig(remoteConfig);
    },
  };
};

function fromEnv(value?: string) {
  if (!value) return undefined;
  return value
    .split(",")
    .map((v) => v.trim())
    .map((v) => {
      if (v === "true") return true;
      const parsed = parseInt(v);
      return isNaN(parsed) ? v : parsed;
    });
}
