import type { FileType } from "./core/types.ts";
import { parse } from "./parser/index.ts";
import { render } from "./renderer/index.ts";

export type { CSVDoc, CSVRow, Tag, Attribute } from "./core/types.ts";
export { parse } from "./parser/index.ts";
export { render } from "./renderer/index.ts";

/**
 * Transforms a CSV or TSV string into an HTML document
 * @param input - The CSV or TSV string to transform
 * @param fileType - The type of file (CSV or TSV)
 * @returns The transformed HTML string
 */
export function transform(input: string, fileType: FileType = "csv"): string {
  const doc = parse(input, fileType);
  return render(doc);
}
