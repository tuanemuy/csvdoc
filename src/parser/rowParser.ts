import type { Attribute, CSVRow } from "./types.ts";

/**
 * Mapping of tag aliases
 */
const TAG_ALIASES: Record<string, string> = {
  "#": "h1",
  "##": "h2",
  "###": "h3",
  "####": "h4",
  "#####": "h5",
  "######": "h6",
  "-": "ul",
  "*": "ul",
  "+": "ul",
  "1": "ol",
  "|": "table",
  "[": "thead",
  "```": "code",
  ">": "blockquote",
};

/**
 * Parses a single CSV row and converts it to a CSVRow object
 * @param row Array representing a single CSV row
 * @returns Parsed CSVRow object
 */
export function parseRow(row: string[]): CSVRow {
  if (row.length === 0) {
    return {
      tag: "p",
      values: [],
      attributes: {},
      depth: 0,
    };
  }

  // Extract depth from tag name
  const tagWithDepth = row[0];
  const depthMatch = tagWithDepth.match(/^(\.+)?(.*)/);
  const depth = depthMatch?.[1] ? depthMatch[1].length : 0;
  const tag = (depthMatch?.[2] ? depthMatch[2] : tagWithDepth).trim();

  // Check aliases and convert to actual tag
  const actualTag = TAG_ALIASES[tag] || tag;

  // Get values (content)
  // Check if the last column is an attribute, if not, include all values
  let values: string[] = [];
  let attributeString = "";

  if (row.length > 1) {
    // Special handling for hr tag
    if (actualTag === "hr") {
      // hr tag doesn't have values, treat everything after the first column as attributes
      attributeString = row[1];
    } else {
      const lastColumn = row[row.length - 1];
      // Precise determination of attribute string - string in "key=value" format
      // Format with at least one "key=value" pair separated by semicolons
      const isAttributeString =
        /^[^=]+=.*/.test(lastColumn.trim()) && lastColumn.trim() !== "";

      if (isAttributeString && row.length > 2) {
        // If attributes are included, get values from all elements except the last one
        values = row.slice(1, row.length - 1);
        attributeString = lastColumn;
      } else {
        // If no attributes, include all values
        values = row.slice(1);
        attributeString = "";
      }
    }
  }

  // Parse attributes
  const attributes: Attribute = {};
  if (attributeString) {
    parseAttributes(attributeString, attributes);
  }

  return {
    tag: actualTag || "p", // Use "p" as default if tag is empty
    values,
    attributes,
    depth,
  };
}

/**
 * Parses an attribute string and converts it to an attribute object
 * @param attributeString Attribute string (e.g., "key1=value1;key2=value2")
 * @param attributes Object to store attributes
 */
function parseAttributes(attributeString: string, attributes: Attribute): void {
  // Do nothing if attribute string is empty
  if (!attributeString) return;

  // Temporarily replace escaped semicolons before splitting attribute pairs
  let processedString = attributeString;
  // First replace escaped characters with temporary markers
  const escapedSemicolonMarker = "\uE000"; // Use a character not normally used
  const escapedEqualsMarker = "\uE001";

  processedString = processedString
    .replace(/\\;/g, escapedSemicolonMarker)
    .replace(/\\=/g, escapedEqualsMarker);

  // Check if it's in "key=value" format
  if (!/[^=]+=/.test(processedString)) {
    // Exit if not in valid attribute format
    return;
  }

  const attributePairs = processedString.split(";");

  for (const pair of attributePairs) {
    if (!pair.trim()) continue; // Skip empty attribute pairs

    // Use only the first = as a separator
    const equalIndex = pair.indexOf("=");
    if (equalIndex === -1) continue; // Skip if no =

    const key = pair.substring(0, equalIndex).trim();
    const value = pair.substring(equalIndex + 1);

    if (key) {
      // Restore markers to actual characters
      const unescapedValue = value
        .replace(new RegExp(escapedSemicolonMarker, "g"), ";")
        .replace(new RegExp(escapedEqualsMarker, "g"), "=");

      attributes[key] = unescapedValue;
    }
  }
}
