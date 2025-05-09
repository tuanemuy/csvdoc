/**
 * Converts inline elements (Markdown-like notation) to HTML
 * @param text String to convert
 * @returns String converted to HTML
 */
export function parseInlineElements(text: string): string {
  if (!text) return "";

  let result = text;

  // Temporarily replace escaped special characters
  result = result.replace(/\\([*_`\[\]()~])/g, (_, char) => {
    return `\uE000${char.charCodeAt(0)}\uE001`; // Special temporary marker
  });

  // Code span: `code` (don't parse markup inside code)
  // Process code spans first to prevent their content from being affected by other processing
  const codeFragments: { [key: string]: string } = {};
  let codeCounter = 0;

  result = result.replace(/`([\s\S]*?)`/g, (_match, code) => {
    const placeholder = `\uE100${codeCounter}\uE101`;
    // Escape HTML special characters in code spans
    const escapedCode = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    codeFragments[placeholder] = `<code>${escapedCode}</code>`;
    codeCounter++;
    return placeholder;
  });

  // Inline image: ![alt](url "title")
  result = result.replace(
    /!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g,
    (_, alt, url, title) => {
      const titleAttr = title ? ` title="${title}"` : "";
      return `<img src="${url}" alt="${alt}"${titleAttr} />`;
    },
  );

  // Inline link: [link](url "title")
  result = result.replace(
    /\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g,
    (_, text, url, title) => {
      const titleAttr = title ? ` title="${title}"` : "";
      return `<a href="${url}"${titleAttr}>${text}</a>`;
    },
  );

  // Strikethrough: ~~strikethrough~~
  // Only convert those without spaces
  // Also handle multiple ~ (e.g., ~~~~)
  result = result.replace(
    /(?<!~)(~{2,})(?!\s)([^\s~][\s\S]*?[^\s~])(?<!~)(~{2,})(?!~)/g,
    "<del>$2</del>",
  );

  // Process *** and ___ (bold + italic)
  // Only convert those without spaces
  result = result.replace(
    /(\*{3}|\_{3})(?!\s)(.*?)(?<!\s)\1/g,
    "<strong><em>$2</em></strong>",
  );

  // Process ** and __ (bold)
  // Only convert those without spaces and not empty
  // Don't convert cases like "** **" with only whitespace
  result = result.replace(
    /(?<!\*)(\*{2})(?!\s|\*)([^\s*][\s\S]*?[^\s*])(?<!\*)(\*{2})(?!\*)/g,
    "<strong>$2</strong>",
  );
  result = result.replace(
    /(?<!\_)(\_\_)(?!\s|\_)([^\s_][\s\S]*?[^\s_])(?<!\_)(\_\_)(?!\_)/g,
    "<strong>$2</strong>",
  );

  // Process * and _ (italic)
  // Only convert cases that are not part of a word and don't contain spaces
  result = result.replace(
    /(?<!\w|\*)(\*)(?!\s|\*)([^\s*][\s\S]*?[^\s*])(?<!\*)(\*)(?!\*|\w)/g,
    "<em>$2</em>",
  );
  result = result.replace(
    /(?<!\w|\_)(_)(?!\s|\_)([^\s_][\s\S]*?[^\s_])(?<!\_)(_)(?!\_|\w)/g,
    "<em>$2</em>",
  );

  // Restore code spans
  for (const [placeholder, html] of Object.entries(codeFragments)) {
    result = result.replace(placeholder, html);
  }

  // Restore escaped characters
  result = result.replace(/\uE000(\d+)\uE001/g, (_, charCode) => {
    return String.fromCharCode(Number.parseInt(charCode, 10));
  });

  return result;
}
