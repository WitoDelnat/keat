import { createPlugin, isString, User } from "../core";

type AudienceFn = (user: User) => boolean | undefined;

export const audience = (name: string, fn: AudienceFn) => {
  return createPlugin({
    matcher: isString,
    evaluate({ literal, user }) {
      if (!user || literal !== name) return false;

      try {
        return fn(user) ?? false;
      } catch {
        return false;
      }
    },
  });
};
