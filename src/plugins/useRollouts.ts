import { isBoolean, isNumber, last, mapValues } from "lodash";
import { NormalizedRule, User } from "../core";
import { Plugin } from "../core/plugin";

type RolloutsPluginOptions = {
  hash?: HashFn;
};

type HashFn = (user: User, feature: string, userIdentifier?: string) => number; // number between 0-100.

const DEFAULT_SEED = 1042019;
const DEFAULT_HASH: HashFn = (user, feature, userIdentifier) => {
  const seed = murmurHash(feature, DEFAULT_SEED);
  const u = user as any;
  const id = u[userIdentifier ?? "id"] ?? u["id"] ?? u["sub"] ?? u["email"];
  return murmurHash(id, seed);
};

export const useRollouts = (options?: RolloutsPluginOptions): Plugin => {
  const hashFn = options?.hash ?? DEFAULT_HASH;
  let features: Record<string, unknown[]>;
  let rollouts: Record<string, false | Array<number | boolean>>;

  return {
    onPluginInit({ features }) {
      features = features;
    },
    onConfigChange(config) {
      rollouts = mapValues(config, preprocessRollout);
    },
    onEval({ user, name, result }, { setResult }) {
      if (result || !user) return;
      const variates = features[name];
      const rollout = rollouts[name];
      if (!variates || !rollout) return;

      const percentage = hashFn(user, name);
      for (const [index, value] of rollout.entries()) {
        if (value === false) continue;
        if (percentage <= value) {
          const result = variates[index];
          setResult(result);
          return;
        }
      }
    },
  };
};

function preprocessRollout(rule: NormalizedRule[]) {
  const rolloutRule = rule.map((p) => {
    if (isBoolean(p)) return p;
    const arr = p.filter(isNumber);
    return last(arr) ?? false;
  });
  const skipRolloutPhase = rolloutRule.every((p) => p === false);
  return skipRolloutPhase ? false : rolloutRule;
}

/**
 * Fast, non-cryptographic hash function.
 *
 * All credits go to Perezd's node-murmurhash.
 *
 * @see https://en.wikipedia.org/wiki/MurmurHash
 * @see https://github.com/perezd/node-murmurhash
 */
export function murmurHash(key: string | Uint8Array, seed: number): number {
  if (typeof key === "string") key = new TextEncoder().encode(key);

  const remainder = key.length & 3;
  const bytes = key.length - remainder;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  let i = 0;
  let h1 = seed;
  let k1, h1b;

  while (i < bytes) {
    k1 =
      (key[i] & 0xff) |
      ((key[++i] & 0xff) << 8) |
      ((key[++i] & 0xff) << 16) |
      ((key[++i] & 0xff) << 24);
    ++i;

    k1 =
      ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 =
      ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1b =
      ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
    h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
  }

  k1 = 0;

  switch (remainder) {
    case 3:
      k1 ^= (key[i + 2] & 0xff) << 16;
    case 2:
      k1 ^= (key[i + 1] & 0xff) << 8;
    case 1:
      k1 ^= key[i] & 0xff;

      k1 =
        ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) &
        0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 =
        ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) &
        0xffffffff;
      h1 ^= k1;
  }

  h1 ^= key.length;

  h1 ^= h1 >>> 16;
  h1 =
    ((h1 & 0xffff) * 0x85ebca6b +
      ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) &
    0xffffffff;
  h1 ^= h1 >>> 13;
  h1 =
    ((h1 & 0xffff) * 0xc2b2ae35 +
      ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) &
    0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}
