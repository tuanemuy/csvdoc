import { parse as parseCSV } from "../deps.ts";
import { parseRow } from "./rowParser.ts";
import type { CSVDoc, CSVRow, FileType } from "../core/types.ts";

/**
 * Parses a CSV or TSV string and converts it to a CSVDoc
 * @param input - The CSV or TSV string to parse
 * @param fileType - The type of file (CSV or TSV)
 * @returns Parsed CSVDoc object
 */
export function parse(input: string, fileType: FileType = "csv"): CSVDoc {
  // Parse CSV/TSV text and convert to a two-dimensional array
  try {
    const rawRows = parseCSV(input, {
      relax_column_count: true,
      columns: false,
      skip_empty_lines: true,
      delimiter: fileType === "tsv" ? "\t" : ",",
      quote: fileType === "tsv" ? null : '"',
    });

    // Convert each row to a CSVRow object
    return rawRows
      .map(parseRow)
      .filter((row: CSVRow): row is CSVRow => row !== null);
  } catch (e) {
    console.error(e);
    return [];
  }
}
