import chalk from "chalk";
import logSymbols from "log-symbols";
import boxen from "boxen";
import { Strands } from "strands";

export const Screen = Strands;
export const print = console.log;

export const S = logSymbols;
export const C = chalk;
export const B = boxen;

export const started = (msg: string) => `${S.success} ${msg}`;

export const success = (msg: string) => `
${C.bgGreen(C.black(" success "))} ${C.green(msg)}`;

export const failure = (msg: string) => `
${C.bgRed(C.black(" failure "))} ${C.red(msg)}`;

export const precondition = (msg: string) => `
${C.bgMagenta(C.black(" precondition "))} ${C.magenta(msg)}`;

export const warningInfo = (msg: string) => `
${C.bgYellow(C.black(" info "))} ${C.yellow(msg)}`;
