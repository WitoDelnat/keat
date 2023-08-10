export const isNone = () => {
    return null;
};
export const isAny = (literal) => {
    return literal;
};
export const isBoolean = (literal) => {
    return typeof literal === "boolean" ? literal : null;
};
export const isString = (literal) => {
    return typeof literal === "string" ? literal : null;
};
export const isNumber = (literal) => {
    return typeof literal === "number" ? literal : null;
};
export const isDate = (literal) => {
    const date = typeof literal === "string" ? Date.parse(literal) : NaN;
    return isNaN(date) ? new Date(date) : null;
};
