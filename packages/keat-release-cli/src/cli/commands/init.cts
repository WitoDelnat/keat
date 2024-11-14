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
import prompts from 'prompts'
import { addAppToStore } from '../utils/store.cjs'

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

    const password = await promptPassword()
    const resp = await client.createApp({ password })
    await addAppToStore({ id: resp.id, key: resp.key })

    print(success('You are ready to release your first feature'))
    print(`
Your application identifier is ${resp.id}
`)
}

async function promptPassword(): Promise<string> {
    const { result } = await prompts({
        type: 'password',
        name: 'result',
        message: 'Please enter a password',
        instructions: false,
    })

    return result
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
    const keatLike = '= createKeat('
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
