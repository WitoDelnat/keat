import {
  Block,
  KindToNodeMappings,
  Node as BaseNode,
  SyntaxKind,
  ts,
} from "ts-morph";

export type Node = BaseNode<ts.Node>;
export const Kind = SyntaxKind;

export function get<TKind extends SyntaxKind>(
  node: Node | undefined,
  kind: TKind
): KindToNodeMappings[TKind] | undefined {
  return node?.getFirstChildByKind(kind);
}

export function getAll(node: Node | undefined): Node[];
export function getAll<TKind extends SyntaxKind>(
  node: Node | undefined,
  kind?: TKind
): KindToNodeMappings[TKind][];
export function getAll<TKind extends SyntaxKind>(
  node: Node | undefined,
  kind?: TKind
) {
  if (!node) return [];
  if (!kind) return node.getChildren();
  return node.getChildrenOfKind(kind);
}

export function getAllRec(node: Node | undefined): Node[];
export function getAllRec<TKind extends SyntaxKind>(
  node: Node | undefined,
  kind?: TKind
): KindToNodeMappings[TKind][];
export function getAllRec<TKind extends SyntaxKind>(
  node: Node | undefined,
  kind?: TKind
) {
  if (!node) return [];
  if (!kind) return node.getDescendants();
  return node.getDescendantsOfKind(kind);
}

export function getId(node: Node | undefined): string | undefined {
  const id = get(node, Kind.Identifier);
  return id?.getText();
}

export function getString(node: Node | undefined): string | undefined {
  const string = get(node, Kind.StringLiteral);
  return string?.getLiteralValue();
}

export function getNumber(node: Node | undefined): number | undefined {
  const number = get(node, Kind.NumericLiteral);
  return number?.getLiteralValue();
}

export function getObject(node: Node | undefined) {
  return get(node, Kind.ObjectLiteralExpression);
}

export function getArray(node: Node | undefined) {
  return get(node, Kind.ArrayLiteralExpression);
}

export function getJsx(node: Node | undefined) {
  const el = get(node, Kind.JsxElement);
  const tag = get(node, Kind.JsxOpeningElement);
  return { el, tag };
}
export function getJsxTag(node: Node | undefined) {
  const tag = get(node, Kind.JsxOpeningElement);
  return tag;
}

export function hasOperator(
  node: Node | undefined,
  operator: "!" | "+" | "--" | "++" | "~"
): boolean {
  if (!node) return false;
  const prefixUnaryExpression = node?.asKind(Kind.PrefixUnaryExpression);
  return prefixUnaryExpression?.getOperatorToken() === operatorMap[operator];
}

const operatorMap = {
  "!": SyntaxKind.ExclamationToken,
  "+": SyntaxKind.PlusToken,
  "++": SyntaxKind.PlusPlusToken,
  "-": SyntaxKind.MinusToken,
  "--": SyntaxKind.MinusMinusToken,
  "~": SyntaxKind.TildeToken,
};

export function deleteDeadCode(
  block: Block | undefined,
  from: number,
  to?: number
) {
  if (!block) return;
  to = to === undefined ? block.getChildCount() : to;
  block.removeStatements([from, to]);
}
