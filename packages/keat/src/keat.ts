import { load } from './display'
import type {
    AnyFeatures,
    Config,
    Display,
    KeatApi,
    KeatInit,
    Context,
    RemoteConfig,
} from './types'
import { hash } from './utils/hash'

export type ExtractFeatures<K> = K extends KeatApi<infer K> ? keyof K : never

export type Listener = (config?: Config) => void
export type Unsubscribe = () => void

export function keatCore<TFeatures extends AnyFeatures>(
    appId: string,
    init: KeatInit<TFeatures>
): KeatApi<TFeatures> {
    const appHash = hash(appId)
    let ctx: Context | undefined = undefined
    let config: Config = init as Config

    let listeners: Listener[] = []
    const handleChange = () => {
        listeners.forEach((l) => l(config))
    }
    const doSetConfig = (c: Config | RemoteConfig) => {
        config = merge(config, c)
        handleChange()
    }

    const doFetch = async () => {
        try {
            const response = await fetch(`http://localhost:8787/${appId}?flags`)
            if (!response.ok) return
            const remoteConfig = await response.json()
            doSetConfig(remoteConfig)
        } catch {}
    }
    let loader = load(doFetch())

    const doEval = (feature: string, ctx?: Context): boolean => {
        try {
            const rule = config.features?.[feature] ?? false
            if (typeof rule === 'boolean') return rule
            if (typeof rule === 'number')
                return rollout(feature, getId(ctx), rule)
            if (typeof rule !== 'string') return false
            // Audiences
            if (rule.startsWith('@')) {
                const audience = config.audiences?.[rule.substring(1)]
                if (audience) {
                    if (typeof audience === 'function') {
                        return audience(ctx)
                    }
                    if (Array.isArray(audience)) {
                        return defaultAudienceFn(ctx, audience, appHash)
                    }
                    return false
                }
            }
            // TODO: Dates
            // TODO: Query params
            return false
        } catch {
            return false
        }
    }

    const api: KeatApi<TFeatures> = {
        app: appId,
        features: Object.keys(config.features ?? {}),
        get: <TFeature extends keyof TFeatures>(
            feature: TFeature,
            context?: Context
        ) => {
            return doEval(feature as string, context ?? ctx)
        },
        ready: (display: Display = init.display ?? 'block') => {
            return loader.ready(display)
        },
        setConfig: (config: Config) => {
            doSetConfig(config)
        },
        setContext: (context?: Context) => {
            ctx = context
        },
        onChange: (listener: Listener): Unsubscribe => {
            listeners.push(listener)
            return () => {
                listeners = listeners.filter((l) => l === listener)
            }
        },
        reload: () => {
            return new Promise<void>((r) =>
                doFetch()
                    .catch(() => {})
                    .finally(() => r())
            )
        },
    }

    ;(globalThis as any).__keat = { apps: [api] }

    return api
}

function merge(c1: Config, c2: Config | RemoteConfig): Config {
    if ('f' in c2) {
        return {
            features: { ...c1.features, ...c2.f },
            audiences: { ...c1.audiences, ...c2.a },
        }
    } else {
        return {
            features: { ...c1.features, ...c2.features },
            audiences: { ...c1.audiences, ...c2.audiences },
        }
    }
}

function rollout(feature: string, id: string | undefined, threshold: number) {
    if (!id) return false
    const seed = hash(feature)
    const percentage = (hash(id, seed) % 100) + 1
    return percentage <= threshold
}

function defaultAudienceFn(
    ctx: Context | undefined,
    items: Array<string | number>,
    appHash: number
): boolean {
    if (!ctx) return false
    let h: number | undefined = undefined
    const id = getId(ctx)
    for (const i of items) {
        if (typeof i === 'string') {
            return i === id
        } else {
            if (h === undefined) {
                h = hash(getId(ctx), appHash)
            }
            return i === h
        }
    }
    return false
}

function getId(ctx?: Context) {
    return ctx?.email ?? ctx?.sub ?? ctx?.id
}
