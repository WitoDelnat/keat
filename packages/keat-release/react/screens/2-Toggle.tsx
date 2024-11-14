import { Command, useCommandState } from 'cmdk'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useKeatContext } from '../KeatContext'
import { BackButton, Header } from '../components/Header'

// Continue here:
// - cmdk `useCommandState` does not give programmatic access to current.
// - custom focused (see stash) does not play nicely with cmdk search.
// -> Custom cmdk needed?
// Also the all/selected/unselected could use some better work. It also needs
// to include filtered..
export function ToggleScreen() {
    const search = useCommandState((state) => state.search)
    const { app, feature, setScreen } = useKeatContext()

    const missingAudiences = useMemo(() => {
        const remoteAudiences = Object.keys(app?.audiences ?? {})
        const localAudiences = (globalThis as any).__keat?.apps?.at(
            0
        )?.audiences
        const missing = []
        for (const f of localAudiences) {
            if (!remoteAudiences.includes(f)) {
                missing.push(f)
            }
        }
        return missing
    }, [app])

    const allAudiences = useMemo(() => {
        const remoteAudiences = Object.keys(app?.audiences ?? {})
        return [...missingAudiences, ...remoteAudiences]
    }, [app, missingAudiences])

    const selectedAudiences = useMemo(() => {
        if (!feature) return []
        const feat = app?.features?.find((f) => f.name === feature)
        return feat?.audiences ?? []
    }, [feature])

    const unselectedAudiences = useMemo(() => {
        return allAudiences.filter((a) => !selectedAudiences.includes(a))
    }, [feature])

    const [audiences, setAudiences] = useState<string[]>(selectedAudiences)
    const [focused, setFocused] = useState(0)

    useEffect(() => {
        const down = (e: any) => {
            if (e.code === 'Space') {
                // Toggle Audience
                e.preventDefault()
                const focusedAudience = allAudiences[focused]
                const isSelected = audiences.find((a) => a === focusedAudience)
                if (isSelected) {
                    setAudiences(audiences.filter((a) => a !== focusedAudience))
                } else {
                    setAudiences([focusedAudience, ...audiences])
                }
                e.preventDefault()
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [audiences, setAudiences, focused, search])

    const handleToggle = useCallback(
        (audience: string) => {
            setAudiences([audience, ...audiences])
            setScreen('confirm')
        },
        [audiences, setAudiences, setScreen]
    )

    useEffect(() => {
        if (!feature) {
            setScreen('browse')
        }
    }, [feature, setScreen])

    if (!feature) {
        return null
    }

    return (
        <>
            <Header>
                <BackButton />
            </Header>

            <Command.Input autoFocus placeholder="Release to…" />

            <Command.List>
                <Command.Empty>No audience found.</Command.Empty>

                {allAudiences.map((a, i) => {
                    const isChecked = audiences.includes(a)
                    const isFocused = i == focused
                    return (
                        <Command.Item
                            key={a}
                            value={a}
                            onSelect={() => handleToggle(a)}
                            className={`item ${
                                isFocused ? 'item-focused' : 'item-unfocused'
                            }`}
                        >
                            <div aria-label={a} className="item-inner">
                                <div className="item-checkbox">
                                    {isChecked || isFocused ? (
                                        <input
                                            data-1p-ignore="true"
                                            type="checkbox"
                                            className={`${
                                                isChecked ? 'cb-on' : 'cb-off'
                                            }`}
                                        ></input>
                                    ) : null}
                                </div>
                                <span>{a}</span>
                            </div>
                        </Command.Item>
                    )
                })}
            </Command.List>
        </>
    )
}
