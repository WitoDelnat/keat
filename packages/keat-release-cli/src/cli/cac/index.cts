import CAC from "./CAC.cjs";
import Command from "./Command.cjs";

/**
 * @param name The program name to display in help and version message
 */
const cac = (name = "") => new CAC(name);

export { cac, Command };
