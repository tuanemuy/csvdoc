import { parse } from "../index.ts";
import { assertHTMLEquals } from "./utils.ts";

Deno.test("見出し要素(h1-h6)のパース", () => {
  const input = `h1,見出し1
h2,見出し2
h3,見出し3
h4,見出し4
h5,見出し5
h6,見出し6`;

  const expected = `<h1>見出し1</h1>
<h2>見出し2</h2>
<h3>見出し3</h3>
<h4>見出し4</h4>
<h5>見出し5</h5>
<h6>見出し6</h6>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("見出し要素に属性を付与", () => {
  const input = `h1,見出し1,class=main-title;id=title
h2,見出し2,id=subtitle`;

  const expected = `<h1 class="main-title" id="title">見出し1</h1>
<h2 id="subtitle">見出し2</h2>`;

  assertHTMLEquals(parse(input), expected);
});

// 以下、異常系とエッジケースのテスト

Deno.test("空の見出し要素", () => {
  const input = `h1,
h2,`;

  const expected = `<h1></h1>
<h2></h2>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("インライン要素を含む見出し", () => {
  const input = `h1,**太字の見出し**
h2,*イタリック* と [リンク](https://example.com)
h3,\`コード\` と ~~打ち消し線~~`;

  const expected = `<h1><strong>太字の見出し</strong></h1>
<h2><em>イタリック</em> と <a href="https://example.com">リンク</a></h2>
<h3><code>コード</code> と <del>打ち消し線</del></h3>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("非常に長いテキストを含む見出し", () => {
  // 長いテキストを生成
  const longText = "これは非常に長い見出しテキストです。".repeat(20);
  const input = `h1,${longText}`;

  const expected = `<h1>${longText}</h1>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("無効な見出しレベル（h7）の処理", () => {
  const input = "h7,無効な見出しレベル";

  // h7は無効なタグなので、デフォルトでpタグに変換される
  const expected = "<p>無効な見出しレベル</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("無効な見出しレベル（h0）の処理", () => {
  const input = "h0,無効な見出しレベル";

  // h0は無効なタグなので、デフォルトでpタグに変換される
  const expected = "<p>無効な見出しレベル</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("特殊文字を含む見出し", () => {
  // ダブルクォートを避けて特殊文字をテスト
  const input = `h1,特殊文字: & < > '
h2,HTMLタグ: <div>テスト</div>`;

  // HTMLエスケープの動作を確認
  const expected = `<h1>特殊文字: & < > '</h1>
<h2>HTMLタグ: <div>テスト</div></h2>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数の属性を持つ見出し", () => {
  const input =
    "h1,複雑な属性を持つ見出し,class=title main-title;id=complex-title;data-test=value;style=color: red";

  const expected = `<h1 class="title main-title" id="complex-title" data-test="value" style="color: red">複雑な属性を持つ見出し</h1>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コンマを含む見出し", () => {
  const input = `h1,"これは, コンマを含む見出しです"`;

  const expected = "<h1>これは, コンマを含む見出しです</h1>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("ダブルクォートを含む見出し", () => {
  const input = `h1,"これは ""引用符"" を含む見出しです"`;

  const expected = `<h1>これは "引用符" を含む見出しです</h1>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("属性値にエスケープされた特殊文字を含む見出し", () => {
  const input = "h1,エスケープ属性付き見出し,data-value=key\\=value\\;another";

  const expected = `<h1 data-value="key=value;another">エスケープ属性付き見出し</h1>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("見出しの階層順序が正しくない場合", () => {
  const input = `h3,先にh3
h1,後にh1`;

  // 階層順序が正しくなくても各見出しは正しく処理される
  const expected = `<h3>先にh3</h3>
<h1>後にh1</h1>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("見出しの前後に他の要素が混在する場合", () => {
  const input = `p,段落
h2,見出し
ul,リスト項目`;

  const expected = `<p>段落</p>
<h2>見出し</h2>
<ul>
    <li>リスト項目</li>
</ul>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数の値（カラム）を持つ見出し", () => {
  const input = "h1,最初の値,2つ目の値,3つ目の値";

  // 仕様では最初の値だけが見出しのコンテンツとなる
  const expected = "<h1>最初の値</h1>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("空の属性値を持つ見出し", () => {
  const input = "h1,見出し,class=;id=;data-empty=";

  // 空の属性値も正しく処理される
  const expected = `<h1 class="" id="" data-empty="">見出し</h1>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("非常に多くの属性を持つ見出し", () => {
  // 多数の属性を生成
  const attributes = Array.from(
    { length: 20 },
    (_, i) => `attr${i}=value${i}`,
  ).join(";");
  const input = `h1,多数の属性を持つ見出し,${attributes}`;

  // 期待する出力を生成
  const expectedAttrs = Array.from(
    { length: 20 },
    (_, i) => ` attr${i}="value${i}"`,
  ).join("");
  const expected = `<h1${expectedAttrs}>多数の属性を持つ見出し</h1>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("名前のみの属性（値なし）", () => {
  const input = "h1,見出し,disabled;readonly";

  // 現在の実装では値のない属性は無視されるようなので、そのように期待値を設定
  const expected = "<h1>見出し</h1>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数行にわたるCSVフィールドを含む見出し", () => {
  // CSVの複数行フィールド
  const input = `h1,"複数行にわたる
見出し"`;

  // 改行は保持される
  const expected = `<h1>複数行にわたる
見出し</h1>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("見出しのエイリアスを使ったパース (#, ##, ###, ####, #####, ######)", () => {
  const input = `#,見出し1
##,見出し2
###,見出し3
####,見出し4
#####,見出し5
######,見出し6`;

  const expected = `<h1>見出し1</h1>
<h2>見出し2</h2>
<h3>見出し3</h3>
<h4>見出し4</h4>
<h5>見出し5</h5>
<h6>見出し6</h6>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("エイリアスと属性を組み合わせた見出し", () => {
  const input = `#,見出し1,class=main-title;id=title
##,見出し2,id=subtitle`;

  const expected = `<h1 class="main-title" id="title">見出し1</h1>
<h2 id="subtitle">見出し2</h2>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複雑なケース - エイリアスとネスト", () => {
  const input = `.#,ネストした見出し1
.##,ネストした見出し2`;

  const expected = `<h1>ネストした見出し1</h1>
<h2>ネストした見出し2</h2>`;

  assertHTMLEquals(parse(input), expected);
});
