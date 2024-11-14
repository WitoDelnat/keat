import React, { PropsWithChildren, useCallback } from 'react'
import { BackIcon, SettingsIcon } from '../Icons'
import { useKeatContext } from '../KeatContext'

type Props = PropsWithChildren<{}>

export function Header({ children = <BackButton /> }: Props) {
    return (
        <div keat-header="">
            <AppBadge />
            {children}
        </div>
    )
}

function AppBadge() {
    const { app } = useKeatContext()

    if (!app) {
        return <div cmdk-app-badge="">Welcome to Keat</div>
    }

    return (
        <div cmdk-app-badge="">
            {app.name}
            {app.env ? ` • ${app.env}` : ''}
        </div>
    )
}

export function SettingsButton() {
    const { setScreen } = useKeatContext()

    const showSettings = useCallback(() => {
        setScreen('settings')
    }, [setScreen])

    return (
        <button cmdk-app-badge="" className="settings" onClick={showSettings}>
            <span className="logout-label">Settings</span>
            <SettingsIcon />
        </button>
    )
}

export function BackButton() {
    const { setScreen } = useKeatContext()

    const goBack = useCallback(() => {
        setScreen('browse')
    }, [setScreen])

    return (
        <button cmdk-app-badge="" className="settings" onClick={goBack}>
            <span className="logout-label">Go back</span>
            <BackIcon />
        </button>
    )
}
