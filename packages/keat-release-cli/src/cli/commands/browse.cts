import open from 'open'
import { getAppId } from '../app/getAppId'
import { WEB_ORIGIN } from '../constants.cjs'
import { RawOptions } from './release.cjs'
import { getAppKey } from '../app/getAppKey'
import { authenticate } from '../app/authenticate'
import { Uninitialized } from '../errors.cjs'

export async function browse({ options }: RawOptions) {
    try {
        const appId = await getAppId({ envs: process.env, flags: options })
        if (!appId) {
            throw new Uninitialized()
        }
        const appKey = await getAppKey(appId)
        if (!appKey) {
            await authenticate(appId)
        }

        const browseUrl = `${WEB_ORIGIN}/${appId}/${appKey}`
        await open(browseUrl)
    } catch (err) {
        throw err
    }
}
