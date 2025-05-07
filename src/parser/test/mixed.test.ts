import { parse } from "../index.ts";
import { assertHTMLEquals } from "./utils.ts";

Deno.test("異なる要素が混在するCSVのパース", () => {
  const input = `h1,タイトル
p,段落です。
ul,リスト項目1
ul,リスト項目2
hr
blockquote,引用です。
p,最後の段落です。`;

  const expected = `<h1>タイトル</h1>
<p>段落です。</p>
<ul>
    <li>リスト項目1</li>
    <li>リスト項目2</li>
</ul>
<hr />
<blockquote>
    <p>引用です。</p>
</blockquote>
<p>最後の段落です。</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("無効なタグの扱い（pタグとして扱われる）", () => {
  const input = "invalid,この行は無効なタグを持っています。";

  const expected = "<p>この行は無効なタグを持っています。</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("属性の値にセミコロンやイコールが含まれる場合のエスケープ", () => {
  const input =
    "p,エスケープが必要な属性を持つ段落,class=special;data-value=key\\=value\\;another";

  const expected = `<p class="special" data-value="key=value;another">エスケープが必要な属性を持つ段落</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("CSVフィールド内のカンマとダブルクォートの適切な処理", () => {
  const input = `p,"これは, カンマを含む文章です。"
p,"これは ""引用符"" を含む文章です。"`;

  const expected = `<p>
    これは, カンマを含む文章です。
    <br />
    これは "引用符" を含む文章です。
</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("インライン要素を含む複合要素のパース", () => {
  const input = `h1,**太字タイトル** と *イタリック*
ul,リスト項目 [リンク](https://example.com)
blockquote,引用内の \`コード\``;

  const expected = `<h1><strong>太字タイトル</strong> と <em>イタリック</em></h1>
<ul>
    <li>リスト項目 <a href="https://example.com">リンク</a></li>
</ul>
<blockquote>
    <p>引用内の <code>コード</code></p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複雑なCSV構造の適切な処理", () => {
  const input = `h1,CSV形式でHTMLをマークアップする方法
p,このドキュメントでは、CSV形式を使用してHTMLを生成する方法を説明します。

h2,基本構文
code,tag
code,h1
code,p

h2,**実際の例**
table,要素,用途,備考
table,h1-h6,見出し,文書の構造化に使用
table,p,段落,テキストブロック
table,ul/ol/li,リスト,順序付き/順序なしリスト

p,詳細は [公式ドキュメント](https://example.com/docs) を参照してください。`;

  const expected = `<h1>CSV形式でHTMLをマークアップする方法</h1>
<p>このドキュメントでは、CSV形式を使用してHTMLを生成する方法を説明します。</p>

<h2>基本構文</h2>
<pre><code>tag
h1
p</code></pre>
<h2><strong>実際の例</strong></h2>
<table>
    <tbody>
        <tr>
            <td>要素</td>
            <td>用途</td>
            <td>備考</td>
        </tr>
        <tr>
            <td>h1-h6</td>
            <td>見出し</td>
            <td>文書の構造化に使用</td>
        </tr>
        <tr>
            <td>p</td>
            <td>段落</td>
            <td>テキストブロック</td>
        </tr>
        <tr>
            <td>ul/ol/li</td>
            <td>リスト</td>
            <td>順序付き/順序なしリスト</td>
        </tr>
    </tbody>
</table>

<p>詳細は <a href="https://example.com/docs">公式ドキュメント</a> を参照してください。</p>`;

  assertHTMLEquals(parse(input), expected);
});
