type Options = {
    /**
     * The key of the local storage entry.
     *
     * Defaults to the `name`.
     */
    key?: string;
    /**
     * The value that's expected for the local storage entry.
     *
     * Defaults to a `has` check.
     */
    value?: string;
    /**
     * Whether the local storage is polled for updated.
     *
     * The default polling time every 2 seconds.
     * You can change it by setting a number (in ms).
     */
    poll?: boolean | number;
};
export declare const localStorage: (name: string, { key, value, poll }?: Options) => import("../plugin").Plugin<import("../matchers").Matcher<void>> | import("../plugin").Plugin<import("../matchers").Matcher<string>>;
export {};
