import { parse } from "csv-parse/sync";
import type { FileType } from "./types.ts";

/**
 * Parses CSV/TSV and returns an array of data
 * @param input CSV/TSV formatted string
 * @param fileType File type ("csv" or "tsv"), defaults to "csv"
 * @returns Two-dimensional array of parsed data
 */
export function parseCSV(
  input: string,
  fileType: FileType = "csv",
): string[][] {
  try {
    return parse(input, {
      relax_column_count: true,
      columns: false,
      skip_empty_lines: false,
      delimiter: fileType === "tsv" ? "\t" : ",",
      quote: fileType === "tsv" ? null : '"',
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}
