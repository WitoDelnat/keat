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

export type Cohort = Toggle | Group | Rollout
export type BaseCohort = { strategy: string }
export type Toggle = BaseCohort & {
    strategy: 'toggle'
    value: boolean
}
export type Group = BaseCohort & {
    strategy: 'group'
    targets: string[]
    key?: string
}
export type Rollout = BaseCohort & {
    strategy: 'rollout'
    percentage: number
}

export type AnyCohort = Record<string, number | string | string[] | Cohort>
export type NrmCohort = Record<string, Cohort | undefined>

export type AnyFeatures = Record<string, boolean | string | string[]>
export type NrmFeatures = Record<string, string[] | undefined>

export type Config<TFeatures extends AnyFeatures = AnyFeatures> = {
    features: TFeatures
    cohorts?: AnyCohort
}

export type ConfigN = {
    features: NrmFeatures
    cohorts: NrmCohort
}

export type Fetcher = () => Promise<Config>

export type KeatInit<TFeatures extends AnyFeatures = AnyFeatures> = {
    fetch?: string | URL | Fetcher
} & Config<TFeatures>

export type KeatApi<TFeatures extends AnyFeatures> = {
    config: Config
    identify(ctx?: Context): void
    onChange(listener: Listener): Unsubscribe

    appId?: string
    ready(display?: Display): Promise<void>
    refresh(): void

    get<TFeature extends keyof TFeatures>(
        feature: TFeature,
        identity?: Context,
        display?: Display
    ): boolean
}
