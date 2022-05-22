import React, { ReactNode, useEffect, useState } from "react";
import { FeatureDisplay, Keat, KeatInit, RawFeatures } from "../core";

export class KeatReact {
  static create<TFeatures extends RawFeatures>(init: KeatInit<TFeatures>) {
    const keat = new Keat(init);

    return {
      useKeat(display?: FeatureDisplay) {
        const [loading, setLoading] = useState(true);

        useEffect(() => {
          keat.ready(display).then(() => setLoading(false));
        }, [setLoading]);

        return { variation: keat.variation, loading };
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
        display?: FeatureDisplay;
      }) {
        const [loading, setLoading] = useState(true);

        useEffect(() => {
          keat.ready(display).then(() => setLoading(false));
        }, [setLoading]);

        if (loading) {
          return <>{invisible}</>;
        }

        return keat.variation(name, undefined, display) ? (
          <>{children}</>
        ) : (
          <>{fallback}</>
        );
      },
    };
  }
}
