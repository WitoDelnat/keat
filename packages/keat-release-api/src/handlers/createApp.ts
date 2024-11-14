import { Code, ConnectError, MethodImpl } from '@connectrpc/connect'
import { KeatService } from '__codegen__/keat/core/v1/core_connect'
import { App } from 'types'
import { createAuthKey } from 'utils/auth'
import { compile } from 'utils/compile'
import { expandContext } from 'utils/context'
import { generateId } from 'utils/general'
import { store } from 'utils/store'

type Handler = MethodImpl<typeof KeatService.methods.createApp>

export const createApp: Handler = async (req, ctx) => {
    const { storage, authSecret } = expandContext(ctx)

    try {
        const id = generateId()
        const key = await createAuthKey(id, req.password, authSecret)

        const app: App = {
            name: req.name,
            cohorts: [],
            features: req?.feature ? [{ name: req.feature, cohorts: [] }] : [],
        }

        await store(storage, { id, key, app })

        return { id, key }
    } catch (err) {
        console.log('cannot create app', {
            err: err instanceof Error ? err.message : err,
        })
        if (err instanceof ConnectError) {
            throw err
        }
        throw new ConnectError('cannot create app', Code.Internal)
    }
}
