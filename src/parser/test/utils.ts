/**
 * HTMLの比較を行うためのユーティリティ関数
 * インデントや改行の違い、属性の順序を無視して比較できるようにします
 */

/**
 * HTMLを正規化して比較します
 * @param actual 実際の出力HTML
 * @param expected 期待されるHTML
 * @returns 正規化後のHTMLが一致するかどうか
 */
export function compareHTML(actual: string, expected: string): boolean {
  return normalizeHTML(actual) === normalizeHTML(expected);
}

/**
 * HTMLを正規化します
 * - タグ間やタグとテキストの間の空白や改行をすべて削除
 * - 属性の順序を標準化
 * - pre/codeタグの内部は保持
 * @param html 正規化するHTML
 * @returns 正規化されたHTML
 */
export function normalizeHTML(html: string): string {
  if (!html) return "";

  // preタグの内容を一時的に保存
  const preBlocks: string[] = [];
  let preIndex = 0;

  // preタグの内容を取り出して置換
  const withoutPre = html.replace(
    /<pre(.*?)>([\s\S]*?)<\/pre>/g,
    (match, attrs, content) => {
      preBlocks.push(`<pre${attrs}>${content}</pre>`);
      return `__PRE_PLACEHOLDER_${preIndex++}__`;
    },
  );

  // 基本的な空白の正規化
  // まず全ての改行とタブをスペースに変換
  let normalized = withoutPre.replace(/[\n\r\t]/g, " ");

  // 連続した空白を1つに
  normalized = normalized.replace(/\s+/g, " ").trim();

  // タグ間の空白を削除
  normalized = normalized.replace(/>\s+</g, "><");

  // 開始タグと終了タグの周囲の空白を削除
  normalized = normalized.replace(/\s+>/g, ">"); // 閉じタグ前の空白を削除
  normalized = normalized.replace(/<\s+/g, "<"); // 開始タグ後の空白を削除

  // タグとテキストの間の空白を削除
  normalized = normalized.replace(/>\s+([^<])/g, ">$1"); // 開始タグ後のテキスト前の空白を削除
  normalized = normalized.replace(/([^>])\s+</g, "$1<"); // テキスト後の終了タグ前の空白を削除

  // 属性の順序を標準化
  // 開始タグと属性を見つけるための正規表現
  const tagRegex = /<([a-zA-Z0-9_-]+)(\s+[^>]+)>/g;

  // 属性を見つけるための正規表現
  const attrRegex = /([a-zA-Z0-9_-]+)=(["'])(.*?)\2/g;

  // 開始タグを見つけて属性を並べ替える
  normalized = normalized.replace(tagRegex, (match, tagName, attributes) => {
    if (!attributes || attributes.trim() === "") {
      return match; // 属性がない場合はそのまま返す
    }

    // 属性を抽出して配列に格納
    const attrs: { name: string; value: string; quote: string }[] = [];
    let attrMatch: RegExpExecArray | null = null;

    // attrRegexの位置をリセット
    attrRegex.lastIndex = 0;

    while (true) {
      attrMatch = attrRegex.exec(attributes);
      if (attrMatch === null) break;

      attrs.push({
        name: attrMatch[1],
        value: attrMatch[3],
        quote: attrMatch[2],
      });
    }

    // 属性がない場合は元のタグを返す
    if (attrs.length === 0) {
      return match;
    }

    // 属性名でソート
    attrs.sort((a, b) => a.name.localeCompare(b.name));

    // 並べ替えた属性を再構築
    const sortedAttrs = attrs
      .map((attr) => `${attr.name}=${attr.quote}${attr.value}${attr.quote}`)
      .join(" ");

    // 新しいタグを構築
    return `<${tagName} ${sortedAttrs}>`;
  });

  // preタグのプレースホルダーを実際の内容に戻す
  for (let i = 0; i < preBlocks.length; i++) {
    const preContent = preBlocks[i];

    // preタグの属性も正規化
    let normalizedPre = preContent;

    // preタグの属性を正規化
    normalizedPre = normalizedPre.replace(
      tagRegex,
      (match, tagName, attributes) => {
        if (!attributes || attributes.trim() === "") {
          return match;
        }

        const attrs: { name: string; value: string; quote: string }[] = [];
        let attrMatch: RegExpExecArray | null = null;

        // attrRegexの位置をリセット
        attrRegex.lastIndex = 0;

        while (true) {
          attrMatch = attrRegex.exec(attributes);
          if (attrMatch === null) break;

          attrs.push({
            name: attrMatch[1],
            value: attrMatch[3],
            quote: attrMatch[2],
          });
        }

        if (attrs.length === 0) {
          return match;
        }

        attrs.sort((a, b) => a.name.localeCompare(b.name));

        const sortedAttrs = attrs
          .map((attr) => `${attr.name}=${attr.quote}${attr.value}${attr.quote}`)
          .join(" ");

        return `<${tagName} ${sortedAttrs}>`;
      },
    );

    // pre内のcodeタグも正規化
    const codeRegex = /<code([^>]*)>([\s\S]*?)<\/code>/g;
    normalizedPre = normalizedPre.replace(
      codeRegex,
      (match, attributes, content) => {
        if (!attributes || attributes.trim() === "") {
          return match;
        }

        const attrs: { name: string; value: string; quote: string }[] = [];
        let attrMatch: RegExpExecArray | null = null;

        // attrRegexの位置をリセット
        attrRegex.lastIndex = 0;

        while (true) {
          attrMatch = attrRegex.exec(attributes);
          if (attrMatch === null) break;

          attrs.push({
            name: attrMatch[1],
            value: attrMatch[3],
            quote: attrMatch[2],
          });
        }

        if (attrs.length === 0) {
          return match;
        }

        attrs.sort((a, b) => a.name.localeCompare(b.name));

        const sortedAttrs = attrs
          .map((attr) => `${attr.name}=${attr.quote}${attr.value}${attr.quote}`)
          .join(" ");

        return `<code ${sortedAttrs}>${content}</code>`;
      },
    );

    normalized = normalized.replace(`__PRE_PLACEHOLDER_${i}__`, normalizedPre);
  }

  return normalized;
}

/**
 * HTML文字列同士を正規化して比較するためのアサーション関数
 * @param actual 実際の出力HTML
 * @param expected 期待されるHTML
 * @param message 失敗時のメッセージ
 */
export function assertHTMLEquals(
  actual: string,
  expected: string,
  message?: string,
): void {
  const normalizedActual = normalizeHTML(actual);
  const normalizedExpected = normalizeHTML(expected);

  if (normalizedActual !== normalizedExpected) {
    const errorMessage =
      message ?? "HTML strings do not match after normalization";
    console.error("実際の値:", normalizedActual);
    console.error("期待値:", normalizedExpected);
    throw new Error(errorMessage);
  }
}
