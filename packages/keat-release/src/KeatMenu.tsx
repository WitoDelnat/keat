import { Command } from 'cmdk'
import React, { useCallback, useEffect } from 'react'
import { ConnectScreen } from './screens/0-Connect'
import { BrowseScreen } from './screens/1-Browse'
import { ToggleScreen } from './screens/2-Toggle'
import { ConfirmScreen } from './screens/3-Confirm'
import { KeatProvider, useKeatContext } from './KeatContext'
import { SettingsScreen } from './screens/10-Settings'

type Props = {
    // The hotkey to open Keat Menu.
    hotkey?: string
}

export function KeatMenu(props: Props) {
    return (
        <KeatProvider>
            <KeatDialog {...props} />
        </KeatProvider>
    )
}

export function KeatDialog({ hotkey = '¶' }: Props) {
    const { screen, reset } = useKeatContext()
    const [open, setOpen] = React.useState(false)

    useEffect(() => {
        const down = (e: any) => {
            if (e.key === hotkey) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const toggle = useCallback(
        (s: boolean) => {
            setOpen(s)
            if (s === false) {
                reset()
            }
        },
        [setOpen]
    )

    return (
        <Command.Dialog open={open} onOpenChange={toggle} label="Keat Release">
            {screen === 'connect' ? (
                <ConnectScreen />
            ) : screen === 'browse' ? (
                <BrowseScreen />
            ) : screen === 'toggle' ? (
                <ToggleScreen />
            ) : screen === 'confirm' ? (
                <ConfirmScreen />
            ) : screen === 'settings' ? (
                <SettingsScreen />
            ) : null}
        </Command.Dialog>
    )
}
