export type Matcher<T = any> = (literal: unknown) => T | null;
export declare const isNone: Matcher<never>;
export declare const isAny: Matcher<any>;
export declare const isBoolean: Matcher<boolean>;
export declare const isString: Matcher<string>;
export declare const isNumber: Matcher<number>;
export declare const isDate: Matcher<Date>;
