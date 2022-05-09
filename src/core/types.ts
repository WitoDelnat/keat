import type { Plugin } from "./plugin";

/**
 * Bring your own user with declaration merging:
 *
 * @example
 * ```
 * declare module 'keat' {
 *   interface CustomTypes {
 *     user: { name: string, email: string, developerPreview: boolean }
 *   }
 * }
 * ```
 */
export interface CustomTypes {
  // user: ...
}

export type User = CustomTypes extends { user: infer T } ? T : { id: string };

/* * * * * * * * * * * * *
 * API
 * * * * * * * * * * * * */
export type IdentityFn = (user: User) => string;
export type Rule = boolean | string | number | (string | number)[];
export type BiVariateRule = Rule;
export type MultiVariateRule = Rule[];
export type Config = Record<string, BiVariateRule | MultiVariateRule>;

export type KeatInit<TFeatures extends RawFeatures> = {
  features: TFeatures;
  config?: Config;
  plugins: Plugin[];
};

/* * * * * * * * * * * * *
 * Internal types
 * * * * * * * * * * * * */
export type NormalizedConfig = Record<string, NormalizedRule[]>;
export type NormalizedRule = boolean | (string | number)[];
export type RawFeatures = Record<string, readonly any[]>;
