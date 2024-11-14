import { AnyCohort } from 'keat'
import { createFilter } from '@rollup/pluginutils'
import { readFileSync } from 'fs'

const vitePluginKeat = () => {
    const filter = createFilter('**/*.json?cohorts')

    return {
        name: 'vite-plugin-import-svg',
        enforce: 'pre',
        async load(id: string) {
            if (filter(id)) {
                const cohortPath = id.replaceAll('?cohort', '')
                const cohortJson = readFileSync(cohortPath, 'utf-8')
                const cohort = JSON.parse(cohortJson) as AnyCohort

                const entries = Object.entries(cohort)
                const anonymisedEntries = []
                for (const [k, v] of entries) {
                    if (!Array.isArray(v)) {
                        anonymisedEntries.push([k, v])
                        continue
                    }
                    const av = await Promise.all(v.map((s) => hash(s)))
                    anonymisedEntries.push([k, av])
                }
                const cohortAnonymized = Object.fromEntries(anonymisedEntries)

                const result = `export default ${cohortAnonymized}`
                return result
            }
        },
    }
}

export async function hash(s: string): Promise<string> {
    const b = new TextEncoder().encode(s)
    const digest = await crypto.subtle.digest(
        {
            name: 'SHA-256',
        },
        b
    )
    const hex = [...new Uint8Array(digest)]
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')
    return hex
}

export default vitePluginKeat
