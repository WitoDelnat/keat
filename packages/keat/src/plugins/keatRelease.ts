import { createPlugin } from '../plugin'
import { isNone } from '../matchers'

export const keatRelease = (appId: string) => {
    const fetchConfig = async (url: string) => {
        let timeout = 100
        for (let i = 0; i < 3; i++) {
            try {
                const response = await fetch(url)

                if (!response.ok) throw new Error('fetch failed')

                return await response.json()
            } catch (err) {
                timeout = timeout * 2
                await pause(timeout)
            }
        }
    }

    return createPlugin({
        onPluginInit: async (_ctx, { setConfig }) => {
            const url = `https://sync.keat.app/${appId}/flags`
            const remoteConfig = await fetchConfig(url)
            setConfig(remoteConfig)
        },
        matcher: isNone,
    })
}

function pause(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
