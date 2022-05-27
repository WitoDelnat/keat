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
export type Elem = boolean | string | number | (string | number)[];
export type BiVariateRule = Elem;
export type MultiVariateRule = Elem[];
export type Display = "block" | "swap" | "fallback" | "optional";
export type Config<TFeatures extends string = string> = Partial<
  Record<TFeatures, BiVariateRule | MultiVariateRule | undefined>
>;

export type KeatInit<TFeatures extends AnyFeatures> = {
  features: TFeatures;
  config?: Config<keyof TFeatures & string>;
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
  ): TFeatures[TFeature][number];
};

/* * * * * * * * * * * * *
 * Internal types
 * * * * * * * * * * * * */
export type NormalizedConfig = Record<string, NormalizedRule[]>;
export type NormalizedRule = Array<NormalizedElem>;
export type NormalizedElem = boolean | (string | number)[];
export type AnyFeatures = Record<string, readonly any[]>;
