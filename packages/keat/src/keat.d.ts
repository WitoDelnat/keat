import type { AnyFeatures, Config, KeatApi, KeatInit } from "./types";
export type ExtractFeatures<K> = K extends KeatApi<infer K> ? keyof K : never;
export type Listener = (config?: Config) => void;
export type Unsubscribe = () => void;
export declare function keatCore<TFeatures extends AnyFeatures>({ features, display, plugins, }: KeatInit<TFeatures>): KeatApi<TFeatures>;
