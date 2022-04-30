export class Signal<T = void> {
  private _promise: Promise<T>;
  private _fulfilled: boolean = false;
  private _resolve!: (value: T) => void;
  private _reject!: (reason?: any) => void;

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  get promise(): Promise<T> {
    return this._promise;
  }

  isFulfilled(): boolean {
    return this._fulfilled;
  }

  resolve(value: T) {
    if (this._fulfilled) return;
    this._fulfilled = true;
    this._resolve(value);
  }

  reject(reason?: any) {
    if (this._fulfilled) return;
    this._fulfilled = true;
    this._reject(reason);
  }
}
