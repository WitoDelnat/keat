import { Display } from "./types";
export declare function load(init: PromiseLike<any>): {
    ready: (display: Display) => Promise<void>;
    useLatest: (display: Display) => boolean;
};
