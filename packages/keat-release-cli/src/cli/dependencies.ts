import type {
  format as prettierFormat,
  getFileInfo,
  resolveConfig as prettierResolveConfig,
} from "prettier";


type Prettier = {
  format: typeof prettierFormat;
  resolveConfig: typeof prettierResolveConfig;
  getFileInfo: typeof getFileInfo;
};

/**
 * Prettier is an optional dependency.
 * Lazy load it and if it fails it's absent.
 *
 * @remark imports should only be types or it might fail!
 */
export function importPrettier(): Prettier | undefined {
  try {
    const prettier = require("prettier");
    return prettier;
  } catch (err) {
    return undefined;
  }
}
