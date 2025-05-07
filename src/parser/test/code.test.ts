import { parse } from "../index.ts";
import { assertHTMLEquals } from "./utils.ts";

Deno.test("基本的なコードブロック要素のパース", () => {
  const input = `code,"const message = ""Hello, world!"";"`;

  const expected = `<pre><code>const message = "Hello, world!";</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数行のコードブロック要素のパース", () => {
  const input = `code,"const message = ""Hello, world!"";"
code,function hello() {
code,  console.log(message);
code,}`;

  const expected = `<pre><code>const message = "Hello, world!";
function hello() {
  console.log(message);
}</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("言語指定付きコードブロック要素のパース", () => {
  const input = `code,"const message = ""Hello, world!"";",language=javascript
code,function hello() {
code,  console.log(message);
code,}`;

  const expected = `<pre><code data-language="javascript">const message = "Hello, world!";
function hello() {
  console.log(message);
}</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("空のコードブロック要素のパース", () => {
  const input = "code,";

  const expected = "<pre><code></code></pre>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数の言語指定がある場合は最後の指定が優先される", () => {
  const input = `code,const a = 1;,language=javascript
code,print(a),language=python`;

  const expected = `<pre><code data-language="python">const a = 1;
print(a)</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロックと他の要素が混在する場合", () => {
  const input = `p,テキスト
code,const a = 1;
code,console.log(a);
p,別のテキスト`;

  const expected = `<p>テキスト</p>
<pre><code>const a = 1;
console.log(a);</code></pre>
<p>別のテキスト</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("特殊文字を含むコードブロック", () => {
  const input = `code,"const html = ""<div>テスト</div>"";"`;

  const expected = `<pre><code>const html = "&lt;div&gt;テスト&lt;/div&gt;";</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("セミコロンを含む属性値のエスケープ", () => {
  const input = `code,"console.log(""Hello"");",language=javascript\\;version=ES6`;

  const expected = `<pre><code data-language="javascript;version=ES6">console.log("Hello");</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数の属性を持つコードブロック", () => {
  const input = `code,"console.log(""Hello"");",language=javascript;data-line=2;class=highlight`;

  const expected = `<pre><code data-line="2" data-language="javascript" class="highlight">console.log("Hello");</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロック内のMarkdown記法は解釈されないこと", () => {
  const input = `code,# タイトル
code,**太字** _斜体_
code,[リンク](https://example.com)`;

  const expected = `<pre><code># タイトル
**太字** _斜体_
[リンク](https://example.com)</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロック内にCSVの区切り文字（カンマ）を含む場合", () => {
  const input = `code,"function sum(a, b, c) {"
code,"  return a, b, c;"
code,"};"`;

  const expected = `<pre><code>function sum(a, b, c) {
  return a, b, c;
};</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロックのCSV行にダブルクォートを含む場合", () => {
  const input = `code,"const str = ""This is a ""quoted"" string"";"`;

  const expected = `<pre><code>const str = "This is a "quoted" string";</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロック内に改行を含むCSVフィールド", () => {
  const input = `code,"function multiline() {
  console.log(""test"");
  return true;
}"`;

  const expected = `<pre><code>function multiline() {
  console.log("test");
  return true;
}</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("中間の行だけ言語指定がある場合", () => {
  const input = `code,const a = 1;
code,console.log(a);,language=javascript
code,alert(a);`;

  const expected = `<pre><code data-language="javascript">const a = 1;
console.log(a);
alert(a);</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロックの後に他の種類のコードブロックが続く場合", () => {
  const input = `code,const a = 1;,language=javascript
code,console.log(a);

code,def hello():,language=python
code,"    print(""Hello"")"`;

  const expected = `<pre><code data-language="javascript">const a = 1;
console.log(a);</code></pre>
<pre><code data-language="python">def hello():
    print("Hello")</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("不正な属性形式のコードブロック", () => {
  const input = `code,"console.log(""Hello"");",languagejavascript`;

  // 属性形式が不正な場合は、単純に値として扱われるべき
  const expected = `<pre><code>console.log("Hello");
languagejavascript</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロック内でインラインマークアップが解釈されないこと", () => {
  const input = `code,# Heading
code,**Bold** and *Italic*
code,- List item
code,  - Nested item
code,\`\`\`
code,Nested code
code,\`\`\`
code,[Link](https://example.com)`;

  const expected = `<pre><code># Heading
**Bold** and *Italic*
- List item
  - Nested item
\`\`\`
Nested code
\`\`\`
[Link](https://example.com)</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロックがインライン要素として他の要素内に含まれる場合", () => {
  const input = `p,これは \`const x = 1;\` インラインコードです。
code,// これは別のブロックレベルのコードです
code,const y = 2;`;

  const expected = `<p>これは <code>const x = 1;</code> インラインコードです。</p>
<pre><code>// これは別のブロックレベルのコードです
const y = 2;</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("属性値がエスケープされたイコール記号を含む場合", () => {
  const input = `code,"console.log(""x == y"");",language=javascript;data-condition=x\\=\\=y`;

  const expected = `<pre><code data-condition="x==y" data-language="javascript">console.log("x == y");</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("空行を含むコードブロック", () => {
  const input = `code,function example() {
code,
code,  // 空行の後のコメント
code,  return true;
code,}`;

  const expected = `<pre><code>function example() {

  // 空行の後のコメント
  return true;
}</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("無効なタグ名の行がコードブロックの中に現れる場合", () => {
  const input = `code,const x = 1;
invalidtag,console.log(x);
code,const y = 2;`;

  // 無効なタグは p タグとして扱われるべきなので、コードブロックは分断される
  const expected = `<pre><code>const x = 1;</code></pre>
<p>console.log(x);</p>
<pre><code>const y = 2;</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("非常に長いコードブロック", () => {
  // 100行のコードブロックを生成
  const codeLines = Array.from(
    { length: 100 },
    (_, i) => `code,// Line ${i + 1}`,
  ).join("\n");
  const input = codeLines;

  // 期待される出力を生成
  const expectedLines = Array.from(
    { length: 100 },
    (_, i) => `// Line ${i + 1}`,
  ).join("\n");
  const expected = `<pre><code>${expectedLines}</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("HTMLコードを含むコードブロック", () => {
  const input = `code,"<!DOCTYPE html>"
code,"<html>"
code,"  <head>"
code,"    <title>Test</title>"
code,"  </head>"
code,"  <body>"
code,"    <h1>Hello, world!</h1>"
code,"  </body>"
code,"</html>"`;

  const expected = `<pre><code>&lt;!DOCTYPE html&gt;
&lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;Test&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;h1&gt;Hello, world!&lt;/h1&gt;
  &lt;/body&gt;
&lt;/html&gt;</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("CSSコードを含むコードブロック", () => {
  const input = `code,.container {,language=css
code,  display: flex;
code,  flex-direction: column;
code,  align-items: center;
code,}
code,
code,.item {
code,  margin: 10px;
code,  padding: 5px;
code,}`;

  const expected = `<pre><code data-language="css">.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.item {
  margin: 10px;
  padding: 5px;
}</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("日本語や多言語を含むコードブロック", () => {
  const input = `code,// 日本語のコメント,language=javascript
code,"const message = ""こんにちは、世界！"";"
code,console.log(message);
code,// русский комментарий
code,"const русский = ""Привет, мир!"";"`;

  const expected = `<pre><code data-language="javascript">// 日本語のコメント
const message = "こんにちは、世界！";
console.log(message);
// русский комментарий
const русский = "Привет, мир!";</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("絵文字を含むコードブロック", () => {
  const input = `code,// 😀 絵文字を含むコメント
code,"const smile = ""😀"";"
code,"console.log(""Hello 🌎"");"`;

  const expected = `<pre><code>// 😀 絵文字を含むコメント
const smile = "😀";
console.log("Hello 🌎");</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("バックスラッシュを含むコードブロック", () => {
  const input = `code,"const path = ""C:\\\\Program Files\\\\App"";"`;

  const expected = `<pre><code>const path = "C:\\\\Program Files\\\\App";</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロックとインラインコードの混在", () => {
  const input = `p,インラインコード \`const x = 1;\` の例
code,// ブロックコード
code,function example() {
code,  return true;
code,}
p,別のインラインコード \`return false;\` の例`;

  const expected = `<p>インラインコード <code>const x = 1;</code> の例</p>
<pre><code>// ブロックコード
function example() {
  return true;
}</code></pre>
<p>別のインラインコード <code>return false;</code> の例</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロックエイリアス(```)を使ったパース", () => {
  // バックティックを含むCSV文字列を手動で作成
  // シンプルなテキスト内容に変更
  const input = "```,simple code";

  const expected = "<pre><code>simple code</code></pre>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロックエイリアスを使った複数行のコード", () => {
  // 文字列連結で複数行のコードを作成
  const input = "```,line1\n```,line2\n```,line3";

  const expected = `<pre><code>line1
line2
line3</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロックエイリアスと言語指定の組み合わせ", () => {
  // 文字列連結で言語指定付きのコードを作成
  const input = "```,code line 1,language=javascript\n```,code line 2";

  const expected = `<pre><code data-language="javascript">code line 1
code line 2</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロックエイリアスとエスケープの組み合わせ", () => {
  const input = '```,"function test(a, b, c) {"';

  const expected = "<pre><code>function test(a, b, c) {</code></pre>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("コードブロック内の特殊記号がエスケープされること", () => {
  const input = `code,"const html = ""<div>テスト</div>"";"
code,"const amp = ""&"";"
code,"const gt = "">"";"
code,"const lt = ""<"";"`;

  const expected = `<pre><code>const html = "&lt;div&gt;テスト&lt;/div&gt;";
const amp = "&amp;";
const gt = "&gt;";
const lt = "&lt;";</code></pre>`;

  assertHTMLEquals(parse(input), expected);
});
