import fse from 'fs-extra'
import { discoverKeatInstancePath } from '../commands/init.cjs'
import { extractInstance } from '../utils/keatInstance.cjs'
import dotenv from '@dotenvx/dotenvx'

/**
 *
 * Use value from  --app if present.
 * Use value from KEAT_APP_ID if present.
 * Find .env and find env variable which ends with KEAT_APP_ID (so prefix like REACT_APP_KEAT_APP_ID would also work as is commonly done with frontends). If multiple .env.prd with different valuse exists, ask which one to use.
 * Find keat.json file in which multiple environments can be defined.
 * Find keat instance and take hardcoded ID.
 * Opt - Ask app id.
 */
type Params = {
    flags?: Record<string, string | undefined>
    envs?: Record<string, string | undefined>
    fromKeatFile?: boolean
    fromEnvFiles?: boolean
    fromKeatInstance?: boolean
    basePath?: string
}

export async function getAppId({
    flags,
    envs,
    fromKeatFile = true,
    fromEnvFiles = true,
    fromKeatInstance = true,
    basePath = '.',
}: Params): Promise<string | undefined> {
    if (flags?.['app']) {
        return flags['app']
    }

    if (envs?.['KEAT_APP_ID']) {
        return envs['KEAT_APP_ID']
    }

    if (fromKeatFile) {
        try {
            const keatJson = await fse.readJson('./keat.json')
            if (keatJson.id) {
                return keatJson.id
            }
        } catch {}
    }

    if (fromEnvFiles) {
        try {
            const envFile = dotenv.config({ quiet: true })
            const envFileEntries = Object.entries(envFile.parsed ?? {})
            for (const [key, value] of envFileEntries) {
                if (key.includes('KEAT_APP_ID')) {
                    return value
                }
            }
        } catch {}
    }

    if (fromKeatInstance) {
        try {
            const keatInstancePath = await discoverKeatInstancePath(basePath)
            const instance = await extractInstance(keatInstancePath)
            if (instance?.app) {
                return instance.app
            }
        } catch {}
    }

    return undefined
}
