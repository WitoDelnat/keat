import { DefaultAudience } from "./core/audience";

/**
 * Bring your own user with declaration merging:
 *
 * @example
 * ```
 * declare module 'keat' {
 *   interface KeatNode {
 *     user: { name: string, email: string, developerPreview: boolean }
 *   }
 * }
 * ```
 *
 * @remark Currently only Record<string, string | boolean | number> is allowed.
 */
export interface KeatNode {
  // user: ...
}

export type User = KeatNode extends { user: infer T } ? T : string;

export type Config<
  FName extends string,
  FAudience extends AName,
  AName extends string
> = ConfigWithAudience<FName> | ConfigWithoutAudience<FName, FAudience, AName>;

export type ConfigWithAudience<FName extends string> = {
  features: Record<FName, DefaultAudience | DefaultAudience[]>;
  userConfig?: UserConfig;
  remoteConfig?: RemoteConfig<FName>;
};

export type ConfigWithoutAudience<
  FName extends string,
  FAudience extends AName,
  AName extends string
> = {
  audiences: Record<AName, (user?: User) => boolean>;
  features: Record<
    FName,
    FAudience | DefaultAudience | (FAudience | DefaultAudience)[]
  >;
  userConfig?: UserConfig;
  remoteConfig?: RemoteConfig<FName>;
};

export type UserConfig = {
  /**
   * The key of the property identifying a user.
   * Required for sticky audiences.
   * Defaults to `'id'`.
   *
   * @example
   * type User = { sub: string, ...}
   * const userConfig = { idKey = 'sub' }
   */
  idKey?: User extends string ? undefined : keyof User;
};

export type RemoteConfig<FNames extends string = string> =
  PollingRemoteConfig<FNames>;

export type PollingRemoteConfig<FNames extends string = string> = {
  kind: "poll";
  pollInterval?: number;
  fetch: () => Promise<RemoteData<FNames>>;
  onError?: (err: Error, data: unknown) => void;
  onChange?: (data: RemoteData, previousData?: RemoteData) => void;
};

export type RemoteData<FNames extends string = string> = Partial<
  Record<FNames, string | string[]>
>;
