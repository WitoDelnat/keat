import { App, KeatConfig } from 'types'
import { murmurHash } from './hash'

const SEED = 42

export function compile(app: App, id: string, seed = SEED): KeatConfig {
    const h = murmurHash(id, seed)

    const audience: KeatConfig['audience'] = {}
    for (const a of app.audiences ?? []) {
        audience[a.name] = a.values.map((v) => murmurHash(v, h))
    }

    const features: KeatConfig['features'] = {}
    for (const f of app.features ?? []) {
        features[f.name] = f.rule
    }

    return { audience, features }
}
