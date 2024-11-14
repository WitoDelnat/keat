export type App = {
    name: string;
    env?: string;
    features: {
        name: string;
        killed?: boolean;
        audiences: string[];
    }[];
    audiences: {
        name: string;
        rule: string;
    }[];
};

const ORIGIN = 'http://localhost:8787';
const SERVICE_ENDPOINT = `${ORIGIN}/keat.core.v1.KeatService/`;

async function client<TRequest, TResponse>(method: string, req: TRequest, opts: { key?: string } = {}) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const key = opts.key ?? globalThis.localStorage.getItem('__keat_key');
    if (key) headers.set('X-Auth-Key', key);
    const response = await fetch(new URL(method, SERVICE_ENDPOINT), {
        method: 'POST',
        headers,
        body: JSON.stringify(req)
    });
    if (!response.ok) {
        throw new Error('request failed');
    }
    const spec = await response.json();
    return spec as TResponse;
}

export async function getKeatConfig(id: string) {
    const resp = await client<{ id: string }, { app: App }>('GetApp', { id });
    return resp.app;
}

export async function toggle(app: string, feature: string, values: string[]) {
    const response = await client<{ app: string; feature: string; values: string[] }, App>('Toggle', { app, feature, values });
    return response;
}

export async function authenticate(appId: string, password: string) {
    const response = await client<{ appId: string; password: string }, { key: string }>('Authenticate', { appId, password });
    return response.key;
}
