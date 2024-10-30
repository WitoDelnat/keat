import { diffJson } from 'diff'
import { getAppId } from '../app/getAppId'
import { KeatError, Uninitialized } from '../errors.cjs'
import { confirm } from '../utils/confirm.cjs'
import { B, C, print, success } from '../utils/screens.cjs'
import { promptAudiences, promptFeature } from './release.io.cjs'
import { getAppKeyOrAuthenticate } from '../app/getAppKey'
import { discoverKeatInstancePath } from './init.cjs'
import { extractInstance } from '../utils/keatInstance.cjs'
import { client, withAuthHeader } from '../../api/client'

export type RawReleaseOptions = {
    yes?: boolean
    feature?: string | string[]
}

export type ReleaseOptions = {
    yes?: boolean
    feature?: string
}

export type RawOptions = {
    options: {
        [k: string]: any
    }
}

export async function release({
    feature,
    yes = false,
    options,
}: ReleaseOptions & RawOptions) {
    const appId = await getAppId({ envs: process.env, flags: options })
    if (!appId) {
        throw new Uninitialized()
    }
    const appKey = await getAppKeyOrAuthenticate(appId, { options })
    const keatInstancePath = await discoverKeatInstancePath('.')
    const instance = await extractInstance(keatInstancePath)
    const appPromise = client.getApp({ id: appId }, withAuthHeader(appKey))
    const availableFeatures = instance?.features ?? []
    const feat = await getOrPromptFeature(feature, availableFeatures)

    const { app } = await appPromise
    const oldFeature = app?.features.find((f) => f.name === feat)
    const oldAudiences = oldFeature?.values ?? []

    const buildInAudiences = ['everyone']
    const allAudiences = Array.from(
        new Set([
            ...buildInAudiences,
            ...(instance?.audiences ?? []),
            ...(app?.audiences.map((a) => a.name) ?? []),
        ])
    )
    const newAudiences = await promptAudiences(allAudiences, oldAudiences)

    const difference = diffJson(oldAudiences, newAudiences)
    const colored = difference
        .map((part) => {
            return part.added
                ? C.green(part.value)
                : part.removed
                ? C.red(part.value)
                : part.value
        })
        .join('')

    print(modifyPreview(feat, colored))

    const confirmed = await confirm({
        message: `Toggle this feature?`,
        cancel: 'Your feature has not been toggled.',
        skip: yes,
    })

    if (!confirmed) {
        return
    }

    await client.toggle(
        { app: appId, feature: feat, values: newAudiences },
        withAuthHeader(appKey)
    )

    print(success(`Toggled feature.`))
}

const modifyPreview = (feature: string, content: string) => `
${B(content, {
    title: 'Summary of changes',
    padding: { left: 2, right: 30, bottom: 0, top: 0 },
})}
`

export async function getOrPromptFeature(
    feature: string | undefined,
    availableFeatures: string[]
): Promise<string> {
    if (feature) {
        if (!availableFeatures.includes(feature)) {
            throw new KeatError(`Feature "${feature}" not found.`)
        }

        return feature
    }

    return promptFeature(availableFeatures)
}
