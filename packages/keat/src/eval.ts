import { Aud, ConfigN, Context } from './types'
import { hash } from './utils/hash'

export function evaluate(
    cfg: ConfigN,
    feature: string,
    ctx?: Context
): boolean {
    try {
        const auds = cfg.features[feature] ?? []
        return auds.some((a) => evalAud(cfg.audiences[a], feature, ctx))
    } catch {
        return false
    }
}

export function evalAud(
    aud: Aud | undefined,
    feature: string,
    ctx?: Context
): boolean {
    if (!aud) {
        return false
    }
    if (aud.kind === 'toggle') {
        return aud.value
    }
    if (aud.kind === 'group') {
        return defaultAudienceFn(ctx, aud.values)
    }
    if (aud.kind === 'rollout') {
        return rollout(feature, getId(ctx), aud.percentage)
    }
    return false
}

function rollout(feature: string, id: string | undefined, threshold: number) {
    if (!id) return false
    const seed = hash(feature)
    const percentage = (hash(id, seed) % 100) + 1
    return percentage <= threshold
}

function defaultAudienceFn(
    ctx: Context | undefined,
    items: (string | number)[]
): boolean {
    if (!ctx) return false
    let h: number | undefined = undefined
    const id = getId(ctx)
    for (const i of items) {
        if (typeof i === 'string') {
            return i === id
        } else {
            if (h === undefined) {
                h = hash(getId(ctx))
            }
            return i === h
        }
    }
    return false
}

function getId(ctx?: Context) {
    return ctx?.email ?? ctx?.sub ?? ctx?.id
}
