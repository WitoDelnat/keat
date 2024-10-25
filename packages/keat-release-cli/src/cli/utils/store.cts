import fs from 'fs'
import fse from 'fs-extra'
import untildify from 'untildify'

export type Store = {
    apps?: App[]
}

export type App = {
    id: string
    key: string
}

export async function getStore(): Promise<Store | undefined> {
    const configPath = getStorePath()

    if (!fs.existsSync(configPath)) {
        return undefined
    }

    const config: Store = await fse.readJson(configPath)
    return config
}

export async function setStore(config: Store) {
    const configPath = getStorePath()
    await fse.outputJson(configPath, config)
}

export async function addAppToStore(app: App) {
    const store = (await getStore()) ?? {}
    let apps = store.apps?.filter((a) => a.id === app.id) ?? []
    store.apps = [app, ...apps]
    await setStore(store)
}

export async function deleteStore() {
    const configPath = getStorePath()
    await fse.remove(configPath)
}

function getStorePath(): string {
    const xdg = require('xdg-app-paths/cjs')
    const configDir = xdg({ name: 'keat' }).config()
    const configPath = `${untildify(configDir)}/config.json`
    return configPath
}
