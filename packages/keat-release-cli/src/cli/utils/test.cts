import { ArgumentsCamelCase } from "yargs";

export function test<TArgs>(
  handler: (args: ArgumentsCamelCase<TArgs>) => void | Promise<void>,
  args: TArgs
) {
  return handler({ $0: "", _: [""], ...args } as ArgumentsCamelCase<TArgs>);
}
