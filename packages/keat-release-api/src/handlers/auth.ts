import { Code, ConnectError, MethodImpl } from '@connectrpc/connect'
import { KeatService } from '__codegen__/keat/core/v1/core_connect'
import { createAuthKey } from 'utils/auth'
import { expandContext } from 'utils/context'

type Handler = MethodImpl<typeof KeatService.methods.auth>

export const auth: Handler = async (req, ctx) => {
    const { storage, authSecret } = expandContext(ctx)

    try {
        const key = await createAuthKey(req.appId, req.password, authSecret)
        const keatDoc = await storage.get(`${req.appId}/${key}.json`)

        if (!keatDoc) {
            throw new ConnectError('forbidden', Code.Unauthenticated)
        }

        return { key }
    } catch (err) {
        if (err instanceof ConnectError) {
            throw err
        }
        throw new ConnectError('cannot update app', Code.Internal)
    }
}
