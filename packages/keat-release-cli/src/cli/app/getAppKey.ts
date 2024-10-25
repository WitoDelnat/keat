import { getStore } from '../utils/store.cjs'
import { authenticate } from './authenticate'

/**
 *
 * Use value from --key if present.
 * Use value from KEAT_APP_KEY if present
 * Check xdg/keat/keat.yaml and look for entry matching the app id.
 */
type Params = {
    options?: Record<string, string>
    envs?: Record<string, string>
    fromKeatStore?: boolean
}

export async function getAppKey(
    appId?: string,
    { options, envs, fromKeatStore = true }: Params = {}
): Promise<string | undefined> {
    if (!appId) {
        return undefined
    }
    if (options?.['key']) {
        return options['key']
    }

    if (envs?.['KEAT_APP_KEY']) {
        return envs['KEAT_APP_KEY']
    }

    if (fromKeatStore) {
        try {
            const store = await getStore()
            const apps = store?.apps ?? []
            for (const app of apps) {
                if (app.id == appId) {
                    return app.key
                }
            }
        } catch {}
    }

    return undefined
}

export async function getAppKeyOrAuthenticate(
    appId?: string,
    { options, envs, fromKeatStore = true }: Params = {}
): Promise<string> {
    if (!appId) {
        throw new Error('expected app id')
    }
    if (options?.['key']) {
        return options['key']
    }

    if (envs?.['KEAT_APP_KEY']) {
        return envs['KEAT_APP_KEY']
    }

    if (fromKeatStore) {
        try {
            const store = await getStore()
            const apps = store?.apps ?? []
            for (const app of apps) {
                if (app.id == appId) {
                    return app.key
                }
            }
        } catch {}
    }

    return authenticate(appId)
}
