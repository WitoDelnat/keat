export type Matcher<T = any> = (literal: unknown) => T | null;

export const isNone: Matcher<never> = () => {
  return null;
};

export const isAny: Matcher<any> = (literal) => {
  return literal;
};

export const isBoolean: Matcher<boolean> = (literal) => {
  return typeof literal === "boolean" ? literal : null;
};

export const isString: Matcher<string> = (literal) => {
  return typeof literal === "string" ? literal : null;
};

export const isNumber: Matcher<number> = (literal) => {
  return typeof literal === "number" ? literal : null;
};

export const isDate: Matcher<Date> = (literal) => {
  const date = typeof literal === "string" ? Date.parse(literal) : NaN;
  return isNaN(date) ? new Date(date) : null;
};
