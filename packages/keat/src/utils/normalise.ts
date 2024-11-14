import { Cohort, Config, ConfigN, Fetcher } from '../types'

const DEFAULT_COHORTS: Record<string, Cohort> = {
    everyone: { strategy: 'toggle', value: true },
    nobody: { strategy: 'toggle', value: false },
}

export function normalise(c: Config): ConfigN {
    return {
        features: Object.fromEntries(
            Object.entries(c.features).map(([k, v]) => [k, normaliseToggle(v)])
        ),
        cohorts: {
            ...DEFAULT_COHORTS,
            ...Object.fromEntries(
                Object.entries(c.cohorts ?? {}).map(([k, v]) => [
                    k,
                    normaliseCohort(v),
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

function normaliseCohort(
    c?: string | string[] | number | Cohort
): Cohort | undefined {
    if (!c) return undefined
    if (typeof c === 'number') {
        return { strategy: 'rollout', percentage: c }
    }
    if (Array.isArray(c)) {
        return { strategy: 'group', targets: c }
    }
    return undefined
}
