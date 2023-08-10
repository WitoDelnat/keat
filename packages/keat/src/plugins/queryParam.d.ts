type Options = {
    /**
     * The key of the URL's query parameter.
     *
     * Defaults to the `name`.
     */
    key?: string;
    /**
     * The value that belongs to the key of the URL's query parameter.
     *
     * Defaults to a `has` check.
     */
    value?: string;
};
export declare const queryParam: (name: string, { key, value }?: Options) => import("../plugin").Plugin<import("../matchers").Matcher<string>>;
export {};
