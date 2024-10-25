import { isUndefined } from "lodash";

export function isDefined<T>(value: T | null | undefined): value is T {
  return !isUndefined(value);
}
