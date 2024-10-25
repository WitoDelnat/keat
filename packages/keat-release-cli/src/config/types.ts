// import type Builder from "./builder";

// export interface ReleaseTypes {
//   Environments: {};
//   Stages: {};
//   Root: object;
// }

// export type Stage = {
//   name: string;
// };

// export type EnvThunk<T> = any;
// export type StageThunk<T> = any;

// declare global {
//   export namespace KeatReleaseTypes {
//     export interface SchemaBuilder<Types extends ReleaseTypes>
//       extends Builder<Types> {}

//     // export interface InterfaceFieldBuilder<
//     //   Types extends ReleaseTypes,
//     //   ParentShape
//     // > extends FieldBuilder<Types, ParentShape, "Interface"> {}

//     export interface DefaultReleaseTypes {
//       Environments: {};
//       Stages: {};
//     }

//     export interface ExtendDefaultTypes<
//       PartialTypes extends Partial<DefaultReleaseTypes>
//     > extends ReleaseTypes {
//       Stages: PartialTypes["Stages"] & {};
//     }
//   }
// }

// export type StageParam<Types extends ReleaseTypes> =
//   | keyof Types["Stages"]
//   | string;

// /// helpers

// export const parentShapeKey = Symbol.for("Pothos.parentShapeKey");
// export const unknownKey = Symbol.for("Unknown");
// export const inputShapeKey = Symbol.for("Pothos.inputShapeKey");

// export type ParentShape<Types extends ReleaseTypes, T> = T extends {
//   [parentShapeKey]: infer U;
// }
//   ? U
//   : typeof unknownKey; //OutputShape<Types, T>;

// // Explanation: not yet understood
// export interface BaseEnum {
//   [s: string]: number | string;
//   [s: number]: string;
// }

// // Explanation: not yet understood
// export type StagesType<Types extends ReleaseTypes> =
//   | BaseEnum
//   | keyof Types["Stages"]
//   | {
//       [inputShapeKey]: unknown;
//     };

// // These are connected somehow..

// // This shape sets the ParentShape to Types["Root"] and kicks of the global typestore.
// export type MutationFieldsShape<Types extends ReleaseTypes> = (
//   t: KeatReleaseTypes.StageBuilder<Types, Types["Root"]>
// ) => void;

// declare global {
//   export namespace KeatReleaseTypes {
//     export interface StageBuilder<
//       Types extends ReleaseTypes,
//       ParentShape
//     > extends RootFieldBuilder<Types, ParentShape, "Stages"> {}

//     export interface RootFieldBuilder<
//       Types extends ReleaseTypes,
//       ParentShape,
//       Kind extends "Stages"
//     > extends InternalRootFieldBuilder<Types, ParentShape, Kind> {}
//   }
// }

// // Types
// // InternalX is a class
