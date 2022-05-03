import { Plugin } from "./plugins/plugin";

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
export type UserConfig = {
  userIdentifier?: User extends string ? never : keyof User;
};

/* * * * * * * * * * * * *
 * API
 * * * * * * * * * * * * */
export type AudienceFn = (user: User) => boolean;
export type HashFn = (
  user: User,
  feature: string,
  userIdentifier?: string
) => number; // number between 0-100.

export type Rule = boolean | string | number | (string | number)[];
export type BiVariateRule = Rule;
export type MultiVariateRule = Rule[];
export type Config = Record<string, BiVariateRule | MultiVariateRule>;

export type KeatInit<TFeatures extends RawFeatures> = {
  features: TFeatures;
  audiences?: Record<string, AudienceFn>;
  config?: Config;
  hashFn?: HashFn;
  plugins?: Plugin[];
} & UserConfig;

/* * * * * * * * * * * * *
 * Internal types
 * * * * * * * * * * * * */
export type NormalizedRule = boolean | (string | number)[];
export type RawFeatures = Record<string, readonly any[]>;
export type PhasedConfig = {
  audience: false | Array<string[] | boolean>;
  rollout: false | Array<number | boolean>;
  fallback: number;
};
