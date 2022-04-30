import { isBoolean } from "lodash";

type User = { sub: string };
type AudienceFn = (user: User) => boolean;
type Variant = any;

type TargetRule = string[] | boolean;
type RolloutRule = number | boolean;

type KeatInit = {
  audiences: Record<string, AudienceFn>;
  features: Record<string, Variant[]>;
  config: Record<string, [TargetRule[], RolloutRule[]]>;
};
type HashFn = (user: User) => number; // number between 0-100.

export class Keat {
  #audiences: Record<string, AudienceFn>;
  #features: Record<string, Variant[]>;
  #config: Record<string, [TargetRule[], RolloutRule[]]>;
  #hashFn: HashFn;

  constructor(init: KeatInit, hashFn?: HashFn) {
    this.#audiences = init.audiences;
    this.#features = init.features;
    this.#config = init.config;
    this.#hashFn = hashFn ?? defaultHash;
  }

  eval(name: string, user: User): any {
    const variants = this.#features[name];
    const [targets, rollouts] = this.#config[name];

    for (const [index, target] of targets.entries()) {
      if (isBoolean(target)) {
        if (target) {
          return variants[index];
        } else {
          continue;
        }
      }

      for (const audience of target) {
        const fn = this.#audiences[audience];
        if (fn(user)) {
          return variants[index];
        }
      }
    }

    const percentage = this.#hashFn(user);
    for (const [index, rollout] of rollouts.entries()) {
      if (isBoolean(rollout)) {
        if (rollout) {
          return variants[index];
        } else {
          continue;
        }
      }

      if (percentage <= rollout) {
        return variants[index];
      }
    }

    return variants[variants.length - 1];
  }
}

function defaultHash(user: User): number {
  const seed = "default-seed";
  return murmurHash(user["sub"], seed);
}

function murmurHash(input: string, seed: string): number {
  return 0; // todo
}
