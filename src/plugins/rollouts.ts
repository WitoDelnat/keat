import { DEFAULT_GET_USER_ID, User } from "../core";
import { Plugin } from "../core/plugin";

type RolloutsPluginOptions = {
  getUserId?: (user: User) => string;
  hash?: HashFn;
};

type HashFn = (userId: string, feature: string) => number; // number between 0-100.

const DEFAULT_SEED = 1042019;
const DEFAULT_HASH: HashFn = (userId, feature) => {
  const seed = murmurHash(feature, DEFAULT_SEED);
  return (murmurHash(userId, seed) % 100) + 1;
};

export const rollouts = (options?: RolloutsPluginOptions): Plugin => {
  const userFn = options?.getUserId ?? DEFAULT_GET_USER_ID;
  const hashFn = options?.hash ?? DEFAULT_HASH;
  let featureMap: Record<string, unknown[]> = {};

  return {
    onPluginInit({ features }) {
      featureMap = features;
    },
    onEval({ feature, rule, variates, user, result }, { setResult }) {
      if (result || !user) return;

      const userId = userFn(user);
      const percentage = hashFn(userId, feature);
      let sum = 0;
      for (const [index, value] of rule.entries()) {
        if (typeof value !== "number") continue;
        sum += value;
        if (percentage <= sum) {
          const result = variates[index];
          return setResult(result);
        }
      }
    },
  };
};

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
