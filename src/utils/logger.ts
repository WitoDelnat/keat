import pino, { Logger } from "pino";

export function createLogger(newLogger: boolean | Logger | undefined): Logger {
  const bindings = { lib: "keat" };

  if (newLogger === undefined || newLogger === false) {
    return pino({ level: "silent", base: bindings });
  } else if (newLogger === true) {
    return pino({ level: "debug", base: bindings });
  } else {
    return newLogger.child(bindings);
  }
}
