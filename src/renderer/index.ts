import { buildHTMLTree, nodesToHTML } from "./htmlGenerator.ts";
import type { CSVDoc } from "../core/types.ts";

export function render(doc: CSVDoc): string {
  const htmlNodes = buildHTMLTree(doc);
  return nodesToHTML(htmlNodes);
}
