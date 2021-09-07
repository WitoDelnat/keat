import { KeatRemoteConfig } from "../config";
import { Engine } from "../core";
import { Signal } from "../utils/signal";
import { isRemoteData } from "../utils/types";
import { Synchronizer } from "./types";

export class KeatSynchronizer implements Synchronizer {
  private _source?: EventSource;
  private _signal: Signal = new Signal();

  constructor(private init: KeatRemoteConfig, private engine: Engine) {}

  get ready() {
    return this._signal.promise;
  }

  start() {
    const url = `${this.init.origin}/sync?app=${this.init.application}`;
    this._source = new EventSource(url);

    this._source.onerror = () => {
      this.init.onError?.(new Error("event source failed"));
    };

    this._source.onmessage = (event) => {
      let remoteConfig;
      try {
        remoteConfig = JSON.parse(event.data);

        if (!isRemoteData(remoteConfig)) {
          throw new Error("invalid format");
        }

        this.engine.features = remoteConfig;
      } catch (err) {
        this.init.onError?.(err, remoteConfig);
      } finally {
        this._signal.resolve();
      }
    };
  }

  async stop() {
    this._source?.close();
    return Promise.resolve();
  }
}
