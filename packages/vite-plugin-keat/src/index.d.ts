import { PluginOption } from 'vite'

declare function viteKeat(): PluginOption[]

declare module '*.json?cohorts' {
    const keatCohorts: any
    export default keatCohorts
}

export { viteKeat as default }
