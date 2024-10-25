import prompts from "prompts";
import { C, print } from "./screens.cjs";

export async function confirm({
  message = "Continue?",
  cancel,
  skip = false,
}: {
  message?: string;
  cancel: string;
  skip?: boolean;
}) {
  if (skip) {
    return true;
  }

  const { result } = await prompts({
    type: "confirm",
    name: "result",
    message,
  });

  if (!result) {
    print(`${C.bgYellow(C.black(" cancelled "))} ${C.yellow(cancel)}`);
    throw new Error("aborted");
  }

  return true;
}
