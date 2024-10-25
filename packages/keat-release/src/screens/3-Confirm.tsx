import React, { ChangeEvent, useCallback } from 'react'
import { useKeatContext } from '../KeatContext'
import { toggle } from '../api'
import { Header } from '../components/Header'

const CONFIRMATION = 'Release to many people'

export function ConfirmScreen() {
    const { reset, app, feature, rule } = useKeatContext()
    const handleConfirm = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            if (value !== CONFIRMATION) {
                return
            }
            const id = (globalThis as any).__keat.apps.at(0).app
            const key = localStorage.getItem('__keat_key')
            if (!key || !app || !feature || rule === undefined) return
            toggle(id, feature, rule)
            reset()
        },
        [reset, app]
    )

    return (
        <>
            <Header />
            <input
                className="confirm"
                autoFocus
                placeholder={`Confirm with '${CONFIRMATION}'`}
                onChange={handleConfirm}
            />

            <div className="warning">
                <div className="warning-header">
                    <div>This toggle might affect many users</div>
                    <div>Are you certain you want to continue?</div>
                </div>
                <div className="warning-action">
                    <div>Type "{CONFIRMATION}" to proceed</div>
                </div>
            </div>
        </>
    )
}
