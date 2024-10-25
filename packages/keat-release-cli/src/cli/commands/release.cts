import { diffJson } from 'diff'
import prompts from 'prompts'
import { getAppId } from '../app/getAppId'
import { KeatError, Uninitialized } from '../errors.cjs'
import { confirm } from '../utils/confirm.cjs'
import { B, C, print, success } from '../utils/screens.cjs'
import { promptFeature } from './release.io.cjs'
import { getAppKeyOrAuthenticate } from '../app/getAppKey'
import { discoverKeatInstancePath } from './init.cjs'
import { extractInstance } from '../utils/keatInstance.cjs'
import { client, withAuthHeader } from '../../api/client'

type Rule =
    | {
          OR: (boolean | string | number)[]
      }
    | boolean
    | string
    | number

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

    const pluginMetadata = {
        weight: true,
        audience: ['preview'],
    }

    const keatInstancePath = await discoverKeatInstancePath('.')
    const instance = await extractInstance(keatInstancePath)
    const availableFeatures = instance?.features ?? []
    const feat = await getOrPromptFeature(feature, availableFeatures)
    const { app } = await client.getApp({ id: appId }, withAuthHeader(appKey))
    const oldFeature = app?.features.find((f) => f.name === feat)
    const oldRule = oldFeature?.rule ?? false
    const newRule = await buildRule(oldRule as any, pluginMetadata)

    const oldRuleAsArray = Array.isArray(oldRule) ? oldRule : [oldRule]
    const newRuleAsArray = Array.isArray(newRule) ? newRule : [newRule]
    const difference = diffJson(oldRuleAsArray, newRuleAsArray)
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
        { app: appId, feature: feat, rule: newRule as any },
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

// New approach is to build the full rule from scratch depending on plugin metadata
// The approach acts as a builder

// example
// - Set a weight (enter number)
// - Do you want to set audiences?
// - Select audiences (multiSelect)
// - etc.
// - Select query params (if present)
// - Do you want to set a launch date?

// flags could be dynamic for plugins: keat release demo --weight 5 --audience preview -a staff -d tomorrow

type PluginMetadata = {
    weight: boolean
    audience?: string[]
    launchDay?: boolean
}
async function buildRule(
    oldRule: Rule,
    plugins: PluginMetadata
): Promise<Rule> {
    const state =
        oldRule === false
            ? 'DISABLED'
            : oldRule === true
            ? 'ENABLED'
            : 'PARTIAL'

    const p1 = await prompts({
        type: 'autocomplete',
        name: 'result',
        message: `Toggle`,
        choices:
            state === 'ENABLED'
                ? [
                      { title: 'Disable', value: 'disable' },
                      { title: 'Enable progressively', value: 'more' },
                  ]
                : state === 'DISABLED'
                ? [
                      { title: 'Enable', value: 'enable' },
                      { title: 'Enable progressively', value: 'more' },
                  ]
                : [
                      { title: 'Enable', value: 'enable' },
                      { title: 'Disable', value: 'disable' },
                      { title: 'Enable progressively', value: 'more' },
                  ],
    })

    if (p1.result !== 'more') {
        return p1.result === 'enable'
    }

    const newRule: Rule = { OR: [] }

    if (plugins.weight) {
        const { weight } = await prompts([
            {
                type: 'toggle',
                message: 'Set weighted rollout?',
                name: 'go',
                initial: true,
                active: 'yes',
                inactive: 'no',
            },
            {
                type: (prev) => (prev ? 'number' : null),
                name: 'weight',
                message: `What percentage to rollout?`,
                min: 0,
                max: 100,
            },
        ])

        if (weight !== '__skip__') {
            newRule.OR.push(weight)
        }
    }

    if (plugins.audience) {
        const { audiences } = await prompts({
            type: 'autocompleteMultiselect',
            name: 'audiences',
            choices: plugins.audience.map((a) => ({ title: a, value: a })),
            message: `Select audiences:`,
            instructions: false,
        })
        if (audiences.length > 0) {
            newRule.OR.push(...audiences)
        }
    }

    // TODO add launch day and other plugins
    // if (plugins.launchDay) {
    //   const { result } = await prompts({
    //     type: "text",
    //     name: "result",
    //     message: `Enter ${inputConfig.type} for "${name}":`,
    //   });
    // }

    return newRule.OR.length === 0 ? newRule.OR[0] : newRule
}
