import { Command } from 'cmdk'
import React, { useCallback, useMemo } from 'react'
import { ChangeStatusIcon } from '../Icons'
import { useKeatContext } from '../KeatContext'
import { Header, SettingsButton } from '../components/Header'

export function BrowseScreen() {
    const { app, setScreen, setFeature, setRule } = useKeatContext()

    const missingFeatures = useMemo(() => {
        const remoteFeatures = Object.keys(app?.features ?? {})
        const localFeatures = (globalThis as any).__keat?.apps?.at(0)?.features
        const missing = []
        for (const f of localFeatures) {
            if (!remoteFeatures.includes(f)) {
                missing.push(f)
            }
        }
        return missing
    }, [app])

    const allFeatures = useMemo(() => {
        const remoteFeatures = Object.keys(app?.features ?? {})
        return [...missingFeatures, ...remoteFeatures]
    }, [app, missingFeatures])

    const handleSelect = useCallback(
        (f: string) => {
            if (!app) return
            setFeature(f)
            const rule = app.features?.find((ft) => ft.name === f)?.rule
            setRule(rule)
            setScreen('toggle')
        },
        [app, setFeature, setRule, setScreen]
    )

    return (
        <>
            <Header>
                <SettingsButton />
            </Header>
            <Command.Input autoFocus placeholder="Search feature…" />
            <Command.List>
                <Command.Empty>No results found.</Command.Empty>

                {allFeatures.map((feature) => {
                    return (
                        <Command.Item
                            key={feature}
                            value={feature}
                            onSelect={() => handleSelect(feature)}
                        >
                            <ChangeStatusIcon />
                            {feature}
                        </Command.Item>
                    )
                })}
            </Command.List>
        </>
    )
}
