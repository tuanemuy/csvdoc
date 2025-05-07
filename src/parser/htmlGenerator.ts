import type { Attribute, CSVRow, HTMLNode } from "./types.ts";
import { parseInlineElements } from "./inlineParser.ts";

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
export function buildHTMLTree(rows: CSVRow[]): HTMLNode[] {
  const nodes: HTMLNode[] = [];
  let currentRow = 0;

  while (currentRow < rows.length) {
    const { tag } = rows[currentRow];

    if (isHeadingTag(tag)) {
      nodes.push(processHeading(rows[currentRow]));
      currentRow++;
    } else if (tag === "p") {
      const pNodes = processParagraphs(rows, currentRow);
      nodes.push(...pNodes);
      // Advance index by the number of processed paragraph tags
      let processedRows = 0;
      let i = currentRow;
      while (i < rows.length && rows[i].tag === "p") {
        processedRows++;
        i++;
      }
      currentRow += processedRows;
    } else if (tag === "a") {
      nodes.push(processLink(rows[currentRow]));
      currentRow++;
    } else if (tag === "img") {
      nodes.push(processImage(rows[currentRow]));
      currentRow++;
    } else if (tag === "ul" || tag === "ol" || tag === "li") {
      const { node, newRowIndex } = processLists(rows, currentRow);
      nodes.push(node);
      currentRow = newRowIndex;
    } else if (isTableTag(tag)) {
      const { node, newRowIndex } = processTable(rows, currentRow);
      nodes.push(node);
      currentRow = newRowIndex;
    } else if (tag === "code") {
      const { node, newRowIndex } = processCode(rows, currentRow);
      nodes.push(node);
      currentRow = newRowIndex;
    } else if (tag === "blockquote") {
      const { node, newRowIndex } = processBlockquote(rows, currentRow);
      nodes.push(node);
      currentRow = newRowIndex;
    } else if (tag === "hr") {
      // Apply attributes to horizontal rule element
      nodes.push({
        tag: "hr",
        content: "",
        attributes: rows[currentRow].attributes,
      });
      currentRow++;
    } else {
      // Unknown tags are treated as p tags by default
      const node: HTMLNode = {
        tag: "p",
        content: rows[currentRow].values.join(""),
        attributes: rows[currentRow].attributes,
      };
      nodes.push(node);
      currentRow++;
    }
  }

  return nodes;
}

/**
 * Processes a heading tag
 * @param row CSVRow representing a heading
 * @returns HTMLNode for the heading
 */
function processHeading(row: CSVRow): HTMLNode {
  return {
    tag: row.tag,
    content: row.values[0] || "",
    attributes: row.attributes,
  };
}

/**
 * Processes paragraphs
 * @param rows Array of CSVRows
 * @param startRow Starting row index
 * @returns Array of generated paragraph HTMLNodes and number of processed rows
 */
function processParagraphs(rows: CSVRow[], startRow: number): HTMLNode[] {
  const result: HTMLNode[] = [];
  let currentContent: string[] = [];
  let currentAttributes = { ...rows[startRow].attributes };
  let emptyLineEncountered = false;

  let i = startRow;
  while (i < rows.length && rows[i].tag === "p") {
    // Empty value rows are treated as paragraph separators
    if (rows[i].values.length === 0) {
      emptyLineEncountered = true;
      // Add current paragraph and start a new one
      if (currentContent.length > 0) {
        result.push({
          tag: "p",
          content: currentContent.join("<br />"),
          attributes: currentAttributes,
        });
        currentContent = [];
        currentAttributes = {};
      }
    } else {
      // If previous empty line functioned as a paragraph separator, previous content has been added,
      // and we're ready to start a new paragraph
      if (emptyLineEncountered && currentContent.length === 0) {
        // Initialize attributes for the new paragraph
        currentAttributes = { ...rows[i].attributes };
        emptyLineEncountered = false;
      }

      currentContent.push(rows[i].values.join(""));
      // Merge attributes (later ones take precedence)
      currentAttributes = { ...currentAttributes, ...rows[i].attributes };
    }
    i++;
  }

  // Add remaining content as a paragraph if any
  if (currentContent.length > 0) {
    result.push({
      tag: "p",
      content: currentContent.join("<br />"),
      attributes: currentAttributes,
    });
  }

  return result;
}

/**
 * Processes a link
 * @param row CSVRow representing a link
 * @returns HTMLNode for a paragraph containing the link
 */
function processLink(row: CSVRow): HTMLNode {
  // href attribute is required
  if (!row.attributes.href) {
    row.attributes.href = "#";
  }

  const linkNode: HTMLNode = {
    tag: "a",
    content: row.values[0] || "",
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
  // src attribute is required
  if (!row.attributes.src) {
    row.attributes.src = "";
  }

  // alt attribute is prioritized from values
  if (row.values[0]) {
    row.attributes.alt = row.values[0];
  } else if (!row.attributes.alt) {
    row.attributes.alt = "";
  }

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

/**
 * Processes lists
 * @param rows Array of CSVRows
 * @param startRow Starting row index
 * @returns Object containing the list HTMLNode and new row index
 */
function processLists(
  rows: CSVRow[],
  startRow: number,
): { node: HTMLNode; newRowIndex: number } {
  const startTag = rows[startRow].tag === "ol" ? "ol" : "ul";

  const rootList: HTMLNode = {
    tag: startTag,
    content: [],
    attributes: rows[startRow].attributes,
  };

  // Keep current data
  interface DepthItem {
    list: HTMLNode;
    lastItem: HTMLNode | null;
  }

  // Track lists at each depth
  const depthMap: Record<number, DepthItem> = {
    0: { list: rootList, lastItem: null },
  };

  let i = startRow;

  while (
    i < rows.length &&
    (rows[i].tag === "ul" || rows[i].tag === "ol" || rows[i].tag === "li")
  ) {
    const row = rows[i];
    const depth = row.depth;

    // 以前の深さのリストが存在しない場合、作成する
    for (let d = 0; d <= depth; d++) {
      if (!depthMap[d]) {
        // 親の深さを見つける
        const parentDepth = d - 1;
        const parentItem = depthMap[parentDepth].lastItem;

        // 親項目がない場合、作成する
        if (!parentItem) {
          const item: HTMLNode = {
            tag: "li",
            content: "",
            attributes: {},
          };
          (depthMap[parentDepth].list.content as HTMLNode[]).push(item);
          depthMap[parentDepth].lastItem = item;
        }

        // 新しいサブリストを作成
        const listTag = row.tag === "ol" ? "ol" : "ul";
        const subList: HTMLNode = {
          tag: listTag,
          content: [],
          attributes: {},
        };

        // 親アイテムの内容を更新
        const parentContent = parentItem?.content;
        if (typeof parentContent === "string" && parentItem) {
          // 文字列コンテンツをHTMLNodeの配列に変換
          // ここでspanを使わずに直接テキストと子リストを追加
          parentItem.content = [
            parentContent,
            subList,
          ] as unknown as HTMLNode[];
        } else if (parentContent) {
          (parentContent as HTMLNode[]).push(subList);
        }

        depthMap[d] = { list: subList, lastItem: null };
      }
    }

    // リストアイテムを作成して現在の深さのリストに追加
    const item: HTMLNode = {
      tag: "li",
      content: row.values[0] || "",
      attributes: row.attributes,
    };

    (depthMap[depth].list.content as HTMLNode[]).push(item);
    depthMap[depth].lastItem = item;

    i++;
  }

  return { node: rootList, newRowIndex: i };
}

/**
 * Processes a table
 * @param rows Array of CSVRows
 * @param startRow Starting row index
 * @returns Object containing the table HTMLNode and new row index
 */
function processTable(
  rows: CSVRow[],
  startRow: number,
): { node: HTMLNode; newRowIndex: number } {
  // Table node representing the entire table
  const tableNode: HTMLNode = {
    tag: "table",
    content: [],
    attributes: rows[startRow].attributes, // Apply attributes from the first row to the table
  };

  let hasTheadSection = false;
  let theadNode: HTMLNode | null = null;
  const tbodyNode: HTMLNode = {
    tag: "tbody",
    content: [],
    attributes: {},
  };

  // テーブルのすべてのデータとカラム数を取得
  const tableData: { values: string[]; tag: string; attributes: Attribute }[] =
    [];
  let i = startRow;

  while (i < rows.length && isTableTag(rows[i].tag)) {
    // Don't duplicate table attributes from the first row to the row (tr)
    const rowData = {
      values: rows[i].values,
      tag: rows[i].tag,
      attributes:
        i === startRow && rows[i].tag === "table" ? {} : rows[i].attributes,
    };
    tableData.push(rowData);
    i++;
  }

  // 最大カラム数を計算
  let maxColumns = 0;
  for (const row of tableData) {
    maxColumns = Math.max(maxColumns, row.values.length);
  }

  // 行追加関数
  function addRow(
    tagType: string,
    rowValues: string[],
    rowAttributes: Attribute,
    container: HTMLNode,
  ) {
    const trNode: HTMLNode = {
      tag: "tr",
      content: [],
      attributes: rowAttributes, // 属性の複製をせずに直接代入
    };

    const cellTag = tagType === "th" ? "th" : "td";

    // 各セルを追加
    for (let j = 0; j < maxColumns; j++) {
      const cellContent = j < rowValues.length ? rowValues[j] : "";
      const cellNode: HTMLNode = {
        tag: cellTag,
        content: cellContent,
        attributes: {},
      };
      (trNode.content as HTMLNode[]).push(cellNode);
    }

    (container.content as HTMLNode[]).push(trNode);
  }

  // Process table header (thead)
  const theadRows = tableData.filter((row) => row.tag === "thead");
  if (theadRows.length > 0) {
    hasTheadSection = true;
    theadNode = {
      tag: "thead",
      content: [],
      attributes: {},
    };

    for (const row of theadRows) {
      addRow("th", row.values, row.attributes, theadNode);
    }

    tableNode.content = [theadNode];
  }

  // Process table body (tbody)
  const tbodyRows = tableData.filter((row) => row.tag !== "thead");
  if (tbodyRows.length > 0) {
    if (!hasTheadSection) {
      tableNode.content = [tbodyNode];
    } else {
      (tableNode.content as HTMLNode[]).push(tbodyNode);
    }

    for (const row of tbodyRows) {
      const cellType = row.tag === "th" ? "th" : "td";
      addRow(cellType, row.values, row.attributes, tbodyNode);
    }
  }

  return { node: tableNode, newRowIndex: i };
}

/**
 * Processes a code block
 * @param rows Array of CSVRows
 * @param startRow Starting row index
 * @returns Object containing the code block HTMLNode and new row index
 */
function processCode(
  rows: CSVRow[],
  startRow: number,
): { node: HTMLNode; newRowIndex: number } {
  const codeLines: string[] = [];
  const codeAttributes: Attribute = {};
  let i = startRow;

  while (i < rows.length && rows[i].tag === "code") {
    // 値が複数ある場合は、先頭の値だけを使用せず全ての値を取得
    if (rows[i].values.length > 0) {
      codeLines.push(rows[i].values.join("\n"));
    } else {
      codeLines.push("");
    }

    // すべての属性を処理
    for (const [key, value] of Object.entries(rows[i].attributes)) {
      // 同じ属性が複数回出現した場合、最後の値を優先
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
  rows: CSVRow[],
  startRow: number,
): { node: HTMLNode; newRowIndex: number } {
  const blockquoteNode: HTMLNode = {
    tag: "blockquote",
    content: [],
    attributes: rows[startRow].attributes,
  };

  let i = startRow;
  let currentDepth = rows[startRow].depth;
  const blockquoteStack: HTMLNode[] = [blockquoteNode];

  while (i < rows.length && rows[i].tag === "blockquote") {
    const row = rows[i];

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
        content: row.values[0] || "",
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

/**
 * Checks if a tag is a heading tag
 * @param tag Tag to check
 * @returns True if the tag is a heading tag
 */
function isHeadingTag(tag: string): boolean {
  return /^h[1-6]$/.test(tag);
}

/**
 * Checks if a tag is a table-related tag
 * @param tag Tag to check
 * @returns True if the tag is a table-related tag
 */
function isTableTag(tag: string): boolean {
  return ["table", "thead", "tbody", "th", "td"].includes(tag);
}
