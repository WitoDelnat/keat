import { isNone } from "./matchers";
export function createPlugin(plugin) {
    return plugin;
}
export function createNopPlugin() {
    return {
        matcher: isNone,
    };
}
