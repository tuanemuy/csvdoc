/**
 * Represents the supported HTML tags and special tags
 */
export const Tag = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  p: "p",
  a: "a",
  img: "img",
  ul: "ul",
  ol: "ol",
  thead: "thead",
  tbody: "tbody",
  code: "code",
  blockquote: "blockquote",
  hr: "hr",
} as const;
/**
 * Special internal tag identifier
 */
export type Tag = (typeof Tag)[keyof typeof Tag];

/**
 * Checks if the given tag is a heading tag (h1 to h6)
 * @param tag - The tag name to check
 * @returns True if the tag is a heading tag, false otherwise
 */
export function isHeadingTag(tag: string): tag is Tag {
  return tag in Tag && tag.startsWith("h");
}

/**
 * Represents HTML element attributes as key-value pairs
 */
export type Attribute = Record<string, string>;

/**
 * Represents a row in the CSV document
 * @property {string} tag - The HTML tag name or special tag
 * @property {string[]} values - Array of cell values from the CSV row
 * @property {Attribute} attributes - HTML attributes to be applied to the element
 * @property {number} depth - Nesting level of the element in document hierarchy
 */
export type CSVRow = {
  tag: string;
  rawTag: string;
  suffix?: string;
  value: string | null;
  attributes: Attribute;
  depth: number;
};

export type EmptyRow = {
  tag: null;
};

/**
 * Represents a node in the HTML document tree
 */
export type CSVDoc = (CSVRow | EmptyRow)[];

/**
 * Supported file types for parsing
 */
export type FileType = "csv" | "tsv";
