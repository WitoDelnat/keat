import { Code, ConnectError, MethodImpl } from '@connectrpc/connect'
import { KeatService } from '__codegen__/keat/core/v1/core_connect'
import { compile } from 'utils/compile'
import { expandContext } from 'utils/context'
import { generateId, generateKey } from 'utils/general'

type Handler = MethodImpl<typeof KeatService.methods.createApp>

export const createApp: Handler = async (req, ctx) => {
    const { storage } = expandContext(ctx)
    const id = generateId()
    const key = generateKey()
    const spec = {
        name: req.name,
        audiences: [],
        features: req?.feature ? [{ name: req.feature, rule: true }] : [],
    }

    try {
        await Promise.all([
            storage.put(`${id}/${key}.json`, JSON.stringify(spec)),
            storage.put(
                `${id}/feature-flags.json`,
                JSON.stringify(compile(spec, id))
            ),
        ])

        return { id, key }
    } catch (err) {
        throw new ConnectError('cannot create app', Code.Internal)
    }
}
