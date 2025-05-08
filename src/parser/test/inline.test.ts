import { parse } from "../index.ts";
import { assertHTMLEquals } from "./utils.ts";

Deno.test("強調（イタリック、太字）のパース", () => {
  const input = "p,これは *イタリック* と **太字** の例です。";

  const expected =
    "<p>これは <em>イタリック</em> と <strong>太字</strong> の例です。</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("アンダースコアを使用した強調のパース", () => {
  const input = "p,これは _イタリック_ と __太字__ の例です。";

  const expected =
    "<p>これは <em>イタリック</em> と <strong>太字</strong> の例です。</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードスパンのパース", () => {
  const input = "p,インラインの `コード` 例です。";

  const expected = "<p>インラインの <code>コード</code> 例です。</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("打ち消し線のパース", () => {
  const input = "p,これは ~~打ち消し線~~ の例です。";

  const expected = "<p>これは <del>打ち消し線</del> の例です。</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("インラインリンクのパース", () => {
  const input = "p,詳細は [こちら](https://example.com) を参照してください。";

  const expected =
    '<p>詳細は <a href="https://example.com">こちら</a> を参照してください。</p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("タイトル付きインラインリンクのパース", () => {
  const input =
    'p,"詳細は [こちら](https://example.com ""Example Site"") を参照してください。"';

  const expected =
    '<p>詳細は <a href="https://example.com" title="Example Site">こちら</a> を参照してください。</p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("インライン画像のパース", () => {
  const input = "p,以下に画像があります: ![ロゴ画像](logo.png)";

  const expected =
    '<p>以下に画像があります: <img src="logo.png" alt="ロゴ画像" /></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("タイトル付きインライン画像のパース", () => {
  const input =
    'p,"以下に画像があります: ![ロゴ画像](logo.png ""会社のロゴ"")"';

  const expected =
    '<p>以下に画像があります: <img src="logo.png" alt="ロゴ画像" title="会社のロゴ" /></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複合したインライン要素のパース", () => {
  const input =
    "p,これは **重要** なテキストで、`code` スニペットを含みます。詳細は [こちら](https://example.com) を参照してください。";

  const expected =
    '<p>これは <strong>重要</strong> なテキストで、<code>code</code> スニペットを含みます。詳細は <a href="https://example.com">こちら</a> を参照してください。</p>';

  assertHTMLEquals(parse(input), expected);
});

// エッジケースと異常系のテスト

Deno.test("強調マーカーの間にスペースがある場合", () => {
  const input = "p,これは * イタリック * と ** 太字 ** になりません。";

  const expected = "<p>これは * イタリック * と ** 太字 ** になりません。</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードスパンの閉じ忘れ", () => {
  const input = "p,インラインの `コードが閉じていません。";

  const expected = "<p>インラインの `コードが閉じていません。</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("インラインリンクの不完全な構文（閉じ括弧の欠落）", () => {
  const input = "p,詳細は [こちら](https://example.com を参照してください。";

  const expected =
    "<p>詳細は [こちら](https://example.com を参照してください。</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("インラインリンクの不完全な構文（テキスト欠落）", () => {
  const input = "p,詳細は [](https://example.com) を参照してください。";

  const expected =
    '<p>詳細は <a href="https://example.com"></a> を参照してください。</p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("インラインリンクの不完全な構文（URLなし）", () => {
  const input = "p,詳細は [こちら]() を参照してください。";

  const expected = '<p>詳細は <a href="">こちら</a> を参照してください。</p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("インライン画像の不完全な構文（閉じ括弧の欠落）", () => {
  const input = "p,以下に画像があります: ![ロゴ画像](logo.png";

  const expected = "<p>以下に画像があります: ![ロゴ画像](logo.png</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("インライン画像の代替テキストなし", () => {
  const input = "p,以下に画像があります: ![](logo.png)";

  const expected = '<p>以下に画像があります: <img src="logo.png" alt="" /></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("エスケープされたリンク記法", () => {
  const input =
    "p,詳細は \\[こちら\\](https://example.com) を参照してください。";

  const expected =
    "<p>詳細は [こちら](https://example.com) を参照してください。</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("入れ子の強調構文", () => {
  const input = "p,これは **太字の中に *イタリック* がある** 例です。";

  const expected =
    "<p>これは <strong>太字の中に <em>イタリック</em> がある</strong> 例です。</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数行にわたるマークアップ", () => {
  const input = `p,"これは
**太字**
です。"`;

  const expected = `<p>これは
<strong>太字</strong>
です。</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("空のインラインマークアップ", () => {
  const input = "p,空の強調: ** ** と * * とコード: ``";

  const expected = "<p>空の強調: ** ** と * * とコード: <code></code></p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("マークアップ記号の連続使用", () => {
  const input = "p,アスタリスク***三つ***と波線~~~~二つ~~~~";

  // 実装によって異なる可能性あり
  const expected =
    "<p>アスタリスク<strong><em>三つ</em></strong>と波線<del>二つ</del></p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("特殊文字を含むURL", () => {
  const input =
    "p,特殊文字URL: [リンク](https://example.com?param=value&another=123#fragment)";

  const expected =
    '<p>特殊文字URL: <a href="https://example.com?param=value&another=123#fragment">リンク</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("URLエンコードが必要なパスを含むリンク", () => {
  const input = "p,日本語パス: [リンク](https://example.com/日本語パス)";

  const expected =
    '<p>日本語パス: <a href="https://example.com/日本語パス">リンク</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードスパン内のマークアップ", () => {
  const input = "p,コード内はパースされない: `**太字にならない**`";

  const expected =
    "<p>コード内はパースされない: <code>**太字にならない**</code></p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("文字参照のパース", () => {
  const input = "p,HTML文字参照: &lt;div&gt; と数値参照: &#x1f600;";

  const expected = "<p>HTML文字参照: &lt;div&gt; と数値参照: &#x1f600;</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("エスケープされたマークダウン記号", () => {
  const input =
    "p,これは \\*イタリックになりません\\* と \\*\\*太字になりません\\*\\* と \\~\\~取り消し線にならない\\~\\~ の例です。";

  const expected =
    "<p>これは *イタリックになりません* と **太字になりません** と ~~取り消し線にならない~~ の例です。</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードスパン内の特殊文字エスケープ", () => {
  const input = "p,HTML要素: `<div>` `<span>` `&lt;` と特殊記号: `&`";

  const expected =
    "<p>HTML要素:<code>&lt;div&gt;</code><code>&lt;span&gt;</code><code>&amp;lt;</code>と特殊記号:<code>&amp;</code></p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードスパン内の複数の特殊文字", () => {
  const input = "p,`function(a < b && c > d) { return a && b; }`";

  const expected =
    "<p><code>function(a &lt; b &amp;&amp; c &gt; d) { return a &amp;&amp; b; }</code></p>";

  assertHTMLEquals(parse(input), expected);
});
