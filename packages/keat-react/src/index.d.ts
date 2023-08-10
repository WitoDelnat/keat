import * as React from "react";
import { AnyFeatures, Display, KeatApi, KeatInit } from "keat";
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
export declare function keat<TFeatures extends AnyFeatures>(init: KeatInit<TFeatures>): KeatReactApi<TFeatures>;
export {};
