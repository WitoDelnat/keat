import { Code, ConnectError, MethodImpl } from '@connectrpc/connect'
import { KeatService } from '__codegen__/keat/core/v1/core_connect'
import { expandContext } from 'utils/context'

type Handler = MethodImpl<typeof KeatService.methods.deleteApp>

export const deleteApp: Handler = async (req, ctx) => {
    const { storage, appKey } = expandContext(ctx)

    try {
        const d = await storage.head(`${req.appId}/${appKey}.json`)
        if (d === null) {
            throw new ConnectError('not found', Code.NotFound)
        }

        await Promise.all([
            storage.delete(`${req.appId}/${appKey}.json`),
            storage.delete(`${req.appId}/feature-flags.json`),
        ])

        return { ok: true }
    } catch (err) {
        if (err instanceof ConnectError) {
            throw err
        }
        throw new ConnectError('cannot update app', Code.Internal)
    }
}
