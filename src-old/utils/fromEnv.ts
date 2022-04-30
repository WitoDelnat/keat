import { isArray } from "lodash";

/**
 * Utility which transforms an environment variable into one or multiple audiences.
 *
 * @example
 * fromEnv(process.env.ENABLE_UI_TO)
 *
 * `ENABLE_UI_TO=everyone` // 'everyone'
 * `ENABLE_UI_TO=developers, 5` // `['developers', 5]`
 * `ENABLE_UI_TO=` // `"nobody"`
 */
export function fromEnv<FName extends string = string>(
  value: string | undefined,
  fallback?: number | string | (number | string)[]
): any[] {
  return (value
    ? value
        .split(",")
        .map((v) => v.trim())
        .map(maybeParseInt)
    : fallback
    ? normalise(fallback)
    : ["nobody"]) as unknown as FName[];
}

function maybeParseInt(v: string): number | string {
  const parsed = parseInt(v);
  return parsed === NaN ? v : parsed;
}

export function normalise(
  value: number | string | (number | string)[] | undefined
): Array<number | string> {
  return value ? (isArray(value) ? value : [value]) : [];
}
