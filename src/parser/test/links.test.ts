import { parse } from "../index.ts";
import { assertHTMLEquals } from "./utils.ts";

Deno.test("基本的なリンク要素のパース", () => {
  const input = "a,リンクテキスト,href=https://example.com";

  const expected = '<p><a href="https://example.com">リンクテキスト</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数の属性を持つリンク要素のパース", () => {
  const input =
    "a,参考資料,href=https://example.com/reference;target=_blank;rel=noopener";

  const expected =
    '<p><a href="https://example.com/reference" target="_blank" rel="noopener">参考資料</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("リンク要素がp要素で囲まれることの確認", () => {
  const input = `a,リンク1,href=https://example.com/1
a,リンク2,href=https://example.com/2`;

  const expected = `<p><a href="https://example.com/1">リンク1</a></p>
<p><a href="https://example.com/2">リンク2</a></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("hrefが指定されていない場合の処理", () => {
  const input = "a,リンクテキスト";

  const expected = '<p><a href="#">リンクテキスト</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("空のリンクテキストの処理", () => {
  const input = "a,,href=https://example.com";

  const expected = '<p><a href="https://example.com"></a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("エスケープが必要な属性値を持つリンクのパース", () => {
  const input =
    "a,セミコロンとイコール,href=https://example.com/search?q=test\\;param\\=value";

  const expected =
    '<p><a href="https://example.com/search?q=test;param=value">セミコロンとイコール</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用符を含む属性値を持つリンクのパース", () => {
  const input =
    'a,引用符,"href=https://example.com;title=""引用符を含むタイトル"""';

  const expected =
    '<p><a href="https://example.com" title="&quot;引用符を含むタイトル&quot;">引用符</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("不正な形式の属性を持つリンクのパース", () => {
  const input = "a,リンクテキスト,href=https://example.comtarget=_blank";

  const expected =
    '<p><a href="https://example.comtarget=_blank">リンクテキスト</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("他のブロック要素と混在する場合のリンク処理", () => {
  const input = `p,テキスト
a,リンク,href=https://example.com
p,続きのテキスト`;

  const expected = `<p>テキスト</p>
<p><a href="https://example.com">リンク</a></p>
<p>続きのテキスト</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("巨大な属性値を持つリンクのパース", () => {
  // 1000文字のダミー文字列
  const longText = "A".repeat(1000);
  const input = `a,長いタイトル,href=https://example.com;title=${longText}`;

  const expected = `<p><a href="https://example.com" title="${longText}">長いタイトル</a></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("絵文字を含む属性値を持つリンクのパース", () => {
  const input =
    "a,😀 絵文字リンク,href=https://example.com;title=絵文字テスト 🌟";

  const expected =
    '<p><a href="https://example.com" title="絵文字テスト 🌟">😀 絵文字リンク</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("空白文字を多く含む属性値の処理", () => {
  const input =
    "a,リンクテキスト,href=https://example.com;title=  複数の  空白を  含む  タイトル  ";

  const expected =
    '<p><a href="https://example.com" title="  複数の  空白を  含む  タイトル  ">リンクテキスト</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("Markdownインライン記法を含むリンクテキストの処理", () => {
  const input = "a,**太字** と *斜体* を含むリンク,href=https://example.com";

  const expected =
    '<p><a href="https://example.com"><strong>太字</strong> と <em>斜体</em> を含むリンク</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("フラグメント識別子を含むhref属性", () => {
  const input = "a,セクションへのリンク,href=https://example.com/page#section1";

  const expected =
    '<p><a href="https://example.com/page#section1">セクションへのリンク</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("メールリンクのパース", () => {
  const input = "a,メールアドレス,href=mailto:info@example.com";

  const expected =
    '<p><a href="mailto:info@example.com">メールアドレス</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("tel:スキームを使用したリンクのパース", () => {
  const input = "a,電話番号,href=tel:+123456789";

  const expected = '<p><a href="tel:+123456789">電話番号</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("クエリパラメータを含むURLを使用したリンクのパース", () => {
  const input =
    "a,検索結果,href=https://example.com/search?q=test&category=docs";

  const expected =
    '<p><a href="https://example.com/search?q=test&category=docs">検索結果</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("URLエンコードが必要な文字を含むhref属性の処理", () => {
  const input = "a,日本語パス,href=https://example.com/日本語ページ";

  const expected =
    '<p><a href="https://example.com/日本語ページ">日本語パス</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("href属性が空文字の場合", () => {
  const input = "a,空のリンク,href=";

  const expected = '<p><a href="#">空のリンク</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("属性値にHTMLタグを含む場合", () => {
  const input =
    'a,リンクテキスト,"href=https://example.com;title=<script>alert(""XSS"")</script>"';

  const expected =
    '<p><a href="https://example.com" title="&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;">リンクテキスト</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("属性値に余分なセミコロンが含まれる場合", () => {
  const input = "a,リンクテキスト,href=https://example.com;;;;class=test;;;";

  const expected =
    '<p><a href="https://example.com" class="test">リンクテキスト</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("ネストしたHTMLを含むリンクテキスト", () => {
  const input = "a,<strong>太字</strong> テキスト,href=https://example.com";

  const expected =
    '<p><a href="https://example.com"><strong>太字</strong>テキスト</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("無効なhref値（javascript:）を持つリンク", () => {
  const input = "a,危険なリンク,href=javascript:alert('XSS')";

  // 実装によっては、このような危険なURLをサニタイズするかもしれません
  const expected =
    "<p><a href=\"javascript:alert('XSS')\">危険なリンク</a></p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("相対パスを使用したリンク", () => {
  const input = "a,相対パス,href=../pages/about.html";

  const expected = '<p><a href="../pages/about.html">相対パス</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("ルート相対パスを使用したリンク", () => {
  const input = "a,ルート相対パス,href=/pages/contact.html";

  const expected = '<p><a href="/pages/contact.html">ルート相対パス</a></p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数行にわたる長い属性値", () => {
  const input = `a,長い属性,"href=https://example.com;longattr=これは
複数行にわたる
長い属性値です"`;

  // CSVパーサーの実装により、改行を含む引用符で囲まれた値をどう扱うかが変わります
  const expected = `<p><a href="https://example.com" longattr="これは
複数行にわたる
長い属性値です">長い属性</a></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("他のタグ内でのリンク（リスト内）", () => {
  const input = `ul,項目1
ul,[リンク付き項目](https://example.com) テキスト
ul,項目3`;

  const expected = `<ul>
<li>項目1</li>
<li><a href="https://example.com">リンク付き項目</a> テキスト</li>
<li>項目3</li>
</ul>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("他のタグ内でのリンク（見出し内）", () => {
  const input = "h1,見出し [見出し内リンク](https://example.com) テキスト";

  const expected =
    '<h1>見出し <a href="https://example.com">見出し内リンク</a> テキスト</h1>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("他のタグ内でのリンク（テーブルセル内）", () => {
  const input = `table,名前,説明
table,サンプル,[テーブル内リンク](https://example.com) 説明テキスト`;

  const expected = `<table>
<tbody>
<tr>
<td>名前</td>
<td>説明</td>
</tr>
<tr>
<td>サンプル</td>
<td><a href="https://example.com">テーブル内リンク</a> 説明テキスト</td>
</tr>
</tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数のインラインリンクの連続", () => {
  const input =
    "p,テキスト [リンク1](https://example.com/1) 中間テキスト [リンク2](https://example.com/2) 終了テキスト";

  const expected =
    '<p>テキスト <a href="https://example.com/1">リンク1</a> 中間テキスト <a href="https://example.com/2">リンク2</a> 終了テキスト</p>';

  assertHTMLEquals(parse(input), expected);
});

Deno.test("インラインリンクとブロックリンクの組み合わせ", () => {
  const input = `p,テキスト開始 [インラインリンク](https://example.com/inline) テキスト
a,ブロックリンク,href=https://example.com/block
p,続きのテキスト`;

  const expected = `<p>テキスト開始 <a href="https://example.com/inline">インラインリンク</a> テキスト</p>
<p><a href="https://example.com/block">ブロックリンク</a></p>
<p>続きのテキスト</p>`;

  assertHTMLEquals(parse(input), expected);
});
