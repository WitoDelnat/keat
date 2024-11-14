import { Cohort, ConfigN, Context } from './types'
import { hashSync } from './utils/hash'

export function evaluate(
    cfg: ConfigN,
    feature: string,
    ctx?: Context
): boolean {
    try {
        const cohorts = cfg.features[feature] ?? []
        for (const c of cohorts) {
            const r = evalCohort(cfg.cohorts[c], feature, ctx)
            if (r) return r
        }
        return false
    } catch {
        return false
    }
}

export function evalCohort(
    cohort: Cohort | undefined,
    feature: string,
    ctx?: Context
): boolean {
    if (!cohort) {
        return false
    }
    if (cohort.strategy === 'toggle') {
        return cohort.value
    }
    if (cohort.strategy === 'group') {
        return defaultAudienceFn(ctx, cohort.targets)
    }
    if (cohort.strategy === 'rollout') {
        return rollout(feature, getId(ctx), cohort.percentage)
    }
    return false
}

function rollout(
    feature: string,
    id: string | undefined,
    threshold: number
): boolean {
    if (!id) return false
    const h = hashSync(`${feature}-${id}`)
    const percentage = (parseInt(h.substring(0, 16), 16) % 100) + 1
    return percentage <= threshold
}

function defaultAudienceFn(ctx: Context | undefined, items: string[]): boolean {
    if (!ctx) return false
    let h: string | undefined = undefined
    const id = getId(ctx)
    const hashed = items.every((s) => s.length === 64)
    for (const i of items) {
        if (!hashed) {
            return i === id
        } else {
            if (h === undefined) {
                h = hashSync(getId(ctx))
            }
            return i === h
        }
    }
    return false
}

function getId(ctx?: Context) {
    return ctx?.email ?? ctx?.sub ?? ctx?.id
}
