import { Rule } from "./types";

/**
 * Utility which transforms an environment variable into a properly typed array.
 *
 * @example
 * fromEnv(process.env.ENABLE_UI_TO)
 *
 * `ENABLE_UI_TO=true` // enabled
 * `ENABLE_UI_TO=developers,5` // `['developers', 5]`
 */

/**
 * Retrieve the identifier of a user.
 */
export const DEFAULT_GET_USER_ID = (user: any) => {
  return user["id"] ?? user["sub"] ?? user["email"];
};

/**
 * Create a user from an identifier.
 */
export const DEFAULT_CREATE_USER = (id: string) => ({ id });

export function takeStrings(rule: Rule): string[] {
  if (typeof rule === "string") return [rule];
  if (typeof rule !== "object") return [];
  const arr = mutable(rule["OR"]) ?? [];
  return arr.filter((a): a is string => typeof a === "string");
}

export function takeNumbers(rule: Rule): number[] {
  if (typeof rule === "number") return [rule];
  if (typeof rule !== "object") return [];
  const arr = mutable(rule["OR"]) ?? [];
  return arr.filter((a): a is number => typeof a === "number");
}

export function takeBooleans(rule: Rule): boolean[] {
  if (typeof rule === "boolean") return [rule];
  if (typeof rule !== "object") return [];
  const arr = mutable(rule["OR"]) ?? [];
  return arr.filter((a): a is boolean => typeof a === "boolean");
}

export function mutable<T>(x?: readonly T[]): T[] | undefined {
  return x as T[];
}
