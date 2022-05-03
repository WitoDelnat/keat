import { User } from "../types";
import { Plugin } from "./plugin";

type CachePluginOptions = {
  createCacheKey?: (name: string, user?: User) => string;
};

export const useCache = (options?: CachePluginOptions): Plugin => {
  const cache = new Map();

  return {
    onConfigChange() {
      cache.clear();
    },
    onEval: (name, user, { setResult }) => {
      const key =
        options?.createCacheKey?.(name, user) ?? `${name}-${user?.sub}`;
      const cachedResult = cache.get(key);

      if (cachedResult !== undefined) {
        setResult(cachedResult);
      }

      return ({ result }) => {
        if (user) cache.set(key, result);
      };
    },
  };
};
