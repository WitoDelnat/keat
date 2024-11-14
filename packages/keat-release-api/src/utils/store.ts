import { App } from 'types'
import { compile } from './compile'

export async function store(
    storage: R2Bucket,
    { id, key, app }: { id: string; key: string; app: App }
): Promise<void> {
    await Promise.all([
        storage.put(`${id}/${key}.json`, JSON.stringify(app)),
        storage.put(
            `${id}/feature-flags.json`,
            JSON.stringify(compile(app, id))
        ),
    ])
}
