import { User, Plugin, DEFAULT_GET_USER_ID } from "../core";

type CachePluginOptions = {
  createCacheKey?: CacheFn;
};

type CacheFn = (configId: number, feature: string, user?: User) => string;

const DEFAULT_CREATE_CACHE_KEY: CacheFn = (configId, feature, user) => {
  const userId = DEFAULT_GET_USER_ID(user);
  return `${configId}-${feature}-${userId}`;
};

export const useCache = (options?: CachePluginOptions): Plugin => {
  const cache = new Map();
  const cacheFn = options?.createCacheKey ?? DEFAULT_CREATE_CACHE_KEY;

  return {
    onEval: ({ configId, feature, user }, { setResult }) => {
      const key = cacheFn(configId, feature, user);
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
