import { buildHTMLTree, nodesToHTML } from "./htmlGenerator.ts";
import type { CSVDoc } from "../core/types.ts";

/**
 * Renders a CSVDoc to an HTML string
 * @param doc - The CSVDoc to render
 * @returns The rendered HTML string
 */
export function render(doc: CSVDoc): string {
  const htmlNodes = buildHTMLTree(doc);
  return nodesToHTML(htmlNodes);
}
