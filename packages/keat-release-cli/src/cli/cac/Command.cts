import CAC from "./CAC.cjs";
import Option, { OptionConfig } from "./Option.cjs";
import {
  removeBrackets,
  findAllBrackets,
  findLongest,
  padRight,
  CACError,
} from "./utils.cjs";
import { platformInfo } from "./node.cjs";
import { groupBy, upperCase } from "lodash";

interface CommandArg {
  required: boolean;
  value: string;
  variadic: boolean;
}

interface HelpSection {
  title?: string;
  body: string;
}

interface CommandConfig {
  allowUnknownOptions?: boolean;
  ignoreOptionDefaultValue?: boolean;
}

type HelpCallback = (sections: HelpSection[]) => void | HelpSection[];

type CommandExample = ((bin: string) => string) | string;

class Command {
  options: Option[];
  aliasNames: string[];
  /* Parsed command name */
  name: string;
  args: CommandArg[];
  commandAction?: (...args: any[]) => any;
  usageText?: string;
  fullDescription?: string;
  commandGroup?: string;
  versionNumber?: string;
  examples: CommandExample[];
  helpCallback?: HelpCallback;
  globalCommand?: GlobalCommand;
  subcommands: Command[];

  constructor(
    public rawName: string,
    public shortDescription: string,
    public config: CommandConfig = {},
    public cli: CAC
  ) {
    this.options = [];
    this.aliasNames = [];
    this.name = removeBrackets(rawName);
    this.args = findAllBrackets(rawName);
    this.examples = [];
    this.subcommands = [];
  }

  usage(text: string) {
    this.usageText = text;
    return this;
  }

  group(group: "core" | "additional") {
    this.commandGroup = group;
    return this;
  }

  description(text: string) {
    this.fullDescription = text;
    return this;
  }

  subcommand(rawName: string, description?: string, config?: CommandConfig) {
    const subcommand = new Command(
      rawName,
      description || "",
      config,
      this.cli
    );
    subcommand.globalCommand = this.globalCommand;
    this.subcommands.push(subcommand);
    return subcommand;
  }

  allowUnknownOptions() {
    this.config.allowUnknownOptions = true;
    return this;
  }

  ignoreOptionDefaultValue() {
    this.config.ignoreOptionDefaultValue = true;
    return this;
  }

  version(version: string, customFlags = "-v, --version") {
    this.versionNumber = version;
    this.option(customFlags, "Show version number");
    return this;
  }

  example(example: CommandExample) {
    this.examples.push(example);
    return this;
  }

  /**
   * Add a option for this command
   * @param rawName Raw option name(s)
   * @param description Option description
   * @param config Option config
   */
  option(rawName: string, description: string, config?: OptionConfig) {
    const option = new Option(rawName, description, config);
    this.options.push(option);
    return this;
  }

  alias(name: string) {
    this.aliasNames.push(name);
    return this;
  }

  action(callback: (...args: any[]) => any) {
    this.commandAction = callback;
    return this;
  }

  /**
   * Check if a command name is matched by this command
   * @param name Command name
   */
  isMatched(name: string) {
    return this.name === name || this.aliasNames.includes(name);
  }

  get isDefaultCommand() {
    return this.name === "" || this.aliasNames.includes("!");
  }

  get isGlobalCommand(): boolean {
    return this instanceof GlobalCommand;
  }

  /**
   * Check if an option is registered in this command
   * @param name Option name
   */
  hasOption(name: string) {
    name = name.split(".")[0];
    return this.options.find((option) => {
      return option.names.includes(name);
    });
  }

  outputHelp() {
    const { name, commands } = this.cli;
    const { options: globalOptions, helpCallback } = this.cli.globalCommand;

    let sections: HelpSection[] = [];

    sections.push({
      body: this.fullDescription ?? this.shortDescription,
    });

    sections.push({
      title: "Usage",
      body: `  ${name} ${this.usageText || this.rawName}`,
    });

    const showCommands =
      (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0;

    if (showCommands) {
      const grouped = groupBy(commands, (c) => c.commandGroup ?? "core");
      const longestCommandName = findLongest(
        commands.map((command) =>
          command.isDefaultCommand ? "release" : command.name
        )
      );

      sections.push({
        title: `core commands`,
        body: (grouped["core"] ?? [])
          .map((command) => {
            const isGlobalCommand = command.isDefaultCommand;

            if (isGlobalCommand) {
              const name = padRight(`release`, longestCommandName.length);
              return `  ${name}  Toggle feature flags`;
            } else {
              const name = padRight(command.name, longestCommandName.length);
              const description = command.shortDescription;
              return `  ${name}  ${description}`;
            }
          })
          .join("\n"),
      });

      sections.push({
        title: `additional commands`,
        body: (grouped["additional"] ?? [])
          .map((command) => {
            return `  ${padRight(command.name, longestCommandName.length)}  ${
              command.shortDescription
            }`;
          })
          .join("\n"),
      });
    }

    const showSubcommands =
      !this.isGlobalCommand &&
      !this.isDefaultCommand &&
      this.subcommands.length > 0;

    if (showSubcommands) {
      const longestCommandName = findLongest(
        this.subcommands.map((command) => command.name)
      );
      sections.push({
        title: `Commands`,
        body: this.subcommands
          .map((command) => {
            return `  ${padRight(command.name, longestCommandName.length)}  ${
              command.shortDescription
            }`;
          })
          .join("\n"),
      });
    }

    let options = this.isGlobalCommand
      ? globalOptions
      : [...this.options, ...(globalOptions || [])];
    if (!this.isGlobalCommand && !this.isDefaultCommand) {
      options = options.filter((option) => option.name !== "version");
    }
    if (options.length > 0) {
      const longestOptionName = findLongest(
        options.map((option) => `--${option.name}`)
      );
      sections.push({
        title: "Options",
        body: options
          .filter((o) => !o.config.hide)
          .map((option) => {
            return `  ${padRight(
              `--${option.name}`,
              longestOptionName.length
            )}  ${option.description} ${
              option.config.default === undefined
                ? ""
                : `(default: ${option.config.default})`
            }`;
          })
          .join("\n"),
      });
    }

    if (this.examples.length > 0) {
      sections.push({
        title: "Examples",
        body: this.examples
          .map((example) => {
            if (typeof example === "function") {
              return example(name);
            }
            return example;
          })
          .join("\n"),
      });
    }

    if (helpCallback) {
      sections = helpCallback(sections) || sections;
    }

    console.log(
      sections
        .map((section) => {
          return section.title
            ? ` ${upperCase(section.title)}\n${section.body}`
            : section.body;
        })
        .join("\n\n")
    );
  }

  outputVersion() {
    const { name } = this.cli;
    const { versionNumber } = this.cli.globalCommand;
    if (versionNumber) {
      console.log(`${name}/${versionNumber} ${platformInfo}`);
    }
  }

  checkRequiredArgs() {
    const minimalArgsCount = this.args.filter((arg) => arg.required).length;

    if (this.cli.args.length < minimalArgsCount) {
      throw new CACError(
        `missing required args for command \`${this.rawName}\``
      );
    }
  }

  /**
   * Check if the parsed options contain any unknown options
   *
   * Exit and output error when true
   */
  checkUnknownOptions() {
    const { options, globalCommand } = this.cli;

    if (!this.config.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (
          name !== "--" &&
          !this.hasOption(name) &&
          !globalCommand.hasOption(name)
        ) {
          throw new CACError(
            `Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``
          );
        }
      }
    }
  }

  /**
   * Check if the required string-type options exist
   */
  checkOptionValue() {
    const { options: parsedOptions, globalCommand } = this.cli;
    const options = [...globalCommand.options, ...this.options];
    for (const option of options) {
      const value = parsedOptions[option.name.split(".")[0]];
      // Check required option value
      if (option.required) {
        const hasNegated = options.some(
          (o) => o.negated && o.names.includes(option.name)
        );
        if (value === true || (value === false && !hasNegated)) {
          throw new CACError(`option \`${option.rawName}\` value is missing`);
        }
      }
    }
  }
}

class GlobalCommand extends Command {
  constructor(cli: CAC) {
    super("@@global@@", "", {}, cli);
  }
}

export type { HelpCallback, CommandExample, CommandConfig };

export { GlobalCommand };

export default Command;
