import {createPlugin} from "../plugin";
import {isDate} from "../matchers";

export const launchDay = () => {
  createPlugin({
    matcher: isDate,
    evaluate({ literal }) {
      return literal.getTime() < Date.now();
    },
  });
};
