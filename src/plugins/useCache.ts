import { User, Plugin, DEFAULT_GET_USER_ID } from "../core";

type CachePluginOptions = {
  createCacheKey?: CacheFn;
};

type CacheFn = (feature: string, user?: User) => string;

const DEFAULT_CREATE_CACHE_KEY: CacheFn = (feature, user) => {
  const userId = DEFAULT_GET_USER_ID(user);
  return `${feature}-${userId}`;
};

export const useCache = (options?: CachePluginOptions): Plugin => {
  const cache = new Map();
  const cacheFn = options?.createCacheKey ?? DEFAULT_CREATE_CACHE_KEY;

  return {
    onEval: ({ feature, user }, { setResult }) => {
      const key = cacheFn(feature, user);
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
