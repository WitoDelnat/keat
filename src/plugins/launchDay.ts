import { createPlugin, isDate } from "../core";

export const launchDay = () => {
  createPlugin({
    matcher: isDate,
    evaluate({ literal }) {
      return literal.getTime() < Date.now();
    },
  });
};
