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

export type ExtractFeatures<K> = K extends KeatApi<infer K> ? keyof K : never
export type Listener = () => void
export type Unsubscribe = () => void

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

export type Config<TFeatures extends AnyFeatures = AnyFeatures> = {
    features: TFeatures
    audiences?: Record<string, Rule>
}

export type ConfigN = {
    features: Record<string, string[] | undefined>
    audiences: Record<string, Aud | undefined>
}

export type Fetcher = () => Promise<Config>

export type KeatInit<TFeatures extends AnyFeatures = AnyFeatures> = {
    fetch?: string | URL | Fetcher
} & Config<TFeatures>

export type KeatApi<TFeatures extends AnyFeatures> = {
    config: Config
    identify(ctx?: Context): void
    ready(display?: Display): Promise<void>
    onChange(listener: Listener): Unsubscribe

    get<TFeature extends keyof TFeatures>(
        feature: TFeature,
        identity?: Context,
        display?: Display
    ): boolean
}
