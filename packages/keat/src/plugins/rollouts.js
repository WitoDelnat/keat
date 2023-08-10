import { DEFAULT_GET_USER_ID } from "../utils";
import { createPlugin } from "../plugin";
import { isNumber } from "../matchers";
const DEFAULT_SEED = 1042019;
const DEFAULT_HASH = (userId, feature) => {
    const seed = murmurHash(feature, DEFAULT_SEED);
    return (murmurHash(userId, seed) % 100) + 1;
};
export const rollouts = (options) => {
    const userFn = options?.getUserId ?? DEFAULT_GET_USER_ID;
    const hashFn = options?.hash ?? DEFAULT_HASH;
    // Threshold should accumulate over multi-variates
    // e.g. variates: ["a", "b", "c"] and rules: [30,50,20]
    // This has 30% chance to be "a" and 50% chance to be "b".
    // For this to happen threshold has to be 80% for "b".
    let threshold = 0;
    return createPlugin({
        matcher: isNumber,
        onPreEvaluate() {
            threshold = 0;
        },
        evaluate({ feature, user, literal }) {
            const percentage = user
                ? hashFn(userFn(user), feature)
                : Math.floor(Math.random() * 101);
            threshold = threshold + literal;
            return percentage <= threshold;
        },
    });
};
/**
 * Fast, non-cryptographic hash function.
 *
 * All credits go to Perezd's node-murmurhash.
 *
 * @see https://en.wikipedia.org/wiki/MurmurHash
 * @see https://github.com/perezd/node-murmurhash
 */
export function murmurHash(key, seed) {
    if (typeof key === "string")
        key = new TextEncoder().encode(key);
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
