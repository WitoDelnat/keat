import { Code, ConnectError, MethodImpl } from '@connectrpc/connect'
import { KeatService } from '__codegen__/keat/core/v1/core_connect'
import { App } from 'types'
import { expandContext } from 'utils/context'
import { store } from 'utils/store'

type Handler = MethodImpl<typeof KeatService.methods.removeCohort>

export const removeCohort: Handler = async (req, ctx) => {
    const { storage, appKey } = expandContext(ctx)

    try {
        const keatDoc = await storage.get(`${req.appId}/${appKey}.json`)
        if (!keatDoc) {
            throw new ConnectError('cannot remove cohort', Code.Internal)
        }
        const keat = (await keatDoc.json()) as App
        const cohortIndex = keat.cohorts.findIndex((f) => {
            return f.name === req.cohort
        })

        if (cohortIndex === -1) {
            throw new ConnectError('cohort not found', Code.NotFound)
        } else {
            keat.features.splice(cohortIndex, 1)
        }

        await store(storage, { id: req.appId, key: appKey, app: keat })
        return { ok: true }
    } catch (err) {
        if (err instanceof ConnectError) {
            throw err
        }
        throw new ConnectError('cannot remove cohort', Code.Internal)
    }
}
