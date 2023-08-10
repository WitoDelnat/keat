import { createPlugin } from "../plugin";
import { isNone } from "../matchers";
export const keatRelease = (appId) => {
    const fetchConfig = async (url) => {
        let timeout = 100;
        for (let i = 0; i < 3; i++) {
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
    return createPlugin({
        onPluginInit: async (_ctx, { setConfig }) => {
            const url = `https://sync.keat.cloud/${appId}/flags`;
            const remoteConfig = await fetchConfig(url);
            setConfig(remoteConfig);
        },
        matcher: isNone,
    });
};
function pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
