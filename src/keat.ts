import { mapValues } from "lodash";
import { normalizeVariateRule, preprocessRule } from "./rules";
import type {
  RawFeatures,
  KeatInit,
  AudienceFn,
  TargetRule,
  RolloutRule,
  HashFn,
  User,
} from "./types";

export class Keat<TFeatures extends RawFeatures> {
  static create<TFeatures extends RawFeatures>(
    init: KeatInit<TFeatures>
  ): Keat<TFeatures> {
    return new Keat(init);
  }

  #audiences: Record<string, AudienceFn>;
  #features: TFeatures;
  #config: Record<
    string,
    { targetPhase: TargetRule; rolloutPhase: RolloutRule }
  >;
  #hashFn: HashFn;

  constructor(init: KeatInit<TFeatures>) {
    this.#audiences = init.audiences;
    this.#features = init.features;
    this.#config = mapValues(init.config, (r, feature) => {
      const isMultiVariate = init.features[feature].length > 2;
      const rule = normalizeVariateRule(r, isMultiVariate);
      return preprocessRule(rule);
    });
    this.#hashFn = init.hashFn ?? defaultHash;
  }

  eval<TName extends keyof TFeatures>(
    name: TName,
    user: User
  ): TFeatures[TName][number] {
    const variants = this.#features[name];
    if (!variants) return undefined;

    const targetIndex = this.#evalAudiencePhase(name as string, user);
    if (targetIndex !== undefined) return variants[targetIndex];

    const rolloutIndex = this.#evalRolloutPhase(name as string, user);
    if (rolloutIndex !== undefined) return variants[rolloutIndex];

    return variants[variants.length - 1];
  }

  #evalAudiencePhase(name: string, user: User): number | undefined {
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

  #evalRolloutPhase(name: string, user: User): number | undefined {
    const rolloutRule = this.#config[name]?.rolloutPhase;
    if (!rolloutRule) return undefined;

    const percentage = this.#hashFn(user);
    for (const [index, rollout] of rolloutRule.entries()) {
      if (rollout === false) continue;
      if (rollout === true) return index;
      if (percentage <= rollout) return index;
    }
  }
}

function defaultHash(user: User): number {
  const seed = "default-seed";
  return murmurHash(user["sub"], seed);
}

function murmurHash(input: string, seed: string): number {
  return 0; // todo
}
