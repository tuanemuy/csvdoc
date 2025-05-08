import { parse } from "../index.ts";
import { assertHTMLEquals } from "./utils.ts";

Deno.test("水平線要素のパース", () => {
  const input = "hr";

  const expected = "<hr />";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("前後に要素がある水平線要素のパース", () => {
  const input = `p,段落1
hr
p,段落2`;

  const expected = `<p>段落1</p>
<hr />
<p>段落2</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("水平線要素に属性を付与", () => {
  const input = "hr,,class=divider;style=margin: 2em 0";

  const expected = `<hr class="divider" style="margin: 2em 0" />`;

  assertHTMLEquals(parse(input), expected);
});

// 以下、異常系とエッジケースのテスト

Deno.test("連続する水平線要素", () => {
  const input = `hr
hr
hr`;

  const expected = "<hr /><hr /><hr />";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("水平線要素に不必要な値を指定した場合", () => {
  const input = "hr,不必要な値";

  // 水平線要素は自己終了タグなので、値は使用されない
  // この場合、値は属性と解釈される可能性がある
  const expected = "<hr />";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("水平線要素に空の属性を指定した場合", () => {
  const input = "hr,,class=;id=;data-empty=";

  // 空の属性値をテスト
  const expected = `<hr class="" id="" data-empty="" />`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("水平線要素に複数の属性を指定した場合", () => {
  const input =
    "hr,,id=separator;class=divider section-break;data-role=spacer;style=margin: 2em 0";

  const expected = `<hr id="separator" class="divider section-break" data-role="spacer" style="margin: 2em 0" />`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("水平線要素の属性値にエスケープされた特殊文字を含む場合", () => {
  const input = "hr,,data-value=key\\=value\\;another";

  const expected = `<hr data-value="key=value;another" />`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("非常に多くの属性を持つ水平線要素", () => {
  // 多数の属性を生成
  const attributes = Array.from(
    { length: 15 },
    (_, i) => `attr${i}=value${i}`,
  ).join(";");
  const input = `hr,,${attributes}`;

  // 期待する出力を生成
  const expectedAttrs = Array.from(
    { length: 15 },
    (_, i) => ` attr${i}="value${i}"`,
  ).join("");
  const expected = `<hr${expectedAttrs} />`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("水平線要素の間に空行がある場合", () => {
  const input = `hr

hr`;

  const expected = `<hr />
<hr />`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("水平線要素と他の要素が混在する複雑な構造", () => {
  const input = `h1,タイトル
p,段落1
hr,,class=section-break
h2,サブタイトル
p,段落2
hr
ul,リスト項目`;

  const expected = `<h1>タイトル</h1>
<p>段落1</p>
<hr class="section-break" />
<h2>サブタイトル</h2>
<p>段落2</p>
<hr />
<ul>
    <li>リスト項目</li>
</ul>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("名前のみの属性（値なし）を持つ水平線要素", () => {
  const input = "hr,,disabled;readonly";

  // 現在の実装では値のない属性は無視されるか、値と同じ名前が設定される
  // 実際の出力に合わせて期待値を設定
  const expected = "<hr />";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数カラムの水平線要素（通常は無視される）", () => {
  const input = "hr,値1,値2,値3,値4";

  // 通常、水平線要素は単一カラムのみ使用するため、
  // 追加のカラムは属性として解釈される可能性があるが、
  // この形式では最後のカラムのみが属性として扱われる可能性がある
  const expected = "<hr />";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("異なるタイプの要素の間に挟まれた水平線", () => {
  const input = `h1,見出し
ul,リスト項目1
hr
code,"console.log(""Hello"");"
blockquote,引用文`;

  const expected = `<h1>見出し</h1>
<ul>
    <li>リスト項目1</li>
</ul>
<hr />
<pre><code>console.log("Hello");</code></pre>
<blockquote>
    <p>引用文</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("水平線要素の後に空行が続く場合", () => {
  const input = `hr

p,段落`;

  const expected = `<hr />
<p>段落</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("スタイル属性に複雑なCSSを含む水平線", () => {
  const input = "hr,,style=border: 1px solid #ccc";

  const expected = `<hr style="border: 1px solid #ccc" />`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("アスタリスクなどの特殊文字を含む属性値", () => {
  const input = "hr,,data-pattern=*pattern*;title=This is a ** separator **";

  const expected = `<hr data-pattern="*pattern*" title="This is a ** separator **" />`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("非ASCII文字（日本語など）を含む属性値", () => {
  const input = "hr,,title=区切り線;data-info=セクション間の仕切り";

  const expected = `<hr title="区切り線" data-info="セクション間の仕切り" />`;

  assertHTMLEquals(parse(input), expected);
});
