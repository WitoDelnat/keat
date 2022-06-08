import React, { ReactNode, useEffect } from "react";
import { AnyFeatures, Display, KeatApi, keatCore, KeatInit } from "../core";

type KeatReactApi<TFeatures extends AnyFeatures> = KeatApi<TFeatures> & {
  useKeat(display?: Display): {
    loading: boolean;
    variation: KeatApi<TFeatures>["variation"];
    setUser: KeatApi<TFeatures>["setUser"];
  };
  FeatureBoundary<TFeature extends keyof TFeatures>(args: {
    name: TFeature;
    invisible?: ReactNode;
    children?: ReactNode;
    fallback?: ReactNode;
    display?: Display;
  }): JSX.Element;
};

export function keatReact<TFeatures extends AnyFeatures>(
  init: KeatInit<TFeatures>
): KeatReactApi<TFeatures> {
  const keatInstance = keatCore(init);

  return {
    ...keatInstance,
    useKeat(display) {
      const [loading, setLoading] = React.useState(true);

      useEffect(() => {
        keatInstance.ready(display).then(() => setLoading(false));
      }, [setLoading]);

      return {
        loading,
        variation: keatInstance.variation,
        setUser: keatInstance.setUser,
      };
    },
    FeatureBoundary({
      display,
      name,
      invisible = null,
      fallback = null,
      children,
    }) {
      const [loading, setLoading] = React.useState(true);

      useEffect(() => {
        keatInstance.ready(display).then(() => setLoading(false));
      }, [setLoading]);

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
