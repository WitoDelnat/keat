import { createPlugin, isDate } from "../core";

export const lauchDay = () => {
  createPlugin({
    matcher: isDate,
    evaluate({ literal }) {
      return literal.getTime() < Date.now();
    },
  });
};
