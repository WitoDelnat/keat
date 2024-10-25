import ExtendableError from 'es6-error'
import { CACError } from './cac/utils.cjs'
import { getStore } from './utils/store.cjs'
import { Instance } from './utils/keatInstance.cjs'
import { failure, print } from './utils/screens.cjs'

export class Uninitialized extends ExtendableError {}
export class Unauthenticated extends ExtendableError {}
export class Aborted extends ExtendableError {}
export class Timeout extends ExtendableError {}
export class MissingKeatInstance extends ExtendableError {}
export class MissingKeatConfig extends ExtendableError {}
export class MissingGlobalConfig extends ExtendableError {}
export class Misuse extends ExtendableError {
    constructor(message: string) {
        super(message)
    }
}
export class KeatError extends ExtendableError {
    constructor(message: string) {
        super(message)
    }
}

export function getErrorMessage(error: unknown) {
    if (error instanceof Error) return error.message
    return String(error)
}

function displayGlobalError(err: Error, showHelp: () => void) {
    switch (err.name) {
        case CACError.name:
            print(err.message)
            return
        case Unauthenticated.name:
            print('To get started with Keat CLI, please run:  keat auth login')
            return
        case MissingKeatConfig.name:
            print(
                'There is no Keat configuration. To get started, please run:  keat init'
            )
            return
        case MissingKeatInstance.name:
            print('The Keat instance is missing.')
            return
        case Misuse.name:
            print(failure(err.message))
            print()
            showHelp()
            return
        case KeatError.name:
            print(failure(err.message))
            return
        case Aborted.name:
            return
        case Timeout.name:
            print(failure('The operation timed out.'))
            return
        default:
            return print(
                'Something unexpected happened, please run with --debug for more details'
            )
    }
}

export function handleGlobalError(
    err: unknown,
    debug: boolean = false,
    showHelp: () => void
) {
    if (!(err instanceof Error)) {
        return
    }
    displayGlobalError(err, showHelp)

    if (debug) {
        console.log()
        console.error(err)
    }
}

export async function isAuthenticated() {
    const config = await getStore()

    return Boolean(config?.auth)
}

export async function throwIfUnauthenticated() {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
        throw new Unauthenticated()
    }
}

export function throwIfMissing(
    name: string,
    value?: string
): asserts value is string {
    if (value === undefined) {
        throw new Misuse(`Incorrect usage of ${name}`)
    }
}

export async function throwIfGlobalConfigMissing() {
    const config = await getStore()

    if (!config?.auth) {
        throw new MissingGlobalConfig()
    }
}
export function throwIfKeatConfigMissing(
    config: any | undefined
): asserts config is any {
    throw new MissingKeatConfig()
}

export function throwIfKeatInstanceMissing(
    instance: Instance | undefined
): asserts instance is Instance {
    if (!instance) {
        throw new MissingKeatInstance()
    }
}
