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

export type Literal = boolean | string | number
export type Rule = { OR: readonly Literal[] } | Literal
export type AnyFeatures = Record<string, Rule>

export type AudienceFn = (ctx?: Context) => boolean

export type Config = {
    features?: Record<string, Rule | Rule[] | undefined>
    audiences?: Record<string, AudienceFn | Array<string | number>>
}

export type RemoteConfig = {
    f: Record<string, Rule | Rule[] | undefined>
    a: Record<string, Array<string | number>>
}

export type KeatInit<TFeatures extends AnyFeatures> = {
    features: TFeatures
    audiences?: any
    display?: Display
}

export type KeatApi<TFeatures extends AnyFeatures> = {
    app: string
    features: string[]
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
