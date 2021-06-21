import { isArray } from "lodash";

/**
 * Utility which transforms an environment variable into one or multiple audiences.
 *
 * @example
 * fromEnv(process.env.ENABLE_UI_TO)
 *
 * `ENABLE_UI_TO=everyone` // 'everyone'
 * `ENABLE_UI_TO=developers,canary` // `['developers', 'canary']`
 * `ENABLE_UI_TO=` // `"nobody"`
 */
export function fromEnv<FName extends string = string>(
  value: string | undefined,
  fallback?: string | string[]
): FName[] {
  return (value
    ? value.split(",").map((v) => v.trim())
    : fallback
    ? normalise(fallback)
    : ["nobody"]) as unknown as FName[];
}

export function normalise(value: string | string[] | undefined): string[] {
  return value ? (isArray(value) ? value : [value]) : [];
}
