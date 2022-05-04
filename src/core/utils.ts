/**
 * Utility which transforms an environment variable into one or multiple audiences.
 *
 * @example
 * fromEnv(process.env.ENABLE_UI_TO)
 *
 * `ENABLE_UI_TO=everyone` // 'everyone'
 * `ENABLE_UI_TO=developers, 5` // `['developers', 5]`
 */
export function fromEnv(value?: string) {
  if (!value) return undefined;
  return value
    .split(",")
    .map((v) => v.trim())
    .map((v) => {
      if (v === "true") return true;
      const parsed = parseInt(v);
      return parsed === NaN ? v : parsed;
    });
}
