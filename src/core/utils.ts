import { AnyFeatures, Config, Feature, Literal, Rule } from "./types";

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

export function getVariatesMap(
  features: Record<string, Feature>
): Record<string, any[]> {
  const names = Object.keys(features);
  const entries = names.map((name) => [name, getVariates(features, name)]);
  return Object.fromEntries(entries);
}

export function getVariates(features: AnyFeatures, name: string): any[] {
  const feat = features[name];
  return typeof feat === "object" && "variates" in feat
    ? mutable(feat.variates) ?? [true, false]
    : [true, false];
}

export function getRules(
  features: AnyFeatures,
  config: Config,
  name: string,
  configId: number
): Rule[] | undefined {
  const feat = features[name];
  const remote = config[name];
  const local = isRule(feat) ? feat : (feat["when"] as Rule | Rule[]);
  return configId === 0 ? normalize(local) : normalize(remote ?? local);
}

function isRule(x: unknown): x is Rule {
  return (
    typeof x === "boolean" ||
    typeof x === "string" ||
    typeof x === "number" ||
    (typeof x === "object" && x !== null && "OR" in x)
  );
}

export function isLiteral(rule: Rule): rule is Literal {
  const t = typeof rule;
  return t === "string" || t === "number" || t === "boolean";
}

function normalize(rule: Rule | Rule[] | undefined): Rule[] | undefined {
  return Array.isArray(rule) ? rule : rule === undefined ? undefined : [rule];
}

export function flagsToConfig(
  flags: Record<string, any>,
  variates: Record<string, any[]>
): Config {
  const config: Config = {};

  for (const [feature, variate] of Object.entries(flags)) {
    const variations = variates[feature];
    if (!variations) continue;
    const rule = variations.map((v) => v === variate);
    const isFalse = rule.length === 2 && rule[0] === false;
    const isTrue = rule.length === 2 && rule[0] === true;
    const simplifiedRule = isFalse ? false : isTrue ? true : rule;
    config[feature] = simplifiedRule;
  }

  return config;
}
