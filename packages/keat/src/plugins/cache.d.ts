import { User } from "../types";
type CachePluginOptions = {
    createCacheKey?: CacheFn;
};
type CacheFn = (configId: number, feature: string, user?: User) => string;
export declare const cache: (options?: CachePluginOptions) => import("../plugin").Plugin<import("../matchers").Matcher<any>>;
export {};
