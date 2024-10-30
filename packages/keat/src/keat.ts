import { load } from './display'
import type {
    AnyFeatures,
    Config,
    Display,
    KeatApi,
    KeatInit,
    Context,
    RemoteConfig,
    Rule,
    Aud,
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
            const audiences = normalise(config.features?.[feature] ?? false)
            const rules = audiences
                .map((a) => config.audiences?.[a])
                .map(normaliseAudience)
                .filter(isDefined)
            for (const r of rules) {
                if (r.kind === 'toggle') {
                    const m = r.value
                    if (m) {
                        return true
                    } else continue
                }
                if (r.kind === 'group') {
                    const m = defaultAudienceFn(ctx, r.values, appHash)
                    if (m) {
                        return true
                    } else continue
                }
                if (r.kind === 'rollout') {
                    const m = rollout(feature, getId(ctx), r.percentage)
                    if (m) {
                        return true
                    } else continue
                }
            }
            return false
        } catch {
            return false
        }
    }

    const api: KeatApi<TFeatures> = {
        app: appId,
        features: Object.keys(config.features ?? {}),
        audiences: Object.keys(config.audiences ?? {}),
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

function isDefined<T>(value: T | null | undefined): value is T {
    return value !== undefined && value !== null
}

function normalise(v: boolean | string | string[]): string[] {
    return typeof v === 'boolean'
        ? v
            ? ['everyone']
            : []
        : typeof v === 'string'
        ? [v]
        : v
}

function normaliseAudience(
    a?: Rule | string | string[] | number | number[]
): Aud | undefined {
    if (!a) return undefined
    if (typeof a === 'number') {
        return { kind: 'rollout', percentage: a }
    }
    if (Array.isArray(a)) {
        return { kind: 'group', values: a }
    }
    return undefined
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
    items: (string | number)[],
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
