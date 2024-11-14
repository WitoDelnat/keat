import prompts from 'prompts'
import { addAppToStore, getStore } from '../utils/store.cjs'
import { Unauthenticated } from '../errors.cjs'
import { client } from '../../api/client'

export async function authenticate(appId: string) {
    const store = await getStore()
    const app = (store?.apps ?? []).find((a) => a.id === appId)

    if (app) {
        return app.key
    }

    const password = await promptPassword()

    try {
        const authResponse = await client.authenticate({ appId, password })
        const appKey = authResponse.key
        await addAppToStore({ id: appId, key: appKey })
        return appKey
    } catch (err) {
        console.debug('err authenticate', { err })
        throw new Unauthenticated()
    }
}

async function promptPassword(): Promise<string> {
    console.log('Please authenticate the CLI:')
    console.log('')

    const { result } = await prompts({
        type: 'password',
        name: 'result',
        message: 'Enter your password',
        instructions: false,
    })

    return result
}
