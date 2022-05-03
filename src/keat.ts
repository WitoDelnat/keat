import { mapValues } from "lodash";
import { DEFAULT_HASH } from "./hash";
import { normalizeVariateRule, preprocessRule } from "./rules";
import type {
  RawFeatures,
  KeatInit,
  AudienceFn,
  TargetRule,
  RolloutRule,
  HashFn,
  User,
  Config,
  FallbackRule,
} from "./types";

export class Keat<TFeatures extends RawFeatures> {
  static create<TFeatures extends RawFeatures>(
    init: KeatInit<TFeatures>
  ): Keat<TFeatures> {
    return new Keat(init);
  }

  #audiences: Record<string, AudienceFn>;
  #features: TFeatures;
  #config!: Record<
    string,
    {
      targetPhase: TargetRule;
      rolloutPhase: RolloutRule;
      fallbackPhase: FallbackRule;
    }
  >;
  #hashFn: HashFn;

  constructor(init: KeatInit<TFeatures>) {
    this.#audiences = init.audiences;
    this.#features = init.features;
    this.#hashFn = init.hashFn ?? DEFAULT_HASH;
    this.config = init.config;
  }

  set config(value: Config) {
    this.#config = mapValues(value, (r, feature) => {
      const isMultiVariate = this.#features[feature].length > 2;
      const rule = normalizeVariateRule(r, isMultiVariate);
      return preprocessRule(rule);
    });
  }

  eval<TName extends keyof TFeatures>(
    name: TName,
    user?: User
  ): TFeatures[TName][number] {
    const variants = this.#features[name];
    if (!variants) return undefined;
    const config = this.#config[name as string];
    if (!config) return variants[variants.length - 1];
    const { audience, rollout, fallback } = config;

    if (user && audience) {
      for (const [index, value] of audience.entries()) {
        if (value === true) return variants[index];
        if (value === false) continue;
        const match = value.some((a) => this.#audiences[a]?.(user));
        if (match) return variants[index];
      }
    }

    if (user && rollout) {
      const percentage = this.#hashFn(user, name as string);
      for (const [index, value] of rollout.entries()) {
        if (value === false) continue;
        if (percentage <= value) return variants[index];
      }
    }

    return variants[fallback];
  }
}
