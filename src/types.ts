export type User = { sub: string };
export type AudienceFn = (user: User) => boolean;
export type HashFn = (user: User, feature: string) => number; // number between 0-100.

export type Rule = boolean | string | number | (string | number)[];
export type BiVariateRule = Rule;
export type MultiVariateRule = Rule[];
export type Config = Record<string, BiVariateRule | MultiVariateRule>;

export type KeatInit<TFeatures extends RawFeatures> = {
  audiences: Record<string, AudienceFn>;
  features: TFeatures;
  config: Config;
  hashFn?: HashFn;
};

/* * * * * * * * * * * * *
 * Internal types
 * * * * * * * * * * * * * */
export type NormalizedRule = boolean | (string | number)[];
export type RawFeatures = Record<string, readonly any[]>;
export type TargetRule = false | Array<string[] | boolean>;
export type RolloutRule = false | Array<number | boolean>;
