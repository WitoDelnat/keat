import { load } from './display'
import { evaluate } from './eval'

import type {
    AnyFeatures,
    Config,
    ConfigN,
    Context,
    Display,
    KeatApi,
    KeatInit,
    Listener,
    Unsubscribe,
} from './types'
import { normalise, normaliseFetch } from './utils/normalise'

export function fromEnv(s: string): string[] {
    return s.split(',').map((s) => s.trim())
}

export function createKeat<TFeatures extends AnyFeatures>(
    init: KeatInit<TFeatures>
): KeatApi<TFeatures> {
    let cfg: Config, cfgn: ConfigN, ctx: Context | undefined
    let listeners: Listener[] = []

    const configure = (c: Config) => {
        cfg = merge(cfg, c)
        cfgn = normalise(cfg)
        listeners.forEach((l) => l())
    }

    configure(init)
    const fetcher = normaliseFetch(init.fetch)
    const loader = load(fetcher?.().then(configure).catch(nop))

    const api: KeatApi<TFeatures> = {
        get appId() {
            if (typeof init.fetch !== 'string') {
                return undefined
            }
            const matches = /^https?\:\/\/.*\/(.*)\/feature-flags.json$/.exec(
                init.fetch
            )
            return matches?.[1] ?? init.fetch
        },
        get config() {
            return cfg
        },
        set config(newConfig: Config) {
            configure(newConfig)
        },
        identify(context: Context) {
            ctx = context
        },
        ready: (display: Display = 'block') => {
            return loader.ready(display)
        },
        get: <TFeature extends keyof TFeatures>(
            feature: TFeature,
            context?: Context
        ) => {
            return evaluate(cfgn, feature as string, context ?? ctx)
        },
        onChange: (listener: Listener): Unsubscribe => {
            listeners.push(listener)
            return () => {
                listeners = listeners.filter((l) => l === listener)
            }
        },
        refresh() {
            fetcher?.().then(configure).catch(nop)
        },
    }

    ;(globalThis as any).__keat = { apps: [api] }

    return api
}

const nop = () => {}

function merge(c1: Config, c2: Config): Config {
    return {
        features: { ...(c1?.features ?? {}), ...(c2?.features ?? {}) },
        cohorts: { ...(c1?.cohorts ?? {}), ...(c2?.cohorts ?? {}) },
    }
}
