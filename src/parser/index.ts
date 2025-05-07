import { parseCSV } from "./csvParser.ts";
import { parseRow } from "./rowParser.ts";
import { buildHTMLTree, nodesToHTML } from "./htmlGenerator.ts";
import type { CSVRow, FileType } from "./types.ts";

/**
 * Converts CSV/TSV formatted text to HTML
 * @param input Input CSV/TSV formatted text
 * @param fileType File type ("csv" or "tsv"), defaults to "csv"
 * @returns Converted HTML
 */
export function parse(input: string, fileType: FileType = "csv"): string {
  // Parse CSV/TSV text and convert to a two-dimensional array
  const rawRows = parseCSV(input, fileType);

  // Convert each row to a CSVRow object
  const rows: CSVRow[] = rawRows.map(parseRow);

  // Build HTMLNode tree from CSVRows
  const htmlNodes = buildHTMLTree(rows);

  // Convert HTMLNode tree to HTML string
  return nodesToHTML(htmlNodes);
}
