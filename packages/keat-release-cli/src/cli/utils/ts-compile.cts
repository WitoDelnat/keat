import ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { isDefined } from "./basics.cjs";
import { uniq } from "lodash";

export function checkForError(tsconfigPath: string, debug: boolean = false) {
  const diagnostics = compile(tsconfigPath);

  if (debug) {
    reportDiagnostics(diagnostics);
  }

  return uniq(diagnostics.map((d) => d.file?.fileName).filter(isDefined));
}

function compile(configFileName: string): ts.Diagnostic[] {
  const config = readConfigFile(configFileName);

  const program = ts.createProgram(config.fileNames, {
    ...config.options,
    noEmit: true,
  });

  const emitResult = program.emit();
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  return diagnostics;
}

function readConfigFile(configPath: string) {
  const config = fs.readFileSync(configPath).toString();
  const result = ts.parseConfigFileTextToJson(configPath, config);
  const configObject = result.config;

  if (!configObject) {
    throw new Error("tsconfig_not_found");
  }

  const configParsed = ts.parseJsonConfigFileContent(
    configObject,
    ts.sys,
    path.dirname(configPath)
  );

  if (configParsed.errors.length > 0) {
    throw new Error("tsconfig_invalid");
  }

  return configParsed;
}

export function reportDiagnostics(diagnostics: ts.Diagnostic[]): void {
  diagnostics.forEach((diagnostic) => {
    let message = "Error";
    if (diagnostic.file) {
      let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start as any
      );
      message += ` ${diagnostic.file.fileName} (${line + 1},${character + 1})`;
    }
    message +=
      ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    console.log(message);
  });
}
