import { AnyFeatures, Config, Feature, Literal, Rule } from "./types";
/**
 * Utility which transforms an environment variable into a properly typed array.
 *
 * @example
 * fromEnv(process.env.ENABLE_UI_TO)
 *
 * `ENABLE_UI_TO=true` // enabled
 * `ENABLE_UI_TO=developers,5` // `['developers', 5]`
 */
/**
 * Retrieve the identifier of a user.
 */
export declare const DEFAULT_GET_USER_ID: (user: any) => any;
/**
 * Create a user from an identifier.
 */
export declare const DEFAULT_CREATE_USER: (id: string) => {
    id: string;
};
export declare function takeStrings(rule: Rule): string[];
export declare function takeNumbers(rule: Rule): number[];
export declare function takeBooleans(rule: Rule): boolean[];
export declare function mutable<T>(x?: readonly T[]): T[] | undefined;
export declare function getVariatesMap(features: Record<string, Feature>): Record<string, any[]>;
export declare function getVariates(features: AnyFeatures, name: string): any[];
export declare function getRules(features: AnyFeatures, config: Config, name: string, configId: number): Rule[] | undefined;
export declare function isLiteral(rule: Rule): rule is Literal;
export declare function flagsToConfig(flags: Record<string, any>, variates: Record<string, any[]>): Config;
