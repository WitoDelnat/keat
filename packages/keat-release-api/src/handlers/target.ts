import { Code, ConnectError, MethodImpl } from '@connectrpc/connect'
import { KeatService } from '__codegen__/keat/core/v1/core_connect'
import { App, Cohort } from '__codegen__/keat/core/v1/core_pb'
import { expandContext } from 'utils/context'

type Handler = MethodImpl<typeof KeatService.methods.target>

export const target: Handler = async (req, ctx) => {
    const { storage, appKey } = expandContext(ctx)
    if (req.strategy.case === 'group') {
        req.strategy.value
    } else {
    }

    const keatDoc = await storage.get(`${req.appId}/${appKey}.json`)
    if (!keatDoc) {
        throw new ConnectError('cannot toggle feature', Code.Internal)
    }
    const keat = (await keatDoc.json()) as App

    if (req.strategy.case === 'rollout') {
    } else {
    }
    const cohortIndex = keat.cohorts.findIndex((f) => {
        return f.name === req.cohort
    })

    if (cohortIndex === -1) {
        keat.cohorts.push(
            new Cohort({
                name: req.cohort,
                strategy: req.strategy,
            })
        )
    } else {
        const [cohort] = keat.cohorts.splice(cohortIndex, 1)
        cohort.strategy = req.strategy
        keat.cohorts.unshift(cohort)
    }

    await storage.put(`${req.appId}/${appKey}.json`, JSON.stringify(keat))
    return { ok: true }
}
