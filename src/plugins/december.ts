import { createPlugin, isString } from "../core";

export const december = createPlugin({
  matcher: isString,
  evaluate({ literal }) {
    if (literal !== "december") return false;
    return new Date().getMonth() === 11;
  },
});
