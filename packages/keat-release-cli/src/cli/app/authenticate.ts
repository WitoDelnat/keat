import prompts from 'prompts'
import { addAppToStore, getStore } from '../utils/store.cjs'
import { Unauthenticated } from '../errors.cjs'
import { client, withAuthHeader } from '../../api/client'

export async function authenticate(appId: string) {
    const store = await getStore()
    const app = (store?.apps ?? []).find((a) => a.id === appId)

    if (app) {
        return app.key
    }

    const appKey = await getOrPromptAppKey()

    try {
        await client.getApp({ id: appId }, withAuthHeader(appKey))
        await addAppToStore({ id: appId, key: appKey })
        return appKey
    } catch (err) {
        console.debug('err authenticate', { err })
        // Authentication failed
        throw new Unauthenticated()
    }
}

async function getOrPromptAppKey(): Promise<string> {
    console.log('Please authenticate the CLI:')
    console.log('')

    const { result } = await prompts({
        type: 'text',
        name: 'result',
        message: 'Enter your application key',
        instructions: false,
    })

    return result
}
