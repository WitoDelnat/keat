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

    const targetIndex = this.#evalAudiencePhase(name as string, user);
    if (targetIndex !== undefined) return variants[targetIndex];

    const rolloutIndex = this.#evalRolloutPhase(name as string, user);
    if (rolloutIndex !== undefined) return variants[rolloutIndex];

    return this.#evalFallbackPhase(name as string);
  }

  #evalAudiencePhase(name: string, user?: User): number | undefined {
    if (!user) return undefined;
    const targetRule = this.#config[name]?.targetPhase;
    if (!targetRule) return undefined;

    for (const [index, target] of targetRule.entries()) {
      if (target === false) continue;
      if (target === true) return index;
      const match = target.some((a) => this.#audiences[a]?.(user));
      if (match) return index;
    }

    return undefined;
  }

  #evalRolloutPhase(name: string, user?: User): number | undefined {
    if (!user) return undefined;
    const rolloutRule = this.#config[name]?.rolloutPhase;
    if (!rolloutRule) return undefined;

    const percentage = this.#hashFn(user, name);
    for (const [index, rollout] of rolloutRule.entries()) {
      if (rollout === false) continue;
      if (rollout === true) return index;
      if (percentage <= rollout) return index;
    }
  }

  #evalFallbackPhase(name: string): number {
    const fallback = (this.#features[name]?.length ?? 0) - 1;
    const fallbackRule = this.#config[name]?.fallbackPhase;
    if (!fallbackRule) return fallback;
    for (const [index, enabled] of fallbackRule.entries()) {
      if (enabled) return index;
    }
    return fallback;
  }
}
