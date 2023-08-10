import { createPlugin } from "../plugin";
import {Config, Rule} from "../types";

export const localConfig = (config: Config) => {
  return createPlugin({
    onPluginInit: async (_ctx, { setConfig }) => {
      setConfig(config);
    },
    matcher: (literal) => literal,
    evaluate: () => false,
  });
};

export function fromEnv(value?: string): Rule | undefined {
  if (!value) return undefined;
  const data = value
    .split(",")
    .map((v) => v.trim())
    .map((v) => {
      if (v === "true") return true;
      const parsed = parseInt(v);
      return isNaN(parsed) ? v : parsed;
    });
  if (data.length === 1) return data[0];
  return { OR: data };
}
