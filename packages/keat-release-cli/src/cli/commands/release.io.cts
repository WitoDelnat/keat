import { startCase } from "lodash";
import prompts from "prompts";
import { Aborted } from "../errors.cjs";
import { C, print, S } from "../utils/screens.cjs";

/* * * * * * * * * * * *
 * Screens
 * * * * * * * * * * * */
export const writeRequested = (target: string, diffString: string) => `
About to write these changes to ${target}:

${diffString}
`;

export const success = (feature: string, isEmbedded: boolean) => `
${S.success} Pruned '${feature}' feature from ${target(isEmbedded)}.

`;

const target = (isEmbedded: boolean) =>
  isEmbedded ? "your embedded config" : "the edge";

/* * * * * * * * * * * *
 * Prompts
 * * * * * * * * * * * */
export async function promptStage(stages: string[]): Promise<string> {
  const { result } = await prompts({
    type: "select",
    name: "result",
    message: "Select stage",
    choices: stages.map((stage) => ({
      title:
        stage.toLowerCase() === "ga"
          ? "General Availability (GA)"
          : startCase(stage),
      value: stage,
    })),
    instructions: false,
    hint: " ",
  });

  if (!result) {
    print(
      `${C.bgYellow(C.black(" cancelled "))} ${C.yellow(
        " You have stopped selecting a stage."
      )}`
    );
    throw new Aborted();
  }

  return result;
}

export async function promptFeatures(features: string[]): Promise<string[]> {
  const { result } = await prompts({
    type: "autocompleteMultiselect",
    name: "result",
    message: "Select features",
    choices: features.map((feature) => ({
      title: startCase(feature),
      value: feature,
    })),
    instructions: false,
  });

  if (!result) {
    print(
      `${C.bgYellow(C.black(" cancelled "))} ${C.yellow(
        " You have stopped selecting features."
      )}`
    );
    throw new Aborted();
  }

  return result;
}

export async function promptFeature(features: string[]): Promise<string> {
  const { result } = await prompts({
    type: "autocomplete",
    name: "result",
    message: "Select a feature",
    choices: features.map((feature) => ({
      title: startCase(feature),
      value: feature,
    })),
    instructions: false,
  });

  if (!result) {
    print(
      `${C.bgYellow(C.black(" cancelled "))} ${C.yellow(
        " You have stopped selecting a feature."
      )}`
    );
    throw new Aborted();
  }

  return result;
}
