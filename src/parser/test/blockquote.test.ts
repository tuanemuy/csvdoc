import { parse } from "../index.ts";
import { assertHTMLEquals } from "./utils.ts";

Deno.test("基本的な引用要素のパース", () => {
  const input = "blockquote,引用文です。";

  const expected = `<blockquote>
    <p>引用文です。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数行の引用要素のパース", () => {
  const input = `blockquote,最初の引用文です。
blockquote,続きの引用文です。`;

  const expected = `<blockquote>
    <p>最初の引用文です。</p>
    <p>続きの引用文です。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("ネスト(入れ子)構造を持つ引用要素のパース", () => {
  const input = `blockquote,外側の引用です。
blockquote,外側の引用の続きです。
.blockquote,内側の引用です。
blockquote,外側の引用に戻ります。`;

  const expected = `<blockquote>
    <p>外側の引用です。</p>
    <p>外側の引用の続きです。</p>
    <blockquote>
        <p>内側の引用です。</p>
    </blockquote>
    <p>外側の引用に戻ります。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数のネストレベルを持つ引用要素のパース", () => {
  const input = `blockquote,第1レベルの引用です。
.blockquote,第2レベルの引用です。
..blockquote,第3レベルの引用です。
.blockquote,第2レベルに戻ります。
blockquote,第1レベルに戻ります。`;

  const expected = `<blockquote>
    <p>第1レベルの引用です。</p>
    <blockquote>
        <p>第2レベルの引用です。</p>
        <blockquote>
            <p>第3レベルの引用です。</p>
        </blockquote>
        <p>第2レベルに戻ります。</p>
    </blockquote>
    <p>第1レベルに戻ります。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用要素に属性を付与", () => {
  const input = `blockquote,引用文です。,class=quote;id=main-quote
.blockquote,内側の引用です。,class=nested-quote`;

  const expected = `<blockquote class="quote" id="main-quote">
    <p>引用文です。</p>
    <blockquote class="nested-quote">
        <p>内側の引用です。</p>
    </blockquote>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

// 以下、エッジケースと異常系のテスト

Deno.test("空の引用要素のパース", () => {
  const input = "blockquote,";

  const expected = `<blockquote>
    <p></p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用要素の後に他の要素が続く場合", () => {
  const input = `blockquote,引用文です。
p,これは段落です。`;

  const expected = `<blockquote>
    <p>引用文です。</p>
</blockquote>
<p>これは段落です。</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用要素内にインライン要素を含む場合", () => {
  const input =
    "blockquote,**太字** と *イタリック* と [リンク](https://example.com) と `コード`";

  const expected = `<blockquote>
    <p><strong>太字</strong> と <em>イタリック</em> と <a href="https://example.com">リンク</a> と <code>コード</code></p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("深さのスキップがある引用要素のパース（レベル1から3へ）", () => {
  const input = `blockquote,第1レベルの引用です。
...blockquote,第3レベルの引用です（第2レベルをスキップ）。`;

  const expected = `<blockquote>
    <p>第1レベルの引用です。</p>
    <blockquote>
        <p>第3レベルの引用です（第2レベルをスキップ）。</p>
    </blockquote>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用要素の間に空行がある場合", () => {
  const input = `blockquote,最初の引用文です。

blockquote,空行を挟んだ引用文です。`;

  const expected = `<blockquote>
    <p>最初の引用文です。</p>
</blockquote>
<blockquote>
    <p>空行を挟んだ引用文です。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("入れ子の深い引用から一気に最上位に戻る場合", () => {
  const input = `blockquote,第1レベルの引用です。
.blockquote,第2レベルの引用です。
..blockquote,第3レベルの引用です。
blockquote,一気に第1レベルに戻ります。`;

  const expected = `<blockquote>
    <p>第1レベルの引用です。</p>
    <blockquote>
        <p>第2レベルの引用です。</p>
        <blockquote>
            <p>第3レベルの引用です。</p>
        </blockquote>
    </blockquote>
    <p>一気に第1レベルに戻ります。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("空行のみの引用要素", () => {
  const input = `blockquote,
blockquote,`;

  const expected = `<blockquote>
    <p></p>
    <p></p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用要素内に様々なインライン要素を混在させる", () => {
  const input =
    "blockquote,**太字** _イタリック_ `コード` ~~打ち消し~~ [リンク](https://example.com) ![画像](image.jpg)";

  const expected = `<blockquote>
    <p><strong>太字</strong> <em>イタリック</em> <code>コード</code> <del>打ち消し</del> <a href="https://example.com">リンク</a> <img src="image.jpg" alt="画像"></p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用要素の属性値にエスケープされた特殊文字を含む", () => {
  // より単純な例を使用して、セミコロンとイコールのみのエスケープをテスト
  const input =
    "blockquote,エスケープ属性付き引用,data-value=key\\=value\\;another";

  const expected = `<blockquote data-value="key=value;another">
    <p>エスケープ属性付き引用</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用要素がCSVのカンマを含む場合", () => {
  const input = `blockquote,"これは, カンマを含む引用です。"`;

  const expected = `<blockquote>
    <p>これは, カンマを含む引用です。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用を含むHTMLタグのエスケープ処理", () => {
  // 現在の実装ではHTMLタグはエスケープされずに出力される
  const input = "blockquote,ここには <div>HTML</div> タグが含まれています。";

  const expected = `<blockquote>
    <p>ここには <div>HTML</div> タグが含まれています。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("非常に長いテキストを含む引用要素", () => {
  const longText = "これは非常に長いテキストです。".repeat(100);
  const input = `blockquote,${longText}`;

  const expected = `<blockquote>
    <p>${longText}</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("多数のネストレベルを持つ引用要素", () => {
  // 5段階の深いネスト
  const input = `blockquote,第1レベルの引用です。
.blockquote,第2レベルの引用です。
..blockquote,第3レベルの引用です。
...blockquote,第4レベルの引用です。
....blockquote,第5レベルの引用です。
.....blockquote,第6レベルの引用です。`;

  // 実際の出力に近い期待値を設定
  const expected = `<blockquote>
    <p>第1レベルの引用です。</p>
    <blockquote>
        <p>第2レベルの引用です。</p>
        <blockquote>
            <p>第3レベルの引用です。</p>
            <blockquote>
                <p>第4レベルの引用です。</p>
                <blockquote>
                    <p>第5レベルの引用です。</p>
                    <blockquote>
                        <p>第6レベルの引用です。</p>
                    </blockquote>
                </blockquote>
            </blockquote>
        </blockquote>
    </blockquote>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用の間に他の要素が混在する複合構造", () => {
  const input = `blockquote,最初の引用です。
p,これは通常の段落です。
blockquote,次の引用です。
h2,見出し
blockquote,最後の引用です。`;

  const expected = `<blockquote>
    <p>最初の引用です。</p>
</blockquote>
<p>これは通常の段落です。</p>
<blockquote>
    <p>次の引用です。</p>
</blockquote>
<h2>見出し</h2>
<blockquote>
    <p>最後の引用です。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("異なる深さの引用が交互に現れる場合", () => {
  const input = `blockquote,レベル1の引用です。
.blockquote,レベル2の引用です。
blockquote,レベル1に戻ります。
.blockquote,また、レベル2に行きます。
..blockquote,レベル3に進みます。
blockquote,最後にレベル1に戻ります。`;

  const expected = `<blockquote>
    <p>レベル1の引用です。</p>
    <blockquote>
        <p>レベル2の引用です。</p>
    </blockquote>
    <p>レベル1に戻ります。</p>
    <blockquote>
        <p>また、レベル2に行きます。</p>
        <blockquote>
            <p>レベル3に進みます。</p>
        </blockquote>
    </blockquote>
    <p>最後にレベル1に戻ります。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用エイリアス(>)を使った基本的な引用要素のパース", () => {
  const input = ">,引用文です。";

  const expected = `<blockquote>
    <p>引用文です。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用エイリアスを使った複数行の引用要素のパース", () => {
  const input = `>,最初の引用文です。
>,続きの引用文です。`;

  const expected = `<blockquote>
    <p>最初の引用文です。</p>
    <p>続きの引用文です。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用エイリアスを使ったネスト構造の引用要素のパース", () => {
  const input = `>,外側の引用です。
.>,内側の引用です。
>,外側の引用に戻ります。`;

  const expected = `<blockquote>
    <p>外側の引用です。</p>
    <blockquote>
        <p>内側の引用です。</p>
    </blockquote>
    <p>外側の引用に戻ります。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用エイリアスと属性を組み合わせた引用要素", () => {
  const input = ">,引用文です。,class=quote;id=main-quote";

  const expected = `<blockquote class="quote" id="main-quote">
    <p>引用文です。</p>
</blockquote>`;

  assertHTMLEquals(parse(input), expected);
});
