/**
 * Utility which represents a boolean flag.
 */
export const booleanFlag = [true, false];

/**
 * Utility which transforms an environment variable into a properly typed array.
 *
 * @example
 * fromEnv(process.env.ENABLE_UI_TO)
 *
 * `ENABLE_UI_TO=true` // enabled
 * `ENABLE_UI_TO=developers,5` // `['developers', 5]`
 */
export function fromEnv(value?: string) {
  if (!value) return undefined;
  return value
    .split(",")
    .map((v) => v.trim())
    .map((v) => {
      if (v === "true") return true;
      const parsed = parseInt(v);
      return isNaN(parsed) ? v : parsed;
    });
}

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
