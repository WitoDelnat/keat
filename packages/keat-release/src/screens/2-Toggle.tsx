import { Command } from 'cmdk'
import React, { useCallback, useEffect } from 'react'
import { useKeatContext } from '../KeatContext'
import { AssignToMeIcon } from '../Icons'
import { BackButton, Header } from '../components/Header'

const ROLLOUT_OPTIONS = [
    { label: 'Nobody', value: false },
    { label: '1%', value: 1 },
    { label: '2%', value: 2 },
    { label: '3%', value: 3 },
    { label: '5%', value: 5 },
    { label: '8%', value: 8 },
    { label: '13%', value: 13 },
    { label: '21%', value: 21 },
    { label: '34%', value: 34 },
    { label: '55%', value: 55 },
    { label: '89%', value: 89 },
    { label: 'Everyone', value: true },
]

export function ToggleScreen() {
    const { app, feature, setScreen, rule, setRule } = useKeatContext()

    const handleToggle = useCallback(
        (rule: string | boolean | number) => {
            setRule(rule)
            setScreen('confirm')
        },
        [setRule, setScreen]
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
            <Command.Input autoFocus placeholder="e.g. tomorrow at 5pm" />
            <Command.List>
                <Command.Empty>No results found.</Command.Empty>

                <Command.Group heading="Rollout to…" className="rollout">
                    {ROLLOUT_OPTIONS.map((i) => {
                        const targetted = i.value === rule
                        return (
                            <Command.Item
                                key={`rollout-${i.value}`}
                                value={String(i.value)}
                                onSelect={() => handleToggle(i.value)}
                                className={
                                    targetted ? 'rollout target' : 'rollout'
                                }
                            >
                                {i.label}
                            </Command.Item>
                        )
                    })}
                </Command.Group>

                {(app?.audiences.length ?? 0) > 0 ? (
                    <Command.Group heading="Audiences">
                        {Object.keys(app?.audiences ?? {}).map((a) => {
                            return (
                                <Command.Item
                                    key="connect"
                                    value="connect"
                                    onSelect={() => handleToggle(a)}
                                >
                                    <AssignToMeIcon />
                                    {a}
                                </Command.Item>
                            )
                        })}
                    </Command.Group>
                ) : null}
            </Command.List>
        </>
    )
}
