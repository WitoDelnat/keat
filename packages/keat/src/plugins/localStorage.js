import { createNopPlugin, createPlugin } from "../plugin";
import { isString } from "../matchers";
export const localStorage = (name, { key, value, poll = false } = {}) => {
    const hasLocalStorage = typeof window !== "undefined" && window.localStorage;
    const hasSetInterval = typeof window !== "undefined" && window.setInterval;
    if (!hasLocalStorage || !hasSetInterval)
        return createNopPlugin();
    const pollInterval = poll === true ? 2000 : typeof poll === "number" && poll > 0 ? poll : 0;
    const k = key ?? name;
    let item;
    return createPlugin({
        onPluginInit(_, { onChange }) {
            item = window.localStorage.getItem(k);
            if (pollInterval > 0) {
                setInterval(() => {
                    const newItem = window.localStorage.getItem(k);
                    const hasChanged = item !== newItem;
                    item = newItem;
                    if (hasChanged)
                        onChange();
                }, pollInterval);
            }
        },
        matcher: isString,
        evaluate({ literal }) {
            if (literal !== name)
                return false;
            return value ? item === value : Boolean(item);
        },
    });
};
