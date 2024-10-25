import { B, C, S } from '../utils/screens.cjs'

export const cancelled = () => `${C.bgYellow('cancelled')} You`

export const configExists = () => `${S.info} Keat config already exists`
export const pluginExists = () => `${S.info} Keat release plugin already exists`
export const prepare = () => `${S.success} Preparing initialization...`

export const attentionCreateConfig = (content: string) => `
${C.magenta('Keat will create your config file:')}

${B(C.green(content), {
    title: 'keat.config.ts',
    padding: { left: 1, right: 1, bottom: 0, top: 0 },
})}
`

export const attentionCreateApp = () => `
${C.magenta('Keat will create your application:')}

${B('keat cloud create application', {
    padding: { left: 1, right: 1, bottom: 0, top: 0 },
})}
`

export const attentionUpdateInstance = () =>
    `${C.redBright('Keat will run the following command:')}

  ${B('cloud create application')}
`

export const appCreated = () =>
    `${S.success} Added 'keatRelease' plugin to your Keat instance.`
