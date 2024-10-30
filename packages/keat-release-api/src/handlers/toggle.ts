import { Code, ConnectError, MethodImpl } from '@connectrpc/connect'
import { KeatService } from '__codegen__/keat/core/v1/core_connect'
import { App, Feature } from '__codegen__/keat/core/v1/core_pb'
import { expandContext } from 'utils/context'

type Handler = MethodImpl<typeof KeatService.methods.toggle>

export const toggle: Handler = async (req, ctx) => {
    const { storage, appKey } = expandContext(ctx)

    console.log('TEST a', req.app, appKey)
    const keatDoc = await storage.get(`${req.app}/${appKey}.json`)
    if (!keatDoc) {
        throw new ConnectError('cannot toggle feature', Code.Internal)
    }
    const keat = (await keatDoc.json()) as App
    console.log('TEST b', JSON.stringify(keat))

    const featureIndex = keat.features.findIndex((f) => {
        return f.name === req.feature
    })
    console.log('TEST c', featureIndex)

    if (featureIndex === -1) {
        keat.features.push(
            new Feature({
                name: req.feature,
                values: req.values,
            })
        )
    } else {
        const [feature] = keat.features.splice(featureIndex, 1)
        feature.values = req.values
        keat.features.unshift(feature)
    }

    await storage.put(`${req.app}/${appKey}.json`, JSON.stringify(keat))
    return { success: true }
}
