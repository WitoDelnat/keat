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

export type User = CustomTypes extends { user: infer T }
  ? T
  : ({ id: string } | { sub: string } | { email: string }) &
      Record<string, any>;

/* * * * * * * * * * * * *
 * API
 * * * * * * * * * * * * */
export type IdentityFn = (user: User) => string;
export type Display = "block" | "swap" | "fallback" | "optional";
export type Rule =
  | { OR: readonly (boolean | string | number)[] }
  | boolean
  | string
  | number;

export type Feature =
  | Rule
  | {
      variates?: readonly [any, any];
      when?: Rule;
    }
  | {
      variates?: readonly [any, any, ...any];
      when?: readonly Rule[];
    };

export type Config = Record<string, Rule | Rule[]>;

export type KeatInit<TFeatures extends AnyFeatures> = {
  features: TFeatures;
  plugins?: Plugin[];
  display?: Display;
};

export type KeatApi<TFeatures extends AnyFeatures> = {
  ready(display?: Display): Promise<void>;
  setUser(user?: User): void;
  setDisplay(display: Display): void;
  variation<TFeature extends keyof TFeatures>(
    feature: TFeature,
    user?: User,
    display?: Display
  ): TFeatures[TFeature] extends { variates: any }
    ? TFeatures[TFeature]["variates"] extends readonly any[]
      ? TFeatures[TFeature]["variates"][number]
      : boolean
    : boolean;
};

/* * * * * * * * * * * * *
 * Internal types
 * * * * * * * * * * * * */
export type NormalizedConfig = Record<string, NormalizedRule[]>;
export type NormalizedRule = Array<NormalizedElem>;
export type NormalizedElem = boolean | (string | number)[];
export type AnyFeatures = Record<string, Feature>;
