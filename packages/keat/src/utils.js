/**
 * Utility which transforms an environment variable into a properly typed array.
 *
 * @example
 * fromEnv(process.env.ENABLE_UI_TO)
 *
 * `ENABLE_UI_TO=true` // enabled
 * `ENABLE_UI_TO=developers,5` // `['developers', 5]`
 */
/**
 * Retrieve the identifier of a user.
 */
export const DEFAULT_GET_USER_ID = (user) => {
    return user["id"] ?? user["sub"] ?? user["email"];
};
/**
 * Create a user from an identifier.
 */
export const DEFAULT_CREATE_USER = (id) => ({ id });
export function takeStrings(rule) {
    if (typeof rule === "string")
        return [rule];
    if (typeof rule !== "object")
        return [];
    const arr = mutable(rule["OR"]) ?? [];
    return arr.filter((a) => typeof a === "string");
}
export function takeNumbers(rule) {
    if (typeof rule === "number")
        return [rule];
    if (typeof rule !== "object")
        return [];
    const arr = mutable(rule["OR"]) ?? [];
    return arr.filter((a) => typeof a === "number");
}
export function takeBooleans(rule) {
    if (typeof rule === "boolean")
        return [rule];
    if (typeof rule !== "object")
        return [];
    const arr = mutable(rule["OR"]) ?? [];
    return arr.filter((a) => typeof a === "boolean");
}
export function mutable(x) {
    return x;
}
export function getVariatesMap(features) {
    const names = Object.keys(features);
    const entries = names.map((name) => [name, getVariates(features, name)]);
    return Object.fromEntries(entries);
}
export function getVariates(features, name) {
    const feat = features[name];
    return typeof feat === "object" && "variates" in feat
        ? mutable(feat.variates) ?? [true, false]
        : [true, false];
}
export function getRules(features, config, name, configId) {
    const feat = features[name];
    const remote = config[name];
    const local = isRule(feat) ? feat : feat["when"];
    return configId === 0 ? normalize(local) : normalize(remote ?? local);
}
function isRule(x) {
    return (typeof x === "boolean" ||
        typeof x === "string" ||
        typeof x === "number" ||
        (typeof x === "object" && x !== null && "OR" in x));
}
export function isLiteral(rule) {
    const t = typeof rule;
    return t === "string" || t === "number" || t === "boolean";
}
function normalize(rule) {
    return Array.isArray(rule) ? rule : rule === undefined ? undefined : [rule];
}
export function flagsToConfig(flags, variates) {
    const config = {};
    for (const [feature, variate] of Object.entries(flags)) {
        const variations = variates[feature];
        if (!variations)
            continue;
        const rule = variations.map((v) => v === variate);
        const isFalse = rule.length === 2 && rule[0] === false;
        const isTrue = rule.length === 2 && rule[0] === true;
        const simplifiedRule = isFalse ? false : isTrue ? true : rule;
        config[feature] = simplifiedRule;
    }
    return config;
}
