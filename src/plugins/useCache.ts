import { User, Plugin } from "../core";

type CachePluginOptions = {
  createCacheKey?: (name: string, user?: User) => string;
};

export const useCache = (options?: CachePluginOptions): Plugin => {
  const cache = new Map();

  return {
    onConfigChange() {
      cache.clear();
    },
    onEval: ({ name, user, userIdentifier }, { setResult }) => {
      const userId = user ? user[userIdentifier] : "unknown";
      const key = options?.createCacheKey?.(name, user) ?? `${name}-${userId}`;
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
