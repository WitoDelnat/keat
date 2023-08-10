export function load(init) {
    const delayLong = pause(3000);
    const delay = pause(100);
    const loading = {
        block: Promise.race([init, delayLong]),
        fallback: Promise.race([init, delay]),
        optional: Promise.race([init, delay]),
        swap: Promise.resolve(),
    };
    const result = {
        block: undefined,
        fallback: undefined,
        optional: undefined,
        swap: undefined,
    };
    // block
    delayLong.then(() => (result["block"] = result["block"] ?? false));
    init.then(() => (result["block"] = true));
    // swap
    result["swap"] = false;
    init.then(() => (result["swap"] = true));
    // fallback
    let canSwap = true;
    delayLong.then(() => (canSwap = false));
    delay.then(() => (result["fallback"] = result["fallback"] ?? false));
    init.then(() => (result["fallback"] = canSwap));
    // optional
    init.then(() => (result["optional"] = result["optional"] === undefined));
    delay.then(() => (result["optional"] = result["optional"] !== undefined));
    return {
        ready: (display) => loading[display],
        useLatest: (display) => result[display] ?? false,
    };
}
function pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
