import { User } from "../types";
type RolloutsPluginOptions = {
    getUserId?: (user: User) => string;
    hash?: HashFn;
};
type HashFn = (userId: string, feature: string) => number;
export declare const rollouts: (options?: RolloutsPluginOptions) => import("../plugin").Plugin<import("../matchers").Matcher<number>>;
/**
 * Fast, non-cryptographic hash function.
 *
 * All credits go to Perezd's node-murmurhash.
 *
 * @see https://en.wikipedia.org/wiki/MurmurHash
 * @see https://github.com/perezd/node-murmurhash
 */
export declare function murmurHash(key: string | Uint8Array, seed: number): number;
export {};
