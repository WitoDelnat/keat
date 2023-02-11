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

  let cachedResult: number | undefined;

  return {
    onPreEvaluate({ configId }) {
      cachedResult = undefined;
      const cache = configId === 0 ? fallbackCache : latestCache;
      if (configId !== 0 && lastConfigId !== configId) {
        cache.clear();
      }
    },
    matcher: (literal) => literal,
    evaluate({ index, configId, feature, user }) {
      const cache = configId === 0 ? fallbackCache : latestCache;
      if (configId !== 0 && lastConfigId !== configId) cache.clear();
      const key = cacheFn(configId, feature, user);
      cachedResult = cache.get(key);
      return index === cachedResult;
    },
    onPostEvaluate({ result, configId, feature, user }) {
      const cache = configId === 0 ? fallbackCache : latestCache;
      const key = cacheFn(configId, feature, user);
      if (cachedResult !== undefined) cache.set(key, result);
    },
  };
};
