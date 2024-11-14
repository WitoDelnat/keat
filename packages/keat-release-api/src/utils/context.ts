import {
    ContextKey,
    ContextValues,
    createContextKey,
    createContextValues as connectCreateContextValues,
    HandlerContext,
} from '@connectrpc/connect'

type Writeable<T> = { -readonly [P in keyof T]: T[P] }
export type Context = Writeable<{
    [Property in keyof typeof contextkeys]: (typeof contextkeys)[Property] extends ContextKey<
        infer T
    >
        ? T
        : unknown
}>

export const contextkeys = {
    appKey: createContextKey<string | null>(null),
    storage: createContextKey<Env['BUCKET']>(undefined as any),
    authSecret: createContextKey<Env['AUTH_SECRET']>(undefined as any),
} as const satisfies Record<string, ContextKey<any>>

export function expandContext(ctx: HandlerContext): Context {
    const result: any = {}
    for (const [k, ck] of Object.entries(contextkeys)) {
        result[k] = ctx.values.get<any>(ck)
    }
    return result
}

export function createContextValues(ctx: Context): ContextValues {
    const values = connectCreateContextValues()
    for (const [k, ck] of Object.entries(contextkeys)) {
        values.set(ck, (ctx as any)[k])
    }
    return values
}
