import { Listener, Unsubscribe } from './keat'

/**
 * Bring your own user with declaration merging:
 *
 * @example
 * ```
 * declare module 'keat' {
 *   interface CustomTypes {
 *     user: { name: string, email: string, developerPreview: boolean }
 *   }
 * }
 * ```
 */
export interface CustomTypes {
    // user: ...
}

export type Context = CustomTypes extends { user: infer T }
    ? T
    : ({ id: string } | { sub: string } | { email: string }) &
          Record<string, any>

/* * * * * * * * * * * * *
 * API
 * * * * * * * * * * * * */
export type Display = 'block' | 'swap' | 'fallback' | 'optional'

export type Rule = string | string[] | number | number[] | Aud
export type Aud = Toggle | Group | Rollout
export type BaseAud = { kind: string }
export type Toggle = BaseAud & {
    kind: 'toggle'
    value: boolean
}
export type Group = BaseAud & {
    kind: 'group'
    values: (string | number)[]
    key?: string
}
export type Rollout = BaseAud & {
    kind: 'rollout'
    percentage: number
}
export type AnyAudience = Record<string, Rule>

export type Audience = string
export type AnyFeatures = Record<string, boolean | Audience | Audience[]>
export type NrmFeatures = Record<string, string[]>

export type Config = {
    app?: string
    audiences?: Record<string, Rule>
    features?: Record<string, boolean | Audience | Audience[]>
}

export type RemoteConfig = {
    f: Record<string, boolean | string[]>
    a: Record<string, Audience | string[] | string | number[] | number>
}

export type KeatInit<TFeatures extends AnyFeatures> = {
    features: TFeatures
    audiences?: any
    display?: Display
}

export type KeatApi<TFeatures extends AnyFeatures> = {
    app: string
    features: string[]
    audiences: string[]
    get<TFeature extends keyof TFeatures>(
        feature: TFeature,
        context?: Context,
        display?: Display
    ): boolean

    onChange(listener: Listener): Unsubscribe
    ready(display?: Display): Promise<void>
    setContext(context?: Context): void
    setConfig(config: Config): void
    reload(): Promise<void>
}
