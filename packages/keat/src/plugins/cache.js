import { DEFAULT_GET_USER_ID } from "../utils";
import { createPlugin } from "../plugin";
import { isAny } from "../matchers";
const DEFAULT_CREATE_CACHE_KEY = (configId, feature, user) => {
    const userId = DEFAULT_GET_USER_ID(user);
    return `${configId}-${feature}-${userId}`;
};
export const cache = (options) => {
    const fallbackCache = new Map();
    const latestCache = new Map();
    const cacheFn = options?.createCacheKey ?? DEFAULT_CREATE_CACHE_KEY;
    let lastConfigId = -1;
    let key = "";
    let cache = fallbackCache;
    return createPlugin({
        onPostEvaluate({ result }) {
            cache.set(key, result);
        },
        onPreEvaluate({ configId, feature, user }) {
            key = cacheFn(configId, feature, user);
            cache = configId === 0 ? fallbackCache : latestCache;
            if (configId !== 0 && lastConfigId !== configId) {
                cache.clear();
            }
        },
        matcher: isAny,
        evaluate({ variate }) {
            const cachedResult = cache.get(key);
            return variate === cachedResult;
        },
    });
};
