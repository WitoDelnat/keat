import { Code, ConnectError, MethodImpl } from '@connectrpc/connect'
import { KeatService } from '__codegen__/keat/core/v1/core_connect'
import { App } from 'types'
import { expandContext } from 'utils/context'
import { store } from 'utils/store'

type Handler = MethodImpl<typeof KeatService.methods.removeFeature>

export const removeFeature: Handler = async (req, ctx) => {
    const { storage, appKey } = expandContext(ctx)

    try {
        const keatDoc = await storage.get(`${req.appId}/${appKey}.json`)
        if (!keatDoc) {
            throw new ConnectError('cannot remove feature', Code.Internal)
        }
        const keat = (await keatDoc.json()) as App
        const featureIndex = keat.features.findIndex((f) => {
            return f.name === req.feature
        })

        if (featureIndex === -1) {
            throw new ConnectError('feature not found', Code.NotFound)
        } else {
            keat.features.splice(featureIndex, 1)
        }

        await store(storage, { id: req.appId, key: appKey, app: keat })
        return { ok: true }
    } catch (err) {
        if (err instanceof ConnectError) {
            throw err
        }
        throw new ConnectError('cannot remove feature', Code.Internal)
    }
}
