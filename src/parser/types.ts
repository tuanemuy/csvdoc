/**
 * Represents HTML tag names that can be used in the document
 */
export type TagName =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "a"
  | "img"
  | "ul"
  | "ol"
  | "li"
  | "table"
  | "thead"
  | "tbody"
  | "th"
  | "td"
  | "code"
  | "blockquote"
  | "hr";

/**
 * Represents HTML element attributes as key-value pairs
 */
export type Attribute = Record<string, string>;

/**
 * Represents a row in the CSV document
 * @property {string} tag - The HTML tag name
 * @property {string[]} values - Array of cell values from the CSV row
 * @property {Attribute} attributes - HTML attributes to be applied to the element
 * @property {number} depth - Nesting level of the element in document hierarchy
 */
export interface CSVRow {
  tag: string;
  values: string[];
  attributes: Attribute;
  depth: number;
}

/**
 * Represents a node in the HTML document tree
 * @property {string} tag - The HTML tag name
 * @property {string | HTMLNode[]} content - Text content or child nodes
 * @property {Attribute} attributes - HTML attributes to be applied to the element
 */
export interface HTMLNode {
  tag: string;
  content: string | HTMLNode[];
  attributes: Attribute;
}

/**
 * Supported file types for parsing
 */
export type FileType = "csv" | "tsv";
