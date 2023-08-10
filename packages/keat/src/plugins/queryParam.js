import { createPlugin } from "../plugin";
import { isString } from "../matchers";
export const queryParam = (name, { key, value } = {}) => {
    return createPlugin({
        matcher: isString,
        evaluate({ literal }) {
            if (literal !== name || typeof window === "undefined")
                return false;
            const queryString = window.location.search;
            const params = new URLSearchParams(queryString);
            return value
                ? params.get(key ?? name) === value
                : params.has(key ?? name);
        },
    });
};
