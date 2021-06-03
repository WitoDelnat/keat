/**
 * Bring your own user with declaration merging:
 *
 * @example
 * ```
 * declare module 'keat-node' {
 *   interface KeatNode {
 *     user: { name: string, email: string }
 *   }
 * }
 * ```
 *
 * @remark Currently only Record<string, string | boolean | number> is allowed.
 */
export interface KeatNode {
  // user: ...
}

export type User = KeatNode extends { user: infer T } ? T : string;
export type UserKey = User extends string ? {} : { key: keyof User };
export type InternalUser =
  | string
  | Record<string, string | boolean | number | undefined>;
