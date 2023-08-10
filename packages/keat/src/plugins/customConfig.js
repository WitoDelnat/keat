import { createPlugin } from "../plugin";
import { isNone } from "../matchers";
const DEFAULT_OPTIONS = {
    retries: 3,
};
export const customConfig = (rawOptions) => {
    const options = { ...DEFAULT_OPTIONS, ...rawOptions };
    return createPlugin({
        onPluginInit: async (_ctx, { setConfig }) => {
            let timeout = 50;
            for (let i = 0; i < options.retries; i++) {
                try {
                    const remoteConfig = await options.fetch();
                    setConfig(remoteConfig);
                    break;
                }
                catch (err) {
                    timeout = timeout * 2;
                    await new Promise((r) => setTimeout(r, timeout));
                }
            }
        },
        matcher: isNone,
    });
};
