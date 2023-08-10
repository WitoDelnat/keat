import { createPlugin } from "../plugin";
export const localConfig = (config) => {
    return createPlugin({
        onPluginInit: async (_ctx, { setConfig }) => {
            setConfig(config);
        },
        matcher: (literal) => literal,
        evaluate: () => false,
    });
};
export function fromEnv(value) {
    if (!value)
        return undefined;
    const data = value
        .split(",")
        .map((v) => v.trim())
        .map((v) => {
        if (v === "true")
            return true;
        const parsed = parseInt(v);
        return isNaN(parsed) ? v : parsed;
    });
    if (data.length === 1)
        return data[0];
    return { OR: data };
}
