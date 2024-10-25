import { Rule } from "keat";
import { CodeBlockWriter } from "ts-morph";
import { Node } from "./ts-morph.cjs";

export const ruleWriter = (rule: Rule) => (writer: CodeBlockWriter) => {
  if (typeof rule === "string") {
    return writer.quote(rule);
  }
  if (typeof rule === "number" || typeof rule === "boolean") {
    return writer.write(`${rule}`);
  }

  writer.write("{ OR: [");

  rule.OR.forEach((subElement, index) => {
    if (typeof subElement === "string") {
      writer.quote(subElement);
    } else {
      writer.write(String(subElement));
    }

    if (index + 1 !== rule.OR.length) {
      writer.write(",");
    }
  });

  writer.write("]}");
};

export const nodeWriter = (nodes: Node[]) => (writer: CodeBlockWriter) => {
  for (const node of nodes) {
    writer.write(node.getFullText());
  }
  writer.newLine();
};
