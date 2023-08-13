import * as React from "react";
import {AnyFeatures, Display, KeatApi, keatCore, KeatInit} from "keat";

export * from "keat";

type KeatReactApi<TFeatures extends AnyFeatures> = KeatApi<TFeatures> & {
  useKeat(display?: Display): {
    loading: boolean;
    variation: KeatApi<TFeatures>["variation"];
    setUser: KeatApi<TFeatures>["identify"];
  };
  useVariation(display?: Display): KeatApi<TFeatures>["variation"];
  FeatureBoundary<TFeature extends keyof TFeatures>(args: {
    name: TFeature;
    invisible?: React.ReactNode;
    children?: React.ReactNode;
    fallback?: React.ReactNode;
    display?: Display;
  }): JSX.Element;
};

export function keat<TFeatures extends AnyFeatures>(
  init: KeatInit<TFeatures>
): KeatReactApi<TFeatures> {
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
    FeatureBoundary({
      display,
      name,
      invisible = null,
      fallback = null,
      children,
    }) {
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
        return <>{invisible}</>;
      }

      return keatInstance.variation(name, undefined, display) ? (
        <>{children}</>
      ) : (
        <>{fallback}</>
      );
    },
  };
}
