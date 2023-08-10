import { User } from "../types";
type AnonymousPluginOptions = {
    createUser?: (id: string) => User;
    createId?: () => string;
    persist?: boolean;
};
export declare const anonymous: (options?: AnonymousPluginOptions) => import("../plugin").Plugin<import("../matchers").Matcher<never>>;
export {};
