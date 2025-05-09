import {
  type Attribute,
  type CSVRow,
  type EmptyRow,
  Tag,
  isHeadingTag,
} from "../core/types.ts";

/**
 * Mapping of tag aliases
 */
const tagAliases: Record<string, Tag | null> = {
  "#": Tag.h1,
  "##": Tag.h2,
  "###": Tag.h3,
  "####": Tag.h4,
  "#####": Tag.h5,
  "######": Tag.h6,
  li: Tag.ul,
  "-": Tag.ul,
  "*": Tag.ul,
  "+": Tag.ul,
  "1": Tag.ol,
  table: Tag.tbody,
  tr: Tag.tbody,
  tbody: Tag.tbody,
  td: Tag.tbody,
  th: Tag.tbody,
  "|": Tag.tbody,
  "[": Tag.thead,
  "```": Tag.code,
  ">": Tag.blockquote,
  ".": null,
};

const empty = ".";
const comment = "//";

/**
 * Parses a single CSV row and converts it to a CSVRow object
 * @param row Array representing a single CSV row
 * @returns Parsed CSVRow object
 */
export function parseRow(row: string[]): CSVRow | EmptyRow | null {
  // Extract depth from tag name
  const tagWithDepth = row[0];
  const depthMatch = tagWithDepth.match(/^(_+)?(.*)/);
  const depth = depthMatch?.[1] ? depthMatch[1].length : 0;
  let tag = (depthMatch?.[2] ? depthMatch[2] : tagWithDepth).trim();
  let suffix = undefined;
  if (!isHeadingTag(tag)) {
    const suffixMatch = tag.match(/^([a-z\|\[\]]+)(\d*)$/);
    if (suffixMatch) {
      tag = suffixMatch[1];
      suffix = suffixMatch[2] || undefined;
    }
  }

  if (tag === comment || row.length === 0) {
    return null;
  }

  if (tag === empty) {
    return {
      tag: null,
    };
  }

  // Check aliases and convert to actual tag
  const actualTag = tagAliases[tag] || tag;

  const value = row.length > 1 ? row[1] : null;
  const attributeString = row.length > 2 ? row[2] : "";

  // Parse attributes
  const attributes: Attribute = {};
  if (attributeString) {
    parseAttributes(attributeString, attributes);
  }

  return {
    tag: actualTag || Tag.p, // Use "p" as default if tag is empty
    rawTag: tag,
    suffix,
    value,
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
