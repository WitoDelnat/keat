export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const listener = () => {
      clearTimeout(timer);
      resolve();
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", listener);
      resolve();
    }, ms);

    if (signal?.aborted) {
      listener();
    }

    signal?.addEventListener("abort", listener);
  });
}
