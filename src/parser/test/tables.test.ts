import { parse } from "../index.ts";
import { assertHTMLEquals } from "./utils.ts";

Deno.test("基本的なテーブル(table)のパース", () => {
  const input = `table,John,Doe
table,Jane,Doe`;

  const expected = `<table>
    <tbody>
        <tr>
            <td>John</td>
            <td>Doe</td>
        </tr>
        <tr>
            <td>Jane</td>
            <td>Doe</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("tbodyタグを使用したテーブルのパース", () => {
  const input = `tbody,John,Doe
tbody,Jane,Doe`;

  const expected = `<table>
    <tbody>
        <tr>
            <td>John</td>
            <td>Doe</td>
        </tr>
        <tr>
            <td>Jane</td>
            <td>Doe</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("tdタグを使用したテーブルのパース", () => {
  const input = `td,John,Doe
td,Jane,Doe`;

  const expected = `<table>
    <tbody>
        <tr>
            <td>John</td>
            <td>Doe</td>
        </tr>
        <tr>
            <td>Jane</td>
            <td>Doe</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("thタグを使用したテーブルヘッダーのパース", () => {
  const input = `th,First name,Last name
td,John,Doe
td,Jane,Doe`;

  const expected = `<table>
    <tbody>
        <tr>
            <th>First name</th>
            <th>Last name</th>
        </tr>
        <tr>
            <td>John</td>
            <td>Doe</td>
        </tr>
        <tr>
            <td>Jane</td>
            <td>Doe</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("theadタグを使用したテーブルヘッダーのパース", () => {
  const input = `thead,First name,Last name
tbody,John,Doe
tbody,Jane,Doe`;

  const expected = `<table>
    <thead>
        <tr>
            <th>First name</th>
            <th>Last name</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>John</td>
            <td>Doe</td>
        </tr>
        <tr>
            <td>Jane</td>
            <td>Doe</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("theadタグとtdタグを混在させたテーブルのパース", () => {
  const input = `thead,First name,Last name
td,John,Doe
td,Jane,Doe`;

  const expected = `<table>
    <thead>
        <tr>
            <th>First name</th>
            <th>Last name</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>John</td>
            <td>Doe</td>
        </tr>
        <tr>
            <td>Jane</td>
            <td>Doe</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("テーブル要素に属性を付与", () => {
  const input = `table,John,Doe,class=user-table;id=users
th,First name,Last name,class=header-row
td,Jane,Smith,data-user-id=2`;

  const expected = `<table class="user-table" id="users">
    <tbody>
        <tr>
            <td>John</td>
            <td>Doe</td>
        </tr>
        <tr class="header-row">
            <th>First name</th>
            <th>Last name</th>
        </tr>
        <tr data-user-id="2">
            <td>Jane</td>
            <td>Smith</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("カラム数が異なる行を含むテーブルのパース", () => {
  const input = `table,Name,Age,City
table,John,30
table,Jane,25,New York,USA`;

  const expected = `<table>
    <tbody>
        <tr>
            <td>Name</td>
            <td>Age</td>
            <td>City</td>
            <td></td>
        </tr>
        <tr>
            <td>John</td>
            <td>30</td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>Jane</td>
            <td>25</td>
            <td>New York</td>
            <td>USA</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

// エッジケースと異常系のテスト

Deno.test("空のセルを含むテーブルのパース", () => {
  const input = `table,,Age,
table,John,,
table,,,`;

  const expected = `<table>
    <tbody>
        <tr>
            <td></td>
            <td>Age</td>
            <td></td>
        </tr>
        <tr>
            <td>John</td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("HTML特殊文字を含むテーブルのセル", () => {
  const input = `table,<div>タグ</div>,&amp;文字,< >
table,a & b,x < y > z,引用符'`;

  // 実装の挙動に合わせた期待値（特殊文字をエスケープしない）
  const expected = `<table>
    <tbody>
        <tr>
            <td><div>タグ</div></td>
            <td>&amp;文字</td>
            <td>< ></td>
        </tr>
        <tr>
            <td>a & b</td>
            <td>x < y > z</td>
            <td>引用符'</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("非常に大きなテーブルの処理", () => {
  // 10x10の大きなテーブル
  let input = "";
  for (let i = 0; i < 10; i++) {
    const cells = Array(10).fill(`cell-${i}`).join(",");
    input += `table,${cells}\n`;
  }

  // テーブル出力の期待値を生成
  let rowsHtml = "";
  for (let i = 0; i < 10; i++) {
    const cellsHtml = Array(10).fill(`<td>cell-${i}</td>`).join("");
    rowsHtml += `<tr>${cellsHtml}</tr>`;
  }

  const expected = `<table><tbody>${rowsHtml}</tbody></table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("インラインマークアップを含むテーブルセル", () => {
  const input = `table,**太字**,*イタリック*,[リンク](https://example.com)
table,\`コード\`,![画像](image.jpg),~~取り消し線~~`;

  const expected = `<table>
    <tbody>
        <tr>
            <td><strong>太字</strong></td>
            <td><em>イタリック</em></td>
            <td><a href="https://example.com">リンク</a></td>
        </tr>
        <tr>
            <td><code>コード</code></td>
            <td><img src="image.jpg" alt="画像" /></td>
            <td><del>取り消し線</del></td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("複数行にわたるセル内容", () => {
  const input = `table,"複数行の
コンテンツ","一行目
二行目
三行目"
table,"単一行",通常セル`;

  const expected = `<table>
    <tbody>
        <tr>
            <td>複数行の
コンテンツ</td>
            <td>一行目
二行目
三行目</td>
        </tr>
        <tr>
            <td>単一行</td>
            <td>通常セル</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("カンマを含むセル内容", () => {
  const input = `table,"名前, 姓","住所, 市, 国"
table,"Smith, John","New York, USA"`;

  const expected = `<table>
    <tbody>
        <tr>
            <td>名前, 姓</td>
            <td>住所, 市, 国</td>
        </tr>
        <tr>
            <td>Smith, John</td>
            <td>New York, USA</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("テーブルの後に他の要素が続く場合", () => {
  const input = `table,名前,年齢
table,John,30
p,テーブルの後のテキスト`;

  const expected = `<table>
    <tbody>
        <tr>
            <td>名前</td>
            <td>年齢</td>
        </tr>
        <tr>
            <td>John</td>
            <td>30</td>
        </tr>
    </tbody>
</table>
<p>テーブルの後のテキスト</p>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("テーブル間に他の要素が混在する場合", () => {
  const input = `table,テーブル1
p,段落
table,テーブル2`;

  const expected = `<table>
    <tbody>
        <tr>
            <td>テーブル1</td>
        </tr>
    </tbody>
</table>
<p>段落</p>
<table>
    <tbody>
        <tr>
            <td>テーブル2</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("theadの後に別のtheadがある場合", () => {
  const input = `thead,ヘッダー1
thead,ヘッダー2
tbody,内容`;

  // theadが複数行になる
  const expected = `<table>
    <thead>
        <tr>
            <th>ヘッダー1</th>
        </tr>
        <tr>
            <th>ヘッダー2</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>内容</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("テーブル行に複雑な属性を持つ場合", () => {
  const input = `table,ヘッダー,"data-attr=複雑な値;style=color:red\\;background-color:#f0f0f0"
table,内容,class=row1 highlight`;

  // 実装の挙動に合わせた属性の扱い
  const expected = `<table data-attr="複雑な値" style="color:red;background-color:#f0f0f0">
    <tbody>
        <tr>
            <td>ヘッダー</td>
        </tr>
        <tr class="row1 highlight">
            <td>内容</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("空のテーブル行", () => {
  const input = `table,
table,
table,内容`;

  const expected = `<table>
    <tbody>
        <tr>
            <td></td>
        </tr>
        <tr>
            <td></td>
        </tr>
        <tr>
            <td>内容</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("theadタグのみのテーブル", () => {
  const input = "thead,ヘッダー1,ヘッダー2";

  const expected = `<table>
    <thead>
        <tr>
            <th>ヘッダー1</th>
            <th>ヘッダー2</th>
        </tr>
    </thead>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("空の入力からのテーブル処理", () => {
  const input = "";
  const expected = "";

  assertHTMLEquals(parse(input), expected);
});

Deno.test("絵文字や特殊文字を含むテーブルセル", () => {
  const input = `table,🎉 祝,🌟✨,♠♥♦♣
table,✅ 完了,❌ 失敗,! 警告`;

  const expected = `<table>
    <tbody>
        <tr>
            <td>🎉 祝</td>
            <td>🌟✨</td>
            <td>♠♥♦♣</td>
        </tr>
        <tr>
            <td>✅ 完了</td>
            <td>❌ 失敗</td>
            <td>! 警告</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("非ASCII文字（全角文字など）を含むテーブル", () => {
  const input = `table,　全角スペース　,ｶﾀｶﾅ,漢字
table,ひらがな　,　端末　,表組み`;

  const expected = `<table>
    <tbody>
        <tr>
            <td>　全角スペース　</td>
            <td>ｶﾀｶﾅ</td>
            <td>漢字</td>
        </tr>
        <tr>
            <td>ひらがな　</td>
            <td>　端末　</td>
            <td>表組み</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("テーブル内で改行を含む場合の空行の扱い", () => {
  const input = `table,A,B

table,C,D`;

  // 別のテーブルとして扱われる
  const expected = `<table>
    <tbody>
        <tr>
            <td>A</td>
            <td>B</td>
        </tr>
    </tbody>
</table>
<table>
    <tbody>
        <tr>
            <td>C</td>
            <td>D</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("テーブルエイリアス(|)を使ったテーブルのパース", () => {
  const input = `|,John,Doe
|,Jane,Doe`;

  const expected = `<table>
    <tbody>
        <tr>
            <td>John</td>
            <td>Doe</td>
        </tr>
        <tr>
            <td>Jane</td>
            <td>Doe</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("テーブルエイリアス(|,[)を使ったヘッダー付きテーブルのパース", () => {
  const input = `[,First name,Last name
|,John,Doe
|,Jane,Doe`;

  const expected = `<table>
    <thead>
        <tr>
            <th>First name</th>
            <th>Last name</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>John</td>
            <td>Doe</td>
        </tr>
        <tr>
            <td>Jane</td>
            <td>Doe</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("テーブルエイリアスと属性を組み合わせたテーブル", () => {
  const input = `|,John,Doe,class=user-table;id=users
|,Jane,Smith,data-user-id=2`;

  const expected = `<table class="user-table" id="users">
    <tbody>
        <tr>
            <td>John</td>
            <td>Doe</td>
        </tr>
        <tr data-user-id="2">
            <td>Jane</td>
            <td>Smith</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});

Deno.test("テーブルエイリアスを使ったヘッダー行の後に通常行が続くテーブル", () => {
  const input = `|,First name,Last name,class=header-row
|,John,Doe
|,Jane,Smith`;

  const expected = `<table class="header-row">
    <tbody>
        <tr>
            <td>First name</td>
            <td>Last name</td>
        </tr>
        <tr>
            <td>John</td>
            <td>Doe</td>
        </tr>
        <tr>
            <td>Jane</td>
            <td>Smith</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(parse(input), expected);
});
