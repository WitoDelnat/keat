import React, { ReactNode, useEffect } from "react";
import { AnyFeatures, Display, keat, KeatInit } from "../core";

export function keatReact<TFeatures extends AnyFeatures>(
  init: KeatInit<TFeatures>
) {
  const keatInstance = keat(init);

  return {
    useKeat(display?: Display) {
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
    FeatureBoundary<TFeature extends keyof TFeatures>({
      display,
      name,
      invisible = null,
      fallback = null,
      children,
    }: {
      name: TFeature;
      invisible?: ReactNode;
      children?: ReactNode;
      fallback?: ReactNode;
      display?: Display;
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
