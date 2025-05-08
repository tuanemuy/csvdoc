#!/usr/bin/env -S deno run -A

import { $ } from "../deps.ts";
import { parseArgs } from "../deps.ts";
import { parse } from "../parser/index.ts";
import type { FileType } from "../parser/types.ts";
import pkg from "../../deno.json" with { type: "json" };

// Version information
const VERSION = pkg.version;

// CLI options type definition
type CliOptions = {
  verbose: boolean;
  fileType: FileType;
};

/**
 * Display help message
 */
function showHelp(): void {
  console.log(`
CSVDoc/TSVDoc Parser - A tool to generate HTML documents from CSV/TSV

Usage:
  csvd [options] <input_file> <output_file>

Options:
  --help, -h        Display this help message
  --version, -v     Display version information
  --verbose         Show detailed information
  --type, -t        File type (csv or tsv), defaults to csv

Examples:
  csvd input.csv output.html
  csvd --verbose input.csv output.html
  csvd --type tsv input.tsv output.html
`);
}

/**
 * Display version information
 */
function showVersion(): void {
  console.log(`CSVDoc/TSVDoc Parser version ${VERSION}`);
}

/**
 * Main function
 */
async function main() {
  // Parse command line arguments using standard library
  const flags = parseArgs(Deno.args, {
    boolean: ["help", "verbose", "version"],
    string: ["type"],
    alias: {
      h: "help",
      v: "version",
      t: "type",
    },
    default: {
      verbose: false,
      type: "csv",
    },
  });

  // Display help if no arguments or help flag
  if (Deno.args.length === 0 || flags.help) {
    showHelp();
    Deno.exit(0);
  }

  // Show version if version flag
  if (flags.version) {
    showVersion();
    Deno.exit(0);
  }

  // Validate file type
  const fileType = flags.type as string;
  if (fileType !== "csv" && fileType !== "tsv") {
    $.logError(`Invalid file type: ${fileType}. Supported types are: csv, tsv`);
    Deno.exit(1);
  }

  // Extract options and files
  const options: CliOptions = {
    verbose: flags.verbose,
    fileType: fileType as FileType,
  };

  const files = flags._;

  // Check input and output files
  if (files.length < 2) {
    $.logError("Not enough arguments. Please specify input and output files.");
    $.logError("Usage: csv-doc [options] <input_file> <output_file>");
    $.logError("See --help option for more details.");
    Deno.exit(1);
  }

  const inputFile = String(files[0]);
  const outputFile = String(files[1]);

  try {
    // Check if input file exists
    const inputPath = $.path(inputFile);
    if (!(await inputPath.exists())) {
      $.logError(`Input file '${inputFile}' not found.`);
      Deno.exit(1);
    }

    // Read input file
    if (options.verbose) {
      $.logStep("Reading input file...", inputFile);
    } else {
      $.logStep("Reading input file...");
    }

    const input = await inputPath.readText();

    // Convert CSV/TSV to HTML using parser
    if (options.verbose) {
      $.logStep(
        `Converting ${options.fileType.toUpperCase()} to HTML...`,
        `Processing ${input.split("\n").length} lines of ${options.fileType.toUpperCase()}`,
      );
    } else {
      $.logStep(`Converting ${options.fileType.toUpperCase()} to HTML...`);
    }

    const html = parse(input, options.fileType);

    // Write to output file
    if (options.verbose) {
      $.logStep("Writing to output file...", outputFile);
    } else {
      $.logStep("Writing to output file...");
    }

    const outputPath = $.path(outputFile);

    // Check if output directory exists, create if not
    const outputDir = outputPath.parent();
    if (outputDir && !(await outputDir.exists())) {
      $.logStep("Creating output directory...");
      await outputDir.mkdir({ recursive: true });
    }

    await outputPath.writeText(html);

    // Completion message
    if (options.verbose) {
      const fileSize = (html.length / 1024).toFixed(2);
      $.logStep(
        "Conversion complete:",
        `${inputFile} → ${outputFile} (${fileSize} KB)`,
      );
    } else {
      $.logStep("Conversion complete:", `${inputFile} → ${outputFile}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    $.logError(`An error occurred: ${errorMessage}`);
    if (options.verbose && error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await main();
}
