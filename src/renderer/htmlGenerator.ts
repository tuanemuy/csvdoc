import {
  type Attribute,
  type CSVDoc,
  type CSVRow,
  Tag,
  isHeadingTag,
} from "../core/types.ts";
import { parseInlineElements } from "./inlineParser.ts";

/**
 * Represents a node in the HTML document tree
 * @property {string} tag - The HTML tag name
 * @property {string | HTMLNode[]} content - Text content or child nodes
 * @property {Attribute} attributes - HTML attributes to be applied to the element
 */
type HTMLNode = {
  tag: string;
  content: string | HTMLNode[];
  attributes: Attribute;
};

/**
 * Escapes HTML special characters
 * @param str String to escape
 * @returns Escaped string
 */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escapes HTML attribute values with consideration for special characters in URLs
 * @param key Attribute name
 * @param value Attribute value
 * @returns Escaped attribute value
 */
function escapeAttributeValue(key: string, value: string): string {
  // For URL attributes like src, href, maintain URL structure
  const urlAttributes = ["src", "href", "srcset", "data"];
  if (urlAttributes.includes(key)) {
    // Only escape double quotes in URLs (to avoid breaking HTML attribute values)
    return value.replace(/"/g, "&quot;");
  }
  // For regular attributes, escape all special characters
  return escapeHTML(value);
}

/**
 * Converts an attribute object to an HTML attribute string
 * @param attributes Attribute object
 * @returns HTML attribute string
 */
function attributesToString(attributes: Attribute): string {
  return Object.entries(attributes)
    .map(([key, value]) => ` ${key}="${escapeAttributeValue(key, value)}"`)
    .join("");
}

/**
 * Escapes special characters for code blocks (only &, <, >)
 * @param str String to escape
 * @returns Escaped string
 */
function escapeCodeContent(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Converts an array of HTMLNodes to an HTML string
 * @param nodes Array of HTMLNodes
 * @returns Generated HTML string
 */
export function nodesToHTML(nodes: HTMLNode[]): string {
  return nodes.map(nodeToHTML).join("\n");
}

/**
 * Converts a single HTMLNode to an HTML string
 * @param node HTMLNode object
 * @returns Generated HTML string
 */
function nodeToHTML(node: HTMLNode): string {
  const { tag, content, attributes } = node;
  const attributesStr = attributesToString(attributes);

  // For self-closing tags (void elements)
  if (tag === "hr" || tag === "img") {
    return `<${tag}${attributesStr} />`;
  }

  // If content is an array (has child nodes)
  if (Array.isArray(content)) {
    let innerContent = "";

    // Process each element in the content array
    for (const item of content) {
      if (typeof item === "string") {
        // For strings, parse inline elements
        // However, don't parse inline elements if parent is a code element
        if (tag === "code") {
          innerContent += escapeCodeContent(item);
        } else {
          innerContent += parseInlineElements(item);
        }
      } else if (typeof item === "object") {
        // For HTMLNodes, process recursively
        innerContent += nodeToHTML(item);
      }
    }

    return `<${tag}${attributesStr}>${innerContent}</${tag}>`;
  }

  // If content is a string
  // However, don't parse inline elements for code elements
  if (tag === "code") {
    return `<${tag}${attributesStr}>${escapeCodeContent(content)}</${tag}>`;
  }
  const parsedContent = parseInlineElements(content);
  return `<${tag}${attributesStr}>${parsedContent}</${tag}>`;
}

/**
 * Converts an array of CSVRows to a tree structure of HTMLNodes
 * @param rows Array of CSVRows
 * @returns Array of HTMLNodes
 */
export function buildHTMLTree(rows: CSVDoc): HTMLNode[] {
  const nodes: HTMLNode[] = [];
  let currentRow = 0;

  while (currentRow < rows.length) {
    const { tag } = rows[currentRow];

    if (!tag) {
      currentRow++;
      continue;
    }

    const row = rows[currentRow] as CSVRow;

    if (isHeadingTag(tag)) {
      nodes.push(processHeading(row));
      currentRow++;
    } else if (tag === Tag.p) {
      // Process paragraph elements and return the number of processed rows
      const { parsedNodes, processedRows } = processParagraphBlock(
        rows,
        currentRow,
      );
      nodes.push(...parsedNodes);
      currentRow += processedRows;
    } else if (tag === Tag.a) {
      nodes.push(processLink(row));
      currentRow++;
    } else if (tag === Tag.img) {
      nodes.push(processImage(row));
      currentRow++;
    } else if (tag === Tag.ul || tag === Tag.ol) {
      const { node, newRowIndex } = processLists(rows, currentRow);
      nodes.push(node);
      currentRow = newRowIndex;
    } else if (isTableTag(tag)) {
      const { node, newRowIndex } = processTable(rows, currentRow);
      nodes.push(node);
      currentRow = newRowIndex;
    } else if (tag === Tag.code) {
      const { node, newRowIndex } = processCode(rows, currentRow);
      nodes.push(node);
      currentRow = newRowIndex;
    } else if (tag === Tag.blockquote) {
      const { node, newRowIndex } = processBlockquote(rows, currentRow);
      nodes.push(node);
      currentRow = newRowIndex;
    } else if (tag === Tag.hr) {
      // Apply attributes to horizontal rule element
      nodes.push({
        tag: Tag.hr,
        content: "",
        attributes: row.attributes,
      });
      currentRow++;
    } else {
      // Unknown tags are treated as p tags by default
      const node: HTMLNode = {
        tag: Tag.p,
        content: row.value || "",
        attributes: row.attributes,
      };
      nodes.push(node);
      currentRow++;
    }
  }

  return nodes;
}

/**
 * Process a paragraph block
 * This function processes consecutive p elements and generates multiple paragraphs separated by empty_line
 * @param rows Array of all CSVRows
 * @param startRow Starting row index
 * @returns Processed paragraph nodes and count of processed rows
 */
function processParagraphBlock(
  doc: CSVDoc,
  startRow: number,
): { parsedNodes: HTMLNode[]; processedRows: number } {
  const parsedNodes: HTMLNode[] = [];
  let i = startRow;

  // First, find consecutive p elements and empty_line
  while (i < doc.length && doc[i].tag === Tag.p) {
    i++;
  }

  const blockRows = doc.slice(startRow, i) as CSVRow[];
  if (blockRows.length > 0) {
    const paragraphNode = processSingleParagraph(blockRows);
    if (paragraphNode) {
      parsedNodes.push(paragraphNode);
    }
  }

  // Return the count of processed rows
  return {
    parsedNodes,
    processedRows: i - startRow,
  };
}

/**
 * Process a single paragraph block
 * @param paragraphRows Array of paragraph rows to process (without empty_line)
 * @returns Generated paragraph HTMLNode
 */
function processSingleParagraph(paragraphRows: CSVRow[]): HTMLNode | null {
  if (paragraphRows.length === 0) {
    return null;
  }

  // Collect paragraph content and attributes
  const content: string[] = [];
  let attributes: Attribute = {};

  for (const row of paragraphRows) {
    content.push(row.value || "");
    attributes = { ...attributes, ...row.attributes };
  }

  return {
    tag: "p",
    content: content.join("<br />"),
    attributes,
  };
}

/**
 * Processes a heading tag
 * @param row CSVRow representing a heading
 * @returns HTMLNode for the heading
 */
function processHeading(row: CSVRow): HTMLNode {
  return {
    tag: row.tag,
    content: row.value || "",
    attributes: row.attributes,
  };
}

/**
 * Processes a link
 * @param row CSVRow representing a link
 * @returns HTMLNode for a paragraph containing the link
 */
function processLink(row: CSVRow): HTMLNode {
  // href attribute is required
  if (!row.attributes.href) {
    row.attributes.href = "";
  }

  const linkNode: HTMLNode = {
    tag: "a",
    content: row.value || "",
    attributes: row.attributes,
  };

  // Links are wrapped in p tags when used as a block element
  return {
    tag: "p",
    content: [linkNode],
    attributes: {},
  };
}

/**
 * Processes an image
 * @param row CSVRow representing an image
 * @returns HTMLNode for a paragraph containing the image
 */
function processImage(row: CSVRow): HTMLNode {
  if (!row.attributes.src) {
    row.attributes.src = "";
  }

  row.attributes.alt = row.value || "";

  const imgNode: HTMLNode = {
    tag: "img",
    content: "",
    attributes: row.attributes,
  };

  // Images are wrapped in p tags when used as a block element
  return {
    tag: "p",
    content: [imgNode],
    attributes: {},
  };
}

type DepthItem = {
  list: HTMLNode;
  lastItem: HTMLNode | null;
  originalTag: string; // 元のタグ名（ul, li, -, * など）
};

/**
 * Processes lists
 * @param rows Array of CSVRows
 * @param startRow Starting row index
 * @returns Object containing the list HTMLNode and new row index
 */
function processLists(
  doc: CSVDoc,
  startRow: number,
): { node: HTMLNode; newRowIndex: number } {
  const firstRow = doc[startRow] as CSVRow;

  const rootList: HTMLNode = {
    tag: firstRow.tag,
    content: [],
    attributes: firstRow.attributes,
  };

  // 各深さのリストを追跡
  const depthMap: Record<number, DepthItem> = {
    0: { list: rootList, lastItem: null, originalTag: firstRow.tag },
  };

  let i = startRow;

  const isListTag = (tag: string): boolean => {
    return tag === Tag.ul || tag === Tag.ol;
  };

  const isSameTagGroup = (tag1: string, tag2: string): boolean => {
    return tag1 === tag2;
  };

  while (i < doc.length && doc[i].tag && isListTag(doc[i].tag || "")) {
    const row = doc[i] as CSVRow;
    const depth = row.depth;

    // 深さ0で、タグが異なる場合、処理を終了
    // 仕様通り、タグ名が異なれば別のリストとして扱う
    if (
      depth === 0 &&
      i > startRow &&
      !isSameTagGroup(row.tag, depthMap[0].originalTag)
    ) {
      break;
    }

    // 各深さのリストを準備
    for (let d = 0; d <= depth; d++) {
      if (!depthMap[d]) {
        // 親の深さを見つける
        const parentDepth = d - 1;
        const parentItem = depthMap[parentDepth].lastItem;

        // 親リスト項目がなければ作成
        if (!parentItem) {
          const item: HTMLNode = {
            tag: "li",
            content: "",
            attributes: {},
          };
          (depthMap[parentDepth].list.content as HTMLNode[]).push(item);
          depthMap[parentDepth].lastItem = item;
        }

        // 適切なタグでサブリストを作成
        const newListTag = row.tag;
        const subList: HTMLNode = {
          tag: newListTag,
          content: [],
          attributes: d === depth ? row.attributes : {}, // 深さが一致する場合のみ属性を適用
        };

        // 親項目のコンテンツを更新
        const parentContent = parentItem?.content;
        if (typeof parentContent === "string" && parentItem) {
          // 文字列コンテンツをHTMLノードの配列に変換
          parentItem.content = [
            parentContent,
            subList,
          ] as unknown as HTMLNode[];
        } else if (parentContent) {
          (parentContent as HTMLNode[]).push(subList);
        }

        depthMap[d] = { list: subList, lastItem: null, originalTag: row.tag };
      } else if (d === depth) {
        // 同じ深さで異なるタグが現れた場合、新しいリストを開始
        if (!isSameTagGroup(row.tag, depthMap[d].originalTag)) {
          // 深さ0では新しいリスト処理を開始
          if (d === 0) {
            return { node: rootList, newRowIndex: i };
          }

          // ネスト内で異なるリストタイプが出現した場合、新しいリストを作成
          const parentDepth = d - 1;
          const parentItem = depthMap[parentDepth].lastItem;

          // 新しいサブリストを作成
          const newListTag = row.tag;
          const subList: HTMLNode = {
            tag: newListTag,
            content: [],
            attributes: row.attributes,
          };

          // 親項目のコンテンツを更新
          if (parentItem) {
            const parentContent = parentItem.content;
            if (typeof parentContent === "string") {
              parentItem.content = [
                parentContent,
                subList,
              ] as unknown as HTMLNode[];
            } else {
              (parentContent as HTMLNode[]).push(subList);
            }
          }

          // 深さマップを更新
          depthMap[d] = { list: subList, lastItem: null, originalTag: row.tag };
        } else {
          // 同じタグの場合は属性を更新
          Object.assign(depthMap[d].list.attributes, row.attributes);
        }
      }
    }

    // リスト項目を作成して現在の深さのリストに追加
    const item: HTMLNode = {
      tag: "li",
      content: row.value || "",
      attributes: {}, // リスト項目には属性を適用しない
    };

    (depthMap[depth].list.content as HTMLNode[]).push(item);
    depthMap[depth].lastItem = item;

    i++;
  }

  return { node: rootList, newRowIndex: i };
}

/**
 * Checks if a tag is related to table
 * @param tag Tag name
 * @returns True if the tag is related to table
 */
function isTableTag(tag: string): boolean {
  return tag === Tag.tbody || tag === Tag.thead;
}

type Cell = {
  content: string;
  tag: "th" | "td";
};

// Group table data by rows
type TrGroup = {
  cells: Cell[];
  section: "thead" | "tbody";
  baseTag: string;
  suffix: string;
};

/**
 * Processes a table
 * @param rows Array of CSVRows
 * @param startRow Starting row index
 * @returns Object containing the table HTMLNode and new row index
 */
function processTable(
  doc: CSVDoc,
  startRow: number,
): { node: HTMLNode; newRowIndex: number } {
  // Create table element
  const tableNode: HTMLNode = {
    tag: "table",
    content: [],
    attributes: {},
  };

  // Identify table range
  let endIndex = startRow;
  while (endIndex < doc.length && isTableTag(doc[endIndex].tag || "")) {
    // Collect attributes for the entire table
    const current = doc[endIndex] as CSVRow;
    tableNode.attributes = {
      ...tableNode.attributes,
      ...current.attributes,
    };
    endIndex++;
  }

  // Group CSV rows by tag type and suffix
  const rowGroups: TrGroup[] = [];

  // Initial values for previous row information
  let prevTag = "";
  let prevSuffix = "";

  // Process CSV rows in order
  for (let i = startRow; i < endIndex; i++) {
    const row = doc[i] as CSVRow;

    // Determine type and section
    const isHead = row.tag === Tag.thead;
    const section = isHead ? "thead" : "tbody";

    // Cell content
    const cell: Cell = {
      content: row.value || "",
      tag: isHead ? "th" : row.rawTag === "th" ? "th" : "td",
    };

    // Create a new row group if tag type or suffix changes
    const isNewGroup =
      row.tag !== prevTag || (row.suffix || "") !== prevSuffix;

    if (isNewGroup) {
      // Create a new row group
      const rowGroup: TrGroup = {
        cells: [cell],
        section,
        baseTag: row.tag,
        suffix: row.suffix || "",
      };
      rowGroups.push(rowGroup);
    } else {
      // Add cell to existing row group
      rowGroups[rowGroups.length - 1].cells.push(cell);
    }

    // Update previous row information
    prevTag = row.tag;
    prevSuffix = row.suffix || "";
  }

  // Create thead and tbody sections
  const theadNode: HTMLNode = {
    tag: "thead",
    content: [],
    attributes: {},
  };

  const tbodyNode: HTMLNode = {
    tag: "tbody",
    content: [],
    attributes: {},
  };

  let hasTheadSection = false;

  // Calculate maximum column count
  let maxColumnCount = 0;
  for (const group of rowGroups) {
    maxColumnCount = Math.max(maxColumnCount, group.cells.length);
  }

  // Convert row groups to HTML rows (tr)
  for (const group of rowGroups) {
    const trNode: HTMLNode = {
      tag: "tr",
      content: [],
      attributes: {},
    };

    // Match cell count to maximum column count (add empty cells if needed)
    for (let i = 0; i < maxColumnCount; i++) {
      const cell =
        i < group.cells.length ? group.cells[i] : { content: "", tag: "td" };

      const cellNode: HTMLNode = {
        tag: cell.tag,
        content: cell.content,
        attributes: {},
      };

      (trNode.content as HTMLNode[]).push(cellNode);
    }

    // Add tr to appropriate section
    if (group.section === "thead") {
      hasTheadSection = true;
      (theadNode.content as HTMLNode[]).push(trNode);
    } else {
      (tbodyNode.content as HTMLNode[]).push(trNode);
    }
  }

  // Add table sections
  if (hasTheadSection && theadNode.content.length > 0) {
    (tableNode.content as HTMLNode[]).push(theadNode);
  }

  if (tbodyNode.content.length > 0) {
    (tableNode.content as HTMLNode[]).push(tbodyNode);
  }

  return { node: tableNode, newRowIndex: endIndex };
}

/**
 * Processes a code block
 * @param rows Array of CSVRows
 * @param startRow Starting row index
 * @returns Object containing the code block HTMLNode and new row index
 */
function processCode(
  doc: CSVDoc,
  startRow: number,
): { node: HTMLNode; newRowIndex: number } {
  const codeLines: string[] = [];
  const codeAttributes: Attribute = {};
  let i = startRow;

  while (i < doc.length && doc[i].tag === Tag.code) {
    const row = doc[i] as CSVRow;
    // Get all values instead of just using the first value when there are multiple values
    codeLines.push(row.value || "");

    // Process all attributes
    for (const [key, value] of Object.entries(row.attributes)) {
      // When the same attribute appears multiple times, the last value takes precedence
      codeAttributes[key] = value;
    }

    i++;
  }

  // Convert language to data-language attribute
  if (codeAttributes.language) {
    codeAttributes["data-language"] = codeAttributes.language;
  }
  const { language, ...attributes } = codeAttributes;

  const codeNode: HTMLNode = {
    tag: "code",
    content: codeLines.join("\n"),
    attributes,
  };

  const preNode: HTMLNode = {
    tag: "pre",
    content: [codeNode],
    attributes: {},
  };

  return { node: preNode, newRowIndex: i };
}

/**
 * Processes a blockquote
 * @param rows Array of CSVRows
 * @param startRow Starting row index
 * @returns Object containing the blockquote HTMLNode and new row index
 */
function processBlockquote(
  doc: CSVDoc,
  startRow: number,
): { node: HTMLNode; newRowIndex: number } {
  const firstRow = doc[startRow] as CSVRow;
  const blockquoteNode: HTMLNode = {
    tag: "blockquote",
    content: [],
    attributes: firstRow.attributes,
  };

  let i = startRow;
  let currentDepth = firstRow.depth;
  const blockquoteStack: HTMLNode[] = [blockquoteNode];

  while (i < doc.length && doc[i].tag === Tag.blockquote) {
    const row = doc[i] as CSVRow;

    // Enter new hierarchy
    if (row.depth > currentDepth) {
      const nestedBlockquote: HTMLNode = {
        tag: "blockquote",
        content: [],
        attributes: row.attributes, // Set attributes for nested blockquote element
      };

      (blockquoteStack[blockquoteStack.length - 1].content as HTMLNode[]).push(
        nestedBlockquote,
      );
      blockquoteStack.push(nestedBlockquote);
      currentDepth = row.depth;
    }

    // Return to previous hierarchy
    while (row.depth < currentDepth && blockquoteStack.length > 1) {
      blockquoteStack.pop();
      currentDepth--;
    }

    // Add content as paragraph (don't add if nesting hierarchy changes)
    if (row.depth === currentDepth) {
      const pNode: HTMLNode = {
        tag: "p",
        content: row.value || "",
        attributes: {},
      };

      (blockquoteStack[blockquoteStack.length - 1].content as HTMLNode[]).push(
        pNode,
      );
    }

    i++;
  }

  return { node: blockquoteNode, newRowIndex: i };
}
