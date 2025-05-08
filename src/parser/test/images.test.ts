import { parse } from "../index.ts";
import { assertHTMLEquals } from "./utils.ts";

Deno.test("基本的な画像要素のパース", () => {
  const input = "img,代替テキスト,src=image.jpg";

  const expected = `<p><img src="image.jpg" alt="代替テキスト" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数の属性を持つ画像要素のパース", () => {
  const input = "img,写真,src=photo.jpg;width=400;height=300;class=thumbnail";

  const expected = `<p><img src="photo.jpg" width="400" height="300" class="thumbnail" alt="写真" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("altが2列目のものと最終列の属性で重複する場合", () => {
  const input = "img,car,src=car.jpg;alt=train";

  const expected = `<p><img src="car.jpg" alt="car" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("画像要素がp要素で囲まれることの確認", () => {
  const input = `img,画像1,src=image1.jpg
img,画像2,src=image2.jpg`;

  const expected = `<p><img src="image1.jpg" alt="画像1" /></p>
<p><img src="image2.jpg" alt="画像2" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("srcが指定されていない場合の処理", () => {
  const input = "img,代替テキスト";

  const expected = `<p><img alt="代替テキスト" src="" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("空のalt属性の処理", () => {
  const input = "img,,src=image.jpg";

  const expected = `<p><img src="image.jpg" alt="" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("エスケープが必要な属性値を持つ画像のパース", () => {
  const input =
    "img,画像,src=image.jpg;title=これは\\;セミコロンを含む\\=タイトルです";

  const expected = `<p><img src="image.jpg" title="これは;セミコロンを含む=タイトルです" alt="画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("引用符を含む属性値を持つ画像のパース", () => {
  const input = `img,画像,"src=image.jpg;title=""引用符を含むタイトル"""`;

  const expected = `<p><img src="image.jpg" title="&quot;引用符を含むタイトル&quot;" alt="画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("不正な形式の属性を持つ画像のパース", () => {
  const input = "img,画像,src=image.jpgwidth=400";

  const expected = `<p><img src="image.jpgwidth=400" alt="画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("他のブロック要素と混在する場合の画像処理", () => {
  const input = `p,テキスト
img,画像,src=image.jpg
p,続きのテキスト`;

  const expected = `<p>テキスト</p>
<p><img src="image.jpg" alt="画像" /></p>
<p>続きのテキスト</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("巨大な属性値を持つ画像のパース", () => {
  // 1000文字のダミー文字列
  const longText = "A".repeat(1000);
  const input = `img,長い代替テキスト,src=image.jpg;title=${longText}`;

  const expected = `<p><img src="image.jpg" title="${longText}" alt="長い代替テキスト" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("絵文字を含む属性値を持つ画像のパース", () => {
  const input = "img,😀 絵文字,src=image.jpg;title=絵文字テスト 🌟";

  const expected = `<p><img src="image.jpg" title="絵文字テスト 🌟" alt="😀 絵文字" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("空白文字を多く含む属性値の処理", () => {
  const input =
    "img,画像,src=image.jpg;title=  複数の  空白を  含む  タイトル  ";

  const expected = `<p><img src="image.jpg" title="  複数の  空白を  含む  タイトル  " alt="画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("Markdownインライン記法を含む代替テキストの処理", () => {
  const input = "img,**太字** と *斜体* を含む代替テキスト,src=image.jpg";

  const expected = `<p><img src="image.jpg" alt="**太字** と *斜体* を含む代替テキスト" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("データURLを使用した画像のパース", () => {
  const input = `img,データURL画像,"src=data:image/png\\;base64,iVBORw0KGgoAAAANSUhEUgAA"`;

  const expected = `<p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA" alt="データURL画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("絶対パスURLを使用した画像のパース", () => {
  const input = "img,絶対パス画像,src=https://example.com/images/photo.jpg";

  const expected = `<p><img src="https://example.com/images/photo.jpg" alt="絶対パス画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("相対パスURLを使用した画像のパース", () => {
  const input = "img,相対パス画像,src=../images/photo.jpg";

  const expected = `<p><img src="../images/photo.jpg" alt="相対パス画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("クエリパラメータを含むURLを使用した画像のパース", () => {
  const input = "img,クエリパラメータ付き画像,src=image.php?id=123&size=large";

  const expected = `<p><img src="image.php?id=123&size=large" alt="クエリパラメータ付き画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("URLエンコードが必要な文字を含むsrc属性の処理", () => {
  const input = "img,日本語パス,src=images/日本語ファイル名.jpg";

  const expected = `<p><img src="images/日本語ファイル名.jpg" alt="日本語パス" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数のimg要素が連続する場合", () => {
  const input = `img,画像1,src=image1.jpg
img,画像2,src=image2.jpg
img,画像3,src=image3.jpg`;

  const expected = `<p><img src="image1.jpg" alt="画像1" /></p>
<p><img src="image2.jpg" alt="画像2" /></p>
<p><img src="image3.jpg" alt="画像3" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("src属性が空文字の場合", () => {
  const input = "img,空のsrc,src=";

  const expected = `<p><img src="" alt="空のsrc" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("属性値にHTMLタグを含む場合", () => {
  const input = `img,画像,"src=image.jpg;title=<script>alert(""XSS"")</script>"`;

  const expected = `<p><img src="image.jpg" title="&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;" alt="画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("HTMLとして不正な属性名を持つ場合", () => {
  const input = "img,画像,src=image.jpg;123-invalid=value";

  const expected = `<p><img src="image.jpg" alt="画像" 123-invalid="value" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("imgタグの直後に他のインライン要素が続く場合", () => {
  const input = "p,テキスト前 ![インライン画像](inline.jpg) テキスト後";

  const expected = `<p>テキスト前 <img src="inline.jpg" alt="インライン画像" /> テキスト後</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("異なるタグの間に配置された画像要素", () => {
  const input = `h1,見出し
img,中間の画像,src=middle.jpg
p,段落テキスト`;

  const expected = `<h1>見出し</h1>
<p><img src="middle.jpg" alt="中間の画像" /></p>
<p>段落テキスト</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("フラグメント識別子を含むsrc属性", () => {
  const input = "img,フラグメント,src=image.jpg#section1";

  const expected = `<p><img src="image.jpg#section1" alt="フラグメント" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("srcsetとsize属性を持つ画像", () => {
  const input = `img,レスポンシブ画像,"src=small.jpg;srcset=medium.jpg 600w, large.jpg 1200w;sizes=100vw"`;

  const expected = `<p><img src="small.jpg" srcset="medium.jpg 600w, large.jpg 1200w" sizes="100vw" alt="レスポンシブ画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("loading属性を持つ画像", () => {
  const input = "img,遅延読み込み画像,src=lazy.jpg;loading=lazy";

  const expected = `<p><img src="lazy.jpg" loading="lazy" alt="遅延読み込み画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("カスタムデータ属性を持つ画像", () => {
  const input =
    "img,カスタム属性画像,src=custom.jpg;data-custom=value;data-index=42";

  const expected = `<p><img src="custom.jpg" data-custom="value" data-index="42" alt="カスタム属性画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("CSSスタイルを持つ画像", () => {
  const input = `img,スタイル付き画像,"src=styled.jpg;style=border: 1px solid red\\; padding: 5px\\;"`;

  const expected = `<p><img src="styled.jpg" style="border: 1px solid red; padding: 5px;" alt="スタイル付き画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("無効なsrc値を持つ画像", () => {
  const input = `img,無効なソース,src=javascript:alert('XSS')`;

  // 実装によっては、このような危険なURLをサニタイズするかもしれません
  const expected = `<p><img src="javascript:alert('XSS')" alt="無効なソース" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("角括弧とかっこを含むalt属性", () => {
  const input = "img,[複雑な[代替]テキスト](括弧付き),src=complex.jpg";

  const expected = `<p><img src="complex.jpg" alt="[複雑な[代替]テキスト](括弧付き)" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("特殊文字を含むsrc属性のエスケープ", () => {
  const input = `img,特殊文字,"src=image%20with%20spaces.jpg?param=""quoted""&special=<>&"`;

  const expected = `<p><img src="image%20with%20spaces.jpg?param=&quot;quoted&quot;&special=<>&" alt="特殊文字" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数行にわたる長い属性値", () => {
  const input = `img,長い属性,"src=image.jpg;longattr=これは
複数行にわたる
長い属性値です"`;

  // CSVパーサーの実装により、改行を含む引用符で囲まれた値をどう扱うかが変わります
  const expected = `<p><img src="image.jpg" longattr="これは
複数行にわたる
長い属性値です" alt="長い属性" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("画像なしのMarkdownインライン画像記法", () => {
  const input = "p,![代替テキストのみ]()";

  // インラインパーサーがどう処理するかに依存します
  const expected = `<p><img src="" alt="代替テキストのみ" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("他のタグ内での画像（リスト内）", () => {
  const input = `ul,項目1
ul,項目2 ![リスト内画像](list-image.jpg) テキスト
ul,項目3`;

  const expected = `<ul>
<li>項目1</li>
<li>項目2 <img src="list-image.jpg" alt="リスト内画像" /> テキスト</li>
<li>項目3</li>
</ul>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("他のタグ内での画像（見出し内）", () => {
  const input = "h1,見出し ![見出し内画像](header-image.jpg) テキスト";

  const expected = `<h1>見出し <img src="header-image.jpg" alt="見出し内画像" /> テキスト</h1>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数のインライン画像の連続", () => {
  const input =
    "p,テキスト ![画像1](image1.jpg) 中間テキスト ![画像2](image2.jpg) 終了テキスト";

  const expected = `<p>テキスト <img src="image1.jpg" alt="画像1" /> 中間テキスト <img src="image2.jpg" alt="画像2" /> 終了テキスト</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("インライン画像とブロック画像の組み合わせ", () => {
  const input = `p,テキスト開始 ![インライン画像](inline.jpg) テキスト
img,ブロック画像,src=block.jpg
p,続きのテキスト`;

  const expected = `<p>テキスト開始 <img src="inline.jpg" alt="インライン画像" /> テキスト</p>
<p><img src="block.jpg" alt="ブロック画像" /></p>
<p>続きのテキスト</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("不完全なMarkdownインライン画像記法", () => {
  const input = "p,テキスト ![代替テキスト(image.jpg) 終了";

  // パーサーの実装により結果は異なりますが、多くの場合テキストとしてそのまま扱われます
  const expected = "<p>テキスト ![代替テキスト(image.jpg) 終了</p>";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("属性値に余分なセミコロンが含まれる場合", () => {
  const input = "img,画像,src=image.jpg;;;;class=test;;;";

  // 実装による扱いの違いがありますが、一般的には余分なセミコロンは無視されます
  const expected = `<p><img src="image.jpg" class="test" alt="画像" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("属性指定のない画像タグ", () => {
  const input = "img,シンプルな画像";

  const expected = `<p><img alt="シンプルな画像" src="" /></p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("非常に長い代替テキスト", () => {
  // 500文字の代替テキスト
  const longAlt = "長い代替テキスト".repeat(50);
  const input = `img,${longAlt},src=long.jpg`;

  const expected = `<p><img src="long.jpg" alt="${longAlt}" /></p>`;

  assertHTMLEquals(parse(input), expected);
});
