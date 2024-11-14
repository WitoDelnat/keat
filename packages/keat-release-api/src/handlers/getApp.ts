import { Code, ConnectError, MethodImpl } from '@connectrpc/connect'
import { KeatService } from '__codegen__/keat/core/v1/core_connect'
import { App } from '__codegen__/keat/core/v1/core_pb'
import { expandContext } from 'utils/context'

type Handler = MethodImpl<typeof KeatService.methods.getApp>

export const getApp: Handler = async (req, ctx) => {
    const { storage, appKey } = expandContext(ctx)

    try {
        const keatDoc = await storage.get(`${req.appId}/${appKey}.json`)
        if (!keatDoc) {
            throw new Error()
        }
        const keat = (await keatDoc.json()) as App

        return {
            app: {
                name: keat.name,
                env: keat.env,
                cohorts: keat.cohorts,
                features: keat.features,
            },
        }
    } catch (err) {
        console.log('cannot get app', {
            err: err instanceof Error ? err.message : err,
        })
        throw new ConnectError('cannot get app', Code.Internal)
    }
}
