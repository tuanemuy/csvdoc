import { assertHTMLEquals, compareHTML, normalizeHTML } from "./utils.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

// normalizeHTMLの基本的な機能をテスト
Deno.test("normalizeHTML - 基本的な機能", () => {
  const input = `
    <div>
      <p>Hello World</p>
    </div>
  `;
  const expected = "<div><p>Hello World</p></div>";

  assertEquals(normalizeHTML(input), expected);
});

// 属性の順序の正規化をテスト
Deno.test("normalizeHTML - 属性の順序の正規化", () => {
  const input =
    '<div class="container" id="main" data-test="value">コンテンツ</div>';
  const expected =
    '<div class="container" data-test="value" id="main">コンテンツ</div>';

  assertEquals(normalizeHTML(input), expected);
});

// pre内の属性の順序の正規化をテスト
Deno.test("normalizeHTML - pre内の属性の順序の正規化", () => {
  const input =
    '<pre><code class="container" id="main" data-test="value">コンテンツ</code></pre>';
  const expected =
    '<pre><code class="container" data-test="value" id="main">コンテンツ</code></pre>';

  assertEquals(normalizeHTML(input), expected);
});

// テキストノードの空白処理をテスト
Deno.test("normalizeHTML - テキストノードの空白処理", () => {
  const input = "<p>  テキストの前後に空白がある  </p>";
  const expected = "<p>テキストの前後に空白がある</p>";

  assertEquals(normalizeHTML(input), expected);
});

// インライン要素内の空白の保持をテスト
Deno.test("normalizeHTML - インライン要素内の空白の保持", () => {
  const input = "<p>テキスト <strong>太字</strong> テキスト</p>";
  const expected = "<p>テキスト<strong>太字</strong>テキスト</p>";

  assertEquals(normalizeHTML(input), expected);
});

// リスト要素内のテキストと子要素の混在をテスト
Deno.test("normalizeHTML - リスト要素内のテキストと子要素の混在", () => {
  const input = `
    <ul>
      <li>テキストのみ</li>
      <li>テキスト <strong>太字</strong> テキスト</li>
      <li>テキスト
        <ul>
          <li>ネストされたリスト</li>
        </ul>
      </li>
    </ul>
  `;
  const expected =
    "<ul><li>テキストのみ</li><li>テキスト<strong>太字</strong>テキスト</li><li>テキスト<ul><li>ネストされたリスト</li></ul></li></ul>";

  assertEquals(normalizeHTML(input), expected);
});

// コードブロック内の改行と空白の保持をテスト
Deno.test("normalizeHTML - コードブロック内の改行と空白の保持", () => {
  const input = `
    <pre><code>
function hello() {
  console.log("Hello, world!");
}
    </code></pre>
  `;
  // コードブロック内の内容は保持されるが、pre/codeタグの周囲の空白は削除される
  const expected =
    '<pre><code>\nfunction hello() {\n  console.log("Hello, world!");\n}\n    </code></pre>';

  assertEquals(normalizeHTML(input), expected);
});

// コードブロックの属性の正規化をテスト
Deno.test("normalizeHTML - コードブロックの属性の正規化", () => {
  const input =
    '<pre language="javascript" class="code-block"><code>const x = 42;</code></pre>';
  const expected =
    '<pre class="code-block" language="javascript"><code>const x = 42;</code></pre>';

  assertEquals(normalizeHTML(input), expected);
});

// 複雑なHTML構造の正規化をテスト
Deno.test("normalizeHTML - 複雑なHTML構造", () => {
  const input = `
    <div class="container">
      <h1>タイトル</h1>
      <p>段落 <em>強調</em> テキスト</p>
      <ul>
        <li>アイテム1</li>
        <li>アイテム2 <a href="#link">リンク</a></li>
        <li>アイテム3
          <ul>
            <li>サブアイテム <code>コード</code></li>
          </ul>
        </li>
      </ul>
      <pre><code>
// コードブロック
function test() {
  return true;
}
      </code></pre>
    </div>
  `;

  const expected =
    '<div class="container"><h1>タイトル</h1><p>段落<em>強調</em>テキスト</p><ul><li>アイテム1</li><li>アイテム2<a href="#link">リンク</a></li><li>アイテム3<ul><li>サブアイテム<code>コード</code></li></ul></li></ul><pre><code>\n// コードブロック\nfunction test() {\n  return true;\n}\n      </code></pre></div>';

  assertEquals(normalizeHTML(input), expected);
});

// compareHTML関数のテスト
Deno.test("compareHTML - 異なる書式の同じHTML", () => {
  const html1 = `
    <div>
      <p>Hello</p>
    </div>
  `;
  const html2 = "<div><p>Hello</p></div>";

  assertEquals(compareHTML(html1, html2), true);
});

// assertHTMLEquals関数のテスト
Deno.test("assertHTMLEquals - 一致するHTML", () => {
  const html1 = '<div id="test" class="container">テスト</div>';
  const html2 = '<div class="container" id="test">テスト</div>';

  // エラーがスローされなければテスト成功
  assertHTMLEquals(html1, html2);
});

// エッジケース: 空のHTMLのテスト
Deno.test("normalizeHTML - 空のHTML", () => {
  assertEquals(normalizeHTML(""), "");
  assertEquals(normalizeHTML(" "), "");
  assertEquals(normalizeHTML("\n"), "");
});

// エッジケース: 特殊文字を含むHTMLのテスト
Deno.test("normalizeHTML - 特殊文字を含むHTML", () => {
  const input = '<div>&lt;script&gt;alert("XSS");&lt;/script&gt;</div>';
  const expected = '<div>&lt;script&gt;alert("XSS");&lt;/script&gt;</div>';

  assertEquals(normalizeHTML(input), expected);
});

// 連続するテキストノード間の空白保持をテスト
Deno.test("normalizeHTML - 連続するテキストノード間の空白", () => {
  const input = "<p>最初のテキスト 次のテキスト</p>";
  const expected = "<p>最初のテキスト 次のテキスト</p>";

  assertEquals(normalizeHTML(input), expected);
});
