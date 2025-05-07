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

export type Attribute = Record<string, string>;

export interface CSVRow {
  tag: string;
  values: string[];
  attributes: Attribute;
  depth: number;
}

export interface HTMLNode {
  tag: string;
  content: string | HTMLNode[];
  attributes: Attribute;
}

export type FileType = "csv" | "tsv";
