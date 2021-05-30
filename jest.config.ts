import type { Config } from "@jest/types";

export const config: Config.InitialOptions = {
  verbose: true,
  resetMocks: false,
  preset: "ts-jest",
  setupFiles: ["./jest.setup.js"],
};

export default config;
