import * as React from 'react'
import { AnyFeatures, Display, KeatApi, keatCore, KeatInit } from 'keat'

type KeatReactApi<TFeatures extends AnyFeatures> = KeatApi<TFeatures> & {
    useKeat(display?: Display): {
        isLoading: boolean
        setConfig: KeatApi<TFeatures>['setConfig']
        setContext: KeatApi<TFeatures>['setContext']
    }
    useFeatureFlag<TFeature extends keyof TFeatures>(name: TFeature): boolean
    useFeatureFlagReady(display?: Display): boolean
    FeatureBoundary<TFeature extends keyof TFeatures>(args: {
        name: TFeature
        invisible?: React.ReactNode
        children?: React.ReactNode
        fallback?: React.ReactNode
        display?: Display
    }): JSX.Element
}

export function keat<TFeatures extends AnyFeatures>(
    appId: string,
    init: KeatInit<TFeatures>
): KeatReactApi<TFeatures> {
    const keatInstance = keatCore(appId, init)

    const useFeatureFlagReady = (display: Display = 'block') => {
        const [ready, setReady] = React.useState(false)
        React.useEffect(() => {
            keatInstance.ready(display).then(() => setReady(true))
        }, [setReady])
        return ready
    }

    return {
        ...keatInstance,
        useKeat(display?: Display) {
            const ready = useFeatureFlagReady(display)
            return {
                isLoading: !ready,
                setConfig: keatInstance.setConfig,
                setContext: keatInstance.setContext,
            }
        },
        useFeatureFlagReady,
        useFeatureFlag(feature) {
            return keatInstance.get(feature)
        },
        FeatureBoundary({
            display,
            name,
            invisible = null,
            fallback = null,
            children,
        }) {
            const ready = useFeatureFlagReady(display)
            const [_, forceUpdate] = React.useReducer((x) => x + 1, 0)

            React.useEffect(() => {
                const unsubscribe = keatInstance.onChange(forceUpdate)
                return () => unsubscribe()
            }, [])

            if (!ready) {
                return <>{invisible}</>
            }

            return keatInstance.get(name) ? <>{children}</> : <>{fallback}</>
        },
    }
}
