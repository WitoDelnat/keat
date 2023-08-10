import { createPlugin } from "../plugin";
const DEFAULT_OPTIONS = {
    retries: 3,
};
export const remoteConfig = (url, rawOptions) => {
    const options = { ...DEFAULT_OPTIONS, ...rawOptions };
    const fetchConfig = async (url) => {
        let timeout = 100;
        for (let i = 0; i < options.retries; i++) {
            try {
                const response = await fetch(url);
                if (!response.ok)
                    throw new Error("fetch failed");
                const remoteConfig = await response.json();
                return remoteConfig;
            }
            catch (err) {
                timeout = timeout * 2;
                await pause(timeout);
            }
        }
    };
    const backgroundTask = async (interval, setConfig) => {
        try {
            while (true) {
                await pause(interval * 1000);
                const remoteConfig = await fetchConfig(url);
                setConfig(remoteConfig);
            }
        }
        catch {
            return;
        }
    };
    return createPlugin({
        onPluginInit: async (_ctx, { setConfig }) => {
            const remoteConfig = await fetchConfig(url);
            setConfig(remoteConfig);
            if (options.interval !== undefined) {
                backgroundTask(options.interval, setConfig);
            }
        },
        matcher: (literal) => literal,
        evaluate: () => false,
    });
};
function pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
