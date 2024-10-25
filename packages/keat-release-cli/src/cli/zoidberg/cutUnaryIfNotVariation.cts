import { SourceFile, Node, ts, IfStatement, SyntaxKind } from "ts-morph";
import {
  get,
  Kind,
  hasOperator,
  getId,
  getString,
} from "../utils/ts-morph.cjs";

export function cutUnaryIfNotVariation(
  code: SourceFile,
  feature: string
): boolean {
  const ifStatements = findUnaryIfNotVariationStatements(code, feature);

  if (ifStatements.length === 0) {
    return false;
  }

  for (const ifStatement of ifStatements) {
    ifStatement.remove();
  }

  return true;
}

/**
 * Find all unary if statements which negatively evaluate variation.
 *
 * @example if (!variation("demo")) {...}
 */
function findUnaryIfNotVariationStatements(
  node: Node<ts.Node>,
  feature: string
): IfStatement[] {
  const result: IfStatement[] = [];
  const ifStatement = node.asKind(SyntaxKind.IfStatement);
  const callWithPrefix = get(ifStatement, Kind.PrefixUnaryExpression);
  const isNegation = hasOperator(callWithPrefix, "!");
  const call = get(callWithPrefix, Kind.CallExpression);
  const isVariationCall = getId(call) === "variation";
  const isForFeature = getString(get(call, Kind.SyntaxList)) === feature;

  if (ifStatement && isNegation && isVariationCall && isForFeature) {
    result.push(ifStatement);
  }

  for (const child of node.getChildren()) {
    const res = findUnaryIfNotVariationStatements(child, feature);
    result.push(...res);
  }

  return result;
}
