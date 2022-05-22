import { FeatureDisplay } from "./types";

export class Display {
  #run: Record<FeatureDisplay, Promise<void>>;
  #result: Record<FeatureDisplay, "remote" | "fallback" | undefined> = {
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

  evaluate(display: FeatureDisplay): "remote" | "fallback" | undefined {
    return this.#result[display];
  }

  #init() {
    this.#initBlock();
    this.#initSwap();
    this.#initFallback();
    this.#initOptional();
  }

  #initBlock() {
    this.#initializing.then(() => {
      this.#result.block = "remote";
    });
    this.#delay.then(() => {
      if (this.#result.block) return;
      this.#result.block = "fallback";
    });
  }

  #initSwap() {
    this.#initializing.then(() => {
      this.#result.swap = "remote";
    });
    this.#result.swap = "fallback";
  }

  #initFallback() {
    let swapDeadlineMissed = false;
    this.#initializing.then(() => {
      if (swapDeadlineMissed) return;
      this.#result.fallback = "remote";
    });
    this.#delay.then(() => (swapDeadlineMissed = true));
    this.#delayShort.then(() => {
      if (this.#result.fallback) return;
      this.#result.fallback = "fallback";
    });
  }

  #initOptional() {
    this.#initializing.then(() => {
      if (this.#result.optional) return;
      this.#result.optional = "remote";
    });
    this.#delayShort.then(() => {
      if (this.#result.optional) return;
      this.#result.optional = "fallback";
    });
  }
}

export function pause(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
