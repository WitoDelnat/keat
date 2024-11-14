import { Code, ConnectError, MethodImpl } from '@connectrpc/connect'
import { KeatService } from '__codegen__/keat/core/v1/core_connect'
import { Feature } from '__codegen__/keat/core/v1/core_pb'
import { App } from 'types'
import { expandContext } from 'utils/context'
import { store } from 'utils/store'

type Handler = MethodImpl<typeof KeatService.methods.toggle>

export const toggle: Handler = async (req, ctx) => {
    const { storage, appKey } = expandContext(ctx)

    const keatDoc = await storage.get(`${req.appId}/${appKey}.json`)
    if (!keatDoc) {
        throw new ConnectError('cannot toggle feature', Code.Internal)
    }
    const keat = (await keatDoc.json()) as App

    const featureIndex = keat.features.findIndex((f) => {
        return f.name === req.feature
    })

    if (featureIndex === -1) {
        keat.features.push(
            new Feature({
                name: req.feature,
                cohorts: req.cohorts,
            })
        )
    } else {
        const [feature] = keat.features.splice(featureIndex, 1)
        feature.cohorts = req.cohorts
        keat.features.unshift(feature)
    }

    await store(storage, { id: req.appId, key: appKey, app: keat })
    return { ok: true }
}
