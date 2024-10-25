import { Context as HonoContext } from 'hono'

export type Bindings = {
    BUCKET: R2Bucket
}

export type Env = { Bindings: Bindings }
export type Context = HonoContext<Env, any, any>
