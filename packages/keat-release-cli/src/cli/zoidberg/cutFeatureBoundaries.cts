import { SourceFile, Node, ts, JsxElement, SyntaxKind } from "ts-morph";
import { getJsx, getJsxTag, getString, getId } from "../utils/ts-morph.cjs";

export function cutFeatureBoundaries(
  code: SourceFile,
  feature: string
): boolean {
  let result = false;
  const featureBoundaries = findFeatureBoundaries(code, feature);

  for (const boundary of featureBoundaries) {
    const { el: child } = getJsx(boundary);

    if (child) {
      boundary.replaceWithText(child.getText());
      result = true;
    } else {
      // In combination with a memo this has been
      // seen as a SyntaxList. If JSX is not valid,
      // try as fallback the first child which should be it.
      const child = boundary.getChildAtIndex(1);
      boundary.replaceWithText(child.getText());
      result = true;
    }
  }

  return result;
}

function findFeatureBoundaries(
  node: Node<ts.Node>,
  feature: string
): JsxElement[] {
  const result: JsxElement[] = [];
  const el = node.asKind(SyntaxKind.JsxElement);
  const tag = getJsxTag(el);
  const name = getString(tag?.getAttribute("name"));

  const isFeatureBoundary = getId(tag) === "FeatureBoundary";
  const hasFeature = name === feature;

  if (isFeatureBoundary) {
    console.log("debug", el?.getText(), hasFeature, name);
  }

  if (el && isFeatureBoundary && hasFeature) {
    console.log("pushed");
    result.push(el);
  }

  for (const child of node.getChildren()) {
    const res = findFeatureBoundaries(child, feature);
    result.push(...res);
  }

  return result;
}
