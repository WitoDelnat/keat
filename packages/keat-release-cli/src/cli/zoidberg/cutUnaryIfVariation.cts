import { last } from "lodash";
import { SourceFile, Node, ts, IfStatement, SyntaxKind } from "ts-morph";
import { nodeWriter } from "../utils/codeBlockWriter.cjs";
import {
  Kind,
  getId,
  getString,
  get,
  deleteDeadCode,
} from "../utils/ts-morph.cjs";

export function cutUnaryIfVariation(
  code: SourceFile,
  feature: string
): boolean {
  const ifStatements = findUnaryIfStatements(code, feature);

  if (ifStatements.length === 0) {
    return false;
  }

  for (const ifStatement of ifStatements) {
    const block = get(ifStatement, Kind.Block);
    const children = block?.getChildren()?.[1]?.getChildren() ?? [];

    const index = ifStatement.getChildIndex();
    const parent = ifStatement.getParent();
    const parentBlock = parent.asKind(Kind.Block);

    const isBlockWithReturn = last(children)?.isKind(Kind.ReturnStatement);
    if (isBlockWithReturn) {
      deleteDeadCode(parentBlock, index + 1);
    }

    const newCode = parentBlock?.insertStatements(index, nodeWriter(children));
    ifStatement.remove();
    newCode?.forEach((n) => n.formatText());
  }

  return true;
}

/**
 * Find all unary if statements
 *
 * @example if (variation("demo")) {...}
 */
function findUnaryIfStatements(
  node: Node<ts.Node>,
  feature: string
): IfStatement[] {
  const result: IfStatement[] = [];
  const ifStatement = node.asKind(SyntaxKind.IfStatement);
  const call = get(ifStatement, Kind.CallExpression);
  const isVariationCall = getId(call) === "variation";
  const isForFeature = getString(get(call, Kind.SyntaxList)) === feature;

  if (ifStatement && isVariationCall && isForFeature) {
    result.push(ifStatement);
  }

  for (const child of node.getChildren()) {
    const res = findUnaryIfStatements(child, feature);
    result.push(...res);
  }

  return result;
}
