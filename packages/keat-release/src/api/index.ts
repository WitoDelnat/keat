export type App = {
    name: string
    env?: string
    features: {
        name: string
        killed?: boolean
        rule: string
    }[]
    audiences: {
        name: string
        rule: string
    }[]
}

const ORIGIN = 'http://localhost:8787'
const SERVICE_ENDPOINT = `${ORIGIN}/keat.core.v1.KeatService/`

async function client<TRequest, TResponse>(
    method: string,
    req: TRequest,
    opts: { key?: string } = {}
) {
    const headers = new Headers({ 'Content-Type': 'application/json' })
    const key = opts.key ?? globalThis.localStorage.getItem('__keat_key')
    if (key) headers.set('X-Auth-Key', key)
    const response = await fetch(new URL(method, SERVICE_ENDPOINT), {
        method: 'POST',
        headers,
        body: JSON.stringify(req),
    })
    if (!response.ok) {
        throw new Error('request failed')
    }
    const spec = await response.json()
    return spec as TResponse
}

export async function getKeatConfig(id: string, key: string) {
    const resp = await client<{ id: string }, { app: App }>(
        'GetApp',
        { id },
        { key }
    )
    return resp.app
}

export async function toggle(
    app: string,
    feature: string,
    rule: string | number | boolean
) {
    const response = client<{ app: string; feature: string; rule: any }, App>(
        'Toggle',
        { app, feature, rule }
    )

    const kt = (globalThis as any).__keat?.apps?.at(0)
    if (kt && kt.reload && typeof kt.reload === 'function') {
        kt.reload()
    }

    return response
}
