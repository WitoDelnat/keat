import { Command } from 'cmdk'
import React, { useCallback } from 'react'
import { getKeatConfig } from '../api'
import { useKeatContext } from '../KeatContext'
import { Header } from '../components/Header'

export function ConnectScreen() {
    const { setApp, setScreen } = useKeatContext()

    const handleLogin = useCallback(
        (maybeKey: string) => {
            if (maybeKey.length === 64) {
                const id = (globalThis as any).__keat.apps.at(0)?.app
                getKeatConfig(id, maybeKey).then((a) => {
                    setApp(a)
                    localStorage.setItem('__keat_key', maybeKey)
                    setScreen('browse')
                })
            }
        },
        [setApp, setScreen]
    )

    return (
        <>
            <Header />
            <Command.Input
                autoFocus
                placeholder="Paste your key to get started"
                value=""
                onValueChange={handleLogin}
            />
            <Command.List>
                <Command.Empty>No results found.</Command.Empty>

                <Command.Group>
                    <Command.Item key="connect" value="connect">
                        Learn how to get started
                    </Command.Item>

                    <Command.Item key="learn" value="learn">
                        Browse to keat.app
                    </Command.Item>
                </Command.Group>
            </Command.List>
        </>
    )
}
