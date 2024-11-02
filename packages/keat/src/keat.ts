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

    return {
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
    }
}

const nop = () => {}

function merge(c1: Config, c2: Config): Config {
    return {
        features: { ...(c1?.features ?? {}), ...(c2?.features ?? {}) },
        audiences: { ...(c1?.audiences ?? {}), ...(c2?.audiences ?? {}) },
    }
}
