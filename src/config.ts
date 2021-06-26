import { DefaultAudienceName } from "./core/audience";

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
  AName extends ANames,
  ANames extends string
> = {
  features: Feature<FName, AName>[];
  audiences?: Audience<ANames>[];
  userConfig?: UserConfig;
  remoteConfig?: RemoteConfig<FName>;
};

export type Feature<
  FName extends string = string,
  AName extends string = string
> = {
  name: FName;
  audience: AName | DefaultAudienceName | (AName | DefaultAudienceName)[];
  seed?: number;
};

export type Audience<AName extends string = string> = {
  name: AName;
  includes: (user?: User) => boolean;
};

export type UserConfig = {
  /**
   * The key for the property that identifies a user.
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
  Record<FNames, string>
>;
