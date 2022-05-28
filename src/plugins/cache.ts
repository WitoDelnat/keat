import { User, Plugin, DEFAULT_GET_USER_ID } from "../core";

type CachePluginOptions = {
  createCacheKey?: CacheFn;
};

type CacheFn = (configId: number, feature: string, user?: User) => string;

const DEFAULT_CREATE_CACHE_KEY: CacheFn = (configId, feature, user) => {
  const userId = DEFAULT_GET_USER_ID(user);
  return `${configId}-${feature}-${userId}`;
};

export const cache = (options?: CachePluginOptions): Plugin => {
  const fallbackCache = new Map();
  const latestCache = new Map();
  const cacheFn = options?.createCacheKey ?? DEFAULT_CREATE_CACHE_KEY;
  let lastConfigId = -1;

  return {
    onEval: ({ configId, feature, user }, { setResult }) => {
      const cache = configId === 0 ? fallbackCache : latestCache;
      if (configId !== 0 && lastConfigId !== configId) cache.clear();

      const key = cacheFn(configId, feature, user);
      const cachedResult = cache.get(key);

      if (cachedResult !== undefined) {
        setResult(cachedResult);
      }

      return ({ result }) => {
        if (cachedResult === undefined) cache.set(key, result);
        if (configId !== 0) lastConfigId = configId;
      };
    },
  };
};
