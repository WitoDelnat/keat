import { SourceFile } from "ts-morph";
import { checkForError } from "../utils/ts-compile.cjs";
import { cutFeatureBoundaries } from "./cutFeatureBoundaries.cjs";
import { cutUnaryIfNotVariation } from "./cutUnaryIfNotVariation.cjs";
import { cutUnaryIfVariation } from "./cutUnaryIfVariation.cjs";
import { modifyCode } from "../utils/modifyCode.cjs";

export type SurgeryResult = {
  performedSurgery: boolean;
  errorPaths: string[];
};

export async function surgery(
  tsconfigPath: string,
  feature: string,
  skipConfirm?: boolean
): Promise<SurgeryResult> {
  const preErrorPaths = checkForError(tsconfigPath);

  let hasCut = false;
  for (const errorPath of preErrorPaths) {
    const cut = await doSurgery(errorPath, feature, skipConfirm);
    hasCut = hasCut ?? cut;
  }

  // Needed for check for errors to work timely.
  await new Promise((r) => setTimeout(r, 50));
  const postErrorPaths = checkForError(tsconfigPath);

  return { performedSurgery: hasCut, errorPaths: postErrorPaths };
}

async function doSurgery(path: string, feature: string, skipConfirm?: boolean) {
  let hasCut = false;

  await modifyCode(path, { skipConfirm }, (code) => {
    hasCut = hasCut || cutFeatureBoundaries(code, feature);
    hasCut = hasCut || cutUnaryIfVariation(code, feature);
    hasCut = hasCut || cutUnaryIfNotVariation(code, feature);

    if (hasCut) {
      fixUnusedIdentifiers(code);
      code.organizeImports();
    }
  });

  return hasCut;
}

function fixUnusedIdentifiers(code: SourceFile) {
  // The documentation recommends to call this more than once.
  code.fixUnusedIdentifiers();
  code.fixUnusedIdentifiers();
  code.fixUnusedIdentifiers();
}
