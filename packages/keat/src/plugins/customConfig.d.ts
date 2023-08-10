import { Config } from "../types";
type CustomConfigPluginOptions = {
    fetch: () => Promise<Config>;
    retries?: number;
};
export declare const customConfig: (rawOptions: CustomConfigPluginOptions) => import("../plugin").Plugin<import("../matchers").Matcher<never>>;
export {};
