import { Command } from 'cmdk'
import React, { useCallback } from 'react'
import { LogoutIcon } from '../Icons'
import { useKeatContext } from '../KeatContext'
import { BackButton, Header } from '../components/Header'

export function SettingsScreen() {
    const { reset, setApp } = useKeatContext()

    const handleLogout = useCallback(() => {
        localStorage.removeItem('__keat_key')
        setApp(undefined)
        reset()
    }, [setApp, reset])

    return (
        <>
            <Header>
                <BackButton />
            </Header>
            <Command.Input autoFocus placeholder="Search settings…" />
            <Command.List>
                <Command.Empty>No results found.</Command.Empty>

                <Command.Group>
                    <Command.Item
                        key="logout"
                        value="logout"
                        onSelect={handleLogout}
                    >
                        <LogoutIcon />
                        Logout…
                    </Command.Item>

                    {/* Prune helps to remove features from remote config which no longer exists locally. */}
                    {/* <Command.Item
                        key="prune"
                        value="prune"
                        onSelect={handlePrune}
                    >
                        Prune features…
                    </Command.Item> */}
                </Command.Group>
            </Command.List>
        </>
    )
}
