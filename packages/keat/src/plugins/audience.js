import { createPlugin } from "../plugin";
import { isString } from "../matchers";
export const audience = (name, fn) => {
    return createPlugin({
        matcher: isString,
        evaluate({ literal, user }) {
            if (!user || literal !== name)
                return false;
            try {
                return fn(user) ?? false;
            }
            catch {
                return false;
            }
        },
    });
};
