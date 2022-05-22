import { FeatureDisplay } from "./types";

export class Display {
  #run: Record<FeatureDisplay, Promise<void>>;
  #useLatest: Record<FeatureDisplay, boolean | undefined> = {
    block: undefined,
    fallback: undefined,
    optional: undefined,
    swap: undefined,
  };

  #initializing;
  #delay = pause(3000);
  #delayShort = pause(100);

  constructor(initializing: Promise<void>) {
    this.#initializing = initializing;
    this.#run = {
      block: Promise.race([initializing, this.#delay]),
      fallback: Promise.race([initializing, this.#delayShort]),
      optional: Promise.race([initializing, this.#delayShort]),
      swap: Promise.resolve(),
    };
    this.#init();
  }

  ready(display: FeatureDisplay): Promise<void> {
    return this.#run[display];
  }

  useLatest(display: FeatureDisplay): boolean | undefined {
    return this.#useLatest[display];
  }

  #init() {
    this.#initBlock();
    this.#initSwap();
    this.#initFallback();
    this.#initOptional();
  }

  #initBlock() {
    this.#initializing.then(() => {
      this.#useLatest.block = true;
    });
    this.#delay.then(() => {
      if (this.#useLatest.block) return;
      this.#useLatest.block = false;
    });
  }

  #initSwap() {
    this.#initializing.then(() => {
      this.#useLatest.swap = true;
    });
    this.#useLatest.swap = false;
  }

  #initFallback() {
    let swapDeadlineMissed = false;
    this.#initializing.then(() => {
      if (swapDeadlineMissed) return;
      this.#useLatest.fallback = true;
    });
    this.#delay.then(() => (swapDeadlineMissed = true));
    this.#delayShort.then(() => {
      if (this.#useLatest.fallback) return;
      this.#useLatest.fallback = false;
    });
  }

  #initOptional() {
    this.#initializing.then(() => {
      if (this.#useLatest.optional) return;
      this.#useLatest.optional = true;
    });
    this.#delayShort.then(() => {
      if (this.#useLatest.optional) return;
      this.#useLatest.optional = false;
    });
  }
}

export function pause(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
