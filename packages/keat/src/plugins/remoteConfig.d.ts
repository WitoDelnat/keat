type RemoteConfigPluginOptions = {
    interval?: number;
    retries?: number;
};
export declare const remoteConfig: (url: string, rawOptions?: RemoteConfigPluginOptions) => import("../plugin").Plugin<(literal: unknown) => unknown>;
export {};
