import * as React from "react";
import { keatCore } from "keat";
export function keat(init) {
    const keatInstance = keatCore(init);
    return {
        ...keatInstance,
        useKeat(display) {
            const [loading, setLoading] = React.useState(true);
            React.useEffect(() => {
                keatInstance.ready(display).then(() => setLoading(false));
            }, [setLoading]);
            return {
                loading,
                variation: keatInstance.variation,
                setUser: keatInstance.identify,
            };
        },
        useVariation() {
            return keatInstance.variation;
        },
        FeatureBoundary({ display, name, invisible = null, fallback = null, children, }) {
            const [loading, setLoading] = React.useState(true);
            const [_, forceUpdate] = React.useReducer((x) => x + 1, 0);
            React.useEffect(() => {
                keatInstance.ready(display).then(() => setLoading(false));
            }, [setLoading]);
            React.useEffect(() => {
                const unsubscribe = keatInstance.onChange(forceUpdate);
                return () => unsubscribe();
            }, []);
            if (loading) {
                return React.createElement(React.Fragment, null, invisible);
            }
            return keatInstance.variation(name, undefined, display) ? (React.createElement(React.Fragment, null, children)) : (React.createElement(React.Fragment, null, fallback));
        },
    };
}
