import { User } from "../types";
type AudienceFn = (user: User) => boolean | undefined;
export declare const audience: (name: string, fn: AudienceFn) => import("../plugin").Plugin<import("../matchers").Matcher<string>>;
export {};
