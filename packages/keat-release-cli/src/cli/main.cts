#!/usr/bin/env node
import { cac } from './cac/index.cjs'
import { init, InitOptions } from './commands/init.cjs'
import { release, RawReleaseOptions } from './commands/release.cjs'
import { setDevelop } from './constants.cjs'
import { handleGlobalError } from './errors.cjs'
import { normaliseVariadicOption } from './utils/options.cjs'
import { version } from '../../package.json'
import { browse } from './commands/browse.cjs'

export const VERSION = version as string

const cli = cac('keat')

type GlobalOptions = {
    debug?: boolean
    develop?: boolean
}

cli.option('-d, --debug', `[boolean] show debug details`, {
    hide: true,
})
    .option('--develop', `[boolean] Changes to dev mode (advanced)`, {
        hide: true,
        default: true,
    })
    .option('-k, --key', `[string] the application authentication key`)

cli.command('init [path]', 'Initialize Keat Release')
    .group('additional')
    .description('Decouple deployment from release within seconds')
    .action(async (path: string, options: InitOptions & GlobalOptions) => {
        try {
            setDevelop(options.develop)
            await init({ path })
        } catch (err) {
            handleGlobalError(err, options.debug, () => cli.outputHelp())
            process.exit(1)
        }
    })

cli.command('browse', 'Open in the browser')
    .group('additional')
    .description('Explore the application within the browser')
    .action(async (options: undefined | GlobalOptions) => {
        try {
            await browse({ options: {} })
        } catch (err) {
            handleGlobalError(err, options?.debug, () => cli.outputHelp())
            process.exit(1)
        }
    })

cli.command('', 'Toggle feature flags')
    .alias('release')
    .description('Progressively release features from the command line.')
    .option('-f, --feature [feature]', `[string] The feature to be released`)
    .option('-y, --yes', `[boolean] Accept changes without interaction`)
    .allowUnknownOptions()
    .action(async (options: RawReleaseOptions & GlobalOptions) => {
        try {
            setDevelop(options.develop)
            const features = normaliseVariadicOption(options.feature)
            await release({
                feature: features?.at(0) ?? undefined,
                yes: options.yes,
                options,
            })
        } catch (err) {
            handleGlobalError(err, options?.debug, () => cli.outputHelp())
            process.exit(1)
        }
    })

cli.help()
cli.version(VERSION)
;(async function main() {
    try {
        cli.parse(process.argv, { run: false })
        await cli.runMatchedCommand()
    } catch (err) {
        const debugLike = (arg: string) => ['-d', '--debug'].includes(arg)
        const debug = cli.rawArgs.some(debugLike)
        handleGlobalError(err, debug, () => cli.outputHelp())
    }
})()
