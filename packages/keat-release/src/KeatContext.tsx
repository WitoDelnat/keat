import React from 'react'
import {
    createContext,
    PropsWithChildren,
    useMemo,
    useContext,
    useEffect,
} from 'react'
import { App, getKeatConfig } from './api'

type KeatCtx = {
    app: App | undefined
    setApp: any
    screen: Screen
    setScreen: (s: Screen) => void
    feature: string | undefined
    setFeature: (s: string) => void
    audiences: string[]
    setAudiences: (s: string[]) => void
    rule: string | boolean | number | undefined
    setRule: (r: string | boolean | number | undefined) => void
    reset: () => void
}

const KeatContext = createContext<KeatCtx | null>(null)

export type Screen = 'connect' | 'browse' | 'toggle' | 'confirm' | 'settings'

export type KeatConfig = {
    name: string
    env?: string
    audiences: [{ name: string; values: string[] }]
    features: Record<string, string | boolean | number>
    kill: Record<string, boolean>
}

export function KeatProvider({ children }: PropsWithChildren<{}>) {
    const [screen, setScreen] = React.useState<Screen>(() => {
        const key = localStorage.getItem('__keat_key')
        return key ? 'browse' : 'connect'
    })
    const [app, setApp] = React.useState<App | undefined>()
    const [feature, setFeature] = React.useState<string | undefined>()
    const [rule, setRule] = React.useState<
        string | number | boolean | undefined
    >()
    const [audiences, setAudiences] = React.useState<string[]>([])

    useEffect(() => {
        if (screen === 'browse' && !app) {
            const id = (globalThis as any).__keat.apps.at(0)?.app
            const key = localStorage.getItem('__keat_key')
            if (key) {
                getKeatConfig(id, key)
                    .then(setApp)
                    .catch(() => {})
            }
        }
    }, [screen, setFeature, setScreen])

    const context = useMemo((): KeatCtx => {
        return {
            app,
            setApp,
            feature,
            setFeature,
            screen,
            setScreen,
            audiences,
            setAudiences,
            rule,
            setRule,
            reset: () => {
                setScreen(
                    localStorage.getItem('__keat_key') ? 'browse' : 'connect'
                )
                setFeature(undefined)
            },
        }
    }, [app, setApp, feature, setFeature, screen, setScreen])

    return (
        <KeatContext.Provider value={context}>{children}</KeatContext.Provider>
    )
}

export function useKeatContext(): KeatCtx {
    const ctx = useContext(KeatContext)

    if (!ctx) {
        throw new Error(
            'Uninitialised: Did you forget to use KeatContext.Provider?'
        )
    }

    return ctx
}
