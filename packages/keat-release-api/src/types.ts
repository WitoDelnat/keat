export type App = {
    name?: string
    env?: string
    features?: Feature[]
}

export type Feature = {
    name: string
    kill?: boolean
    rule: string | boolean | number
}
