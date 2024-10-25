import { Code, ConnectError, MethodImpl } from '@connectrpc/connect'
import { KeatService } from '__codegen__/keat/core/v1/core_connect'
import { App } from '__codegen__/keat/core/v1/core_pb'
import { expandContext } from 'utils/context'

type Handler = MethodImpl<typeof KeatService.methods.toggle>

export const toggle: Handler = async (req, ctx) => {
    const { storage, appKey } = expandContext(ctx)

    const keatDoc = await storage.get(`${req.app}/${appKey}.json`)
    if (!keatDoc) {
        throw new ConnectError('cannot toggle feature', Code.Internal)
    }
    const keat = (await keatDoc.json()) as App

    const featureIndex = keat.features.findIndex((f) => {
        return f.name === req.feature
    })
    if (!featureIndex) {
        throw new ConnectError('cannot toggle feature', Code.Internal)
    }
    if (!req.rule) {
        throw new ConnectError('rule missing', Code.FailedPrecondition)
    }
    const [feature] = keat.features.splice(featureIndex, 1)
    feature.rule = [req.rule]
    keat.features.unshift(feature)

    await storage.put(`${req.app}/${appKey}.json`, JSON.stringify(keat))
    return { success: true }
}
