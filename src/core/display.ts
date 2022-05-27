import { Display } from "./types";

export function load(initialize: Promise<void>) {
  const init = initialize;
  const delayLong = pause(3000);
  const delay = pause(100);

  const loading: Record<Display, Promise<void>> = {
    block: Promise.race([init, delayLong]),
    fallback: Promise.race([init, delay]),
    optional: Promise.race([init, delay]),
    swap: Promise.resolve(),
  };
  const result: Record<Display, boolean | undefined> = {
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
    ready: (display: Display): Promise<void> => loading[display],
    useLatest: (display: Display): boolean => {
      if (result[display] === undefined) {
        const msg = `[keat] Using fallback because '${display}' is not ready. You should await keat.ready to avoid unexpected behavior.`;
        console.warn(msg);
      }
      return result[display] ?? false;
    },
  };
}

function pause(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
