import { Aud, Config, ConfigN, Fetcher, Rule } from '../types'

const DEFAULT_AUDS: Record<string, Aud> = {
    everyone: { kind: 'toggle', value: true },
    nobody: { kind: 'toggle', value: false },
}

export function normalise(c: Config): ConfigN {
    return {
        features: Object.fromEntries(
            Object.entries(c.features).map(([k, v]) => [k, normaliseToggle(v)])
        ),
        audiences: {
            ...DEFAULT_AUDS,
            ...Object.fromEntries(
                Object.entries(c.audiences ?? {}).map(([k, v]) => [
                    k,
                    normaliseAudience(v),
                ])
            ),
        },
    }
}

function normaliseToggle(v: boolean | string | string[]): string[] {
    return typeof v === 'boolean'
        ? v
            ? ['everyone']
            : []
        : typeof v === 'string'
        ? [v]
        : v
}

export function normaliseFetch(
    x?: string | URL | Fetcher
): Fetcher | undefined {
    if (!x) return undefined
    if (typeof x === 'function') {
        return x
    }

    const url =
        x instanceof URL
            ? x
            : x.startsWith('http://') || x.startsWith('https://')
            ? new URL(x)
            : new URL(x, 'https://flags.keat.app')

    return () => fetch(url).then((r) => r.json())
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
