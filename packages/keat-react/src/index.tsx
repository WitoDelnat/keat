import * as React from 'react'
import type {
    AnyFeatures,
    Config,
    Context,
    Display,
    KeatApi,
    KeatInit,
} from 'keat'
import { createKeat as createKeatCore } from 'keat'

type KeatReactApi<TFeatures extends AnyFeatures> = KeatApi<TFeatures> & {
    useKeat(display?: Display): {
        isLoading: boolean
        configure: (config: Config) => void
        identify: (context?: Context) => void
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

export function createKeat<TFeatures extends AnyFeatures>(
    init: KeatInit<TFeatures>
): KeatReactApi<TFeatures> {
    const keat = createKeatCore(init)

    const useFeatureFlagReady = (display: Display = 'block') => {
        const [ready, setReady] = React.useState(false)
        React.useEffect(() => {
            keat.ready(display).then(() => setReady(true))
        }, [setReady])
        return ready
    }

    return {
        ...keat,
        useKeat(display?: Display) {
            const ready = useFeatureFlagReady(display)
            return {
                isLoading: !ready,
                configure: (config: Config) => {
                    keat.config = config
                },
                identify: keat.identify,
            }
        },
        useFeatureFlagReady,
        useFeatureFlag(feature) {
            return keat.get(feature)
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
                const unsubscribe = keat.onChange(forceUpdate)
                return () => unsubscribe()
            }, [])

            if (!ready) {
                return <>{invisible}</>
            }

            return keat.get(name) ? <>{children}</> : <>{fallback}</>
        },
    }
}
