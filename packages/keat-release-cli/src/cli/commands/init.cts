import fs from 'fs/promises'
import klaw from 'klaw-sync'
import { chunk } from 'lodash'
import pathjs from 'path'
import { getAppId } from '../app/getAppId'
import { isDefined } from '../utils/basics.cjs'
import {
    manyInstancesFound,
    noInstanceFound,
    promptImport,
} from '../utils/io.cjs'
import { failure, print, started, success } from '../utils/screens.cjs'
import { client } from '../../api/client'

export type InitOptions = {
    path: string | undefined
    appFlag?: string
}

export async function init({ path, appFlag }: InitOptions) {
    print(started('Started initialization'))

    const appId = await getAppId({
        basePath: path,
        envs: process.env as Record<string, string>,
        flags: { app: appFlag },
    })
    if (appId) {
        print(failure('App already exists'))
        return
    }

    print(started(`Creating application..`))
    const resp = await client.createApp({})

    print(success('You are ready to release your first feature'))

    print(`
Your application is:

- Your public application id: ${resp.id}
- Your secret application key: ${resp.key}

Make sure to copy your application key now as you will not be able to see this again.

The next step is to toggle a flag with \`keat release\`
`)
}

export async function discoverKeatInstancePath(path?: string): Promise<string> {
    const baseDir = process.cwd()
    const dir = path === undefined ? baseDir : pathjs.join(baseDir, path)

    const search = await searchInFiles(dir)
    const files = search.map((file) => file.replace(baseDir, '.'))

    if (files.length === 0) {
        print(noInstanceFound())
        throw new Error('keat_instance_not_found')
    }

    if (files.length === 1) {
        return files[0]
    }

    print(manyInstancesFound())
    return promptImport(files)
}

async function searchInFiles(dir: string) {
    const keatLike = '= keat('
    const paths = klaw(dir, {
        nodir: true,
        filter: (item) => !item.path.includes('node_modules'),
    })
    const match: string[] = []

    for (const c of chunk(paths, 10)) {
        const result = await Promise.all(
            c.map(({ path }) => {
                return fs.readFile(path, 'utf8').then((content) => {
                    const isKeatLike = content.includes(keatLike)
                    return isKeatLike ? path : undefined
                })
            })
        )

        match.push(...result.filter(isDefined))
    }

    return match
}
