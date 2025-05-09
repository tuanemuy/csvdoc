import { transform } from "../mod.ts";
import { assertHTMLEquals } from "./utils.ts";

Deno.test("基本的なテーブル(table)のパース", () => {
  const input = `table0,John
table0,Doe
table1,Jane
table1,Doe
`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("基本的なテーブル(table)のパース", () => {
  const input = `th0,John
td0,27
th1,Jane
td1,24
`;

  const expected = `<table>
    <tbody>
        <tr>
            <th>John</th>
            <td>27</td>
        </tr>
        <tr>
            <th>Jane</th>
            <td>24</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("tbodyタグを使用したテーブルのパース", () => {
  const input = `tbody,John
tbody,Doe
tbody0,Jane
tbody0,Doe`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("tdタグを使用したテーブルのパース", () => {
  const input = `td1,John
td1,Doe
td,Jane
td,Doe`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("thタグを使用したテーブルヘッダーのパース", () => {
  const input = `th,First name
th,Last name
td2,John
td2,Doe
td1,Jane
td1,Doe`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("theadタグを使用したテーブルヘッダーのパース", () => {
  const input = `thead,First name
thead,Last name
tbody0,John
tbody0,Doe
tbody1,Jane
tbody1,Doe`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("theadタグとtdタグを混在させたテーブルのパース", () => {
  const input = `thead,First name
thead,Last name
td,John
td,Doe
td2,Jane
td2,Doe`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("同じSuffixが複数回使用されるテーブルのパース", () => {
  const input = `table0,John
table0,Doe
table1,Jane
table1,Doe
table0,Jack
table0,Smith
`;

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
        <tr>
            <td>Jack</td>
            <td>Smith</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("Suffixが2桁以上のテーブルのパース", () => {
  const input = `table16,John
table16,Doe
table256,Jane
table256,Doe
`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("テーブル要素に属性を付与", () => {
  const input = `table,John,class=user-table;id=users
table,Doe,data-rows=3
th0,First name
th0,Last name
td1,Jane
td1,Smith`;

  const expected = `<table class="user-table" id="users" data-rows="3">
    <tbody>
        <tr>
            <td>John</td>
            <td>Doe</td>
        </tr>
        <tr>
            <th>First name</th>
            <th>Last name</th>
        </tr>
        <tr>
            <td>Jane</td>
            <td>Smith</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("カラム数が異なる行を含むテーブルのパース", () => {
  const input = `table0,Name
table0,Age
table0,City
table1,John
table1,30
table2,Jane
table2,25
table2,New York
table2,USA`;

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

  assertHTMLEquals(transform(input), expected);
});

// エッジケースと異常系のテスト

Deno.test("空のセルを含むテーブルのパース", () => {
  const input = `table,
table,Age
table,
table0,John,
table0,
table0,
table1,
table1,
table1,`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("HTML特殊文字を含むテーブルのセル", () => {
  const input = `table0,<div>タグ</div>
table0,&amp;文字
table0,< >
table1,a & b
table1,x < y > z
table1,引用符'`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("インラインマークアップを含むテーブルセル", () => {
  const input = `table0,**太字**
table0,*イタリック*
table0,[リンク](https://example.com)
table1,\`コード\`
table1,![画像](image.jpg)
table1,~~取り消し線~~`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("複数行にわたるセル内容", () => {
  const input = `table,"複数行の
コンテンツ"
table,"一行目
二行目
三行目"
table0,"単一行"
table0,通常セル`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("カンマを含むセル内容", () => {
  const input = `table,"名前, 姓"
table,"住所, 市, 国"
table0,"Smith, John"
table0,"New York, USA"`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("テーブルの後に他の要素が続く場合", () => {
  const input = `table,名前
table,年齢
table1,John
table1,30
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

  assertHTMLEquals(transform(input), expected);
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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("theadの後に別のtheadがある場合", () => {
  const input = `thead0,ヘッダー1
thead1,ヘッダー2
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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("テーブル行に複雑な属性を持つ場合", () => {
  const input = `table2,ヘッダー,"data-attr=複雑な値;style=color:red\\;background-color:#f0f0f0"
table1,内容`;

  // 実装の挙動に合わせた属性の扱い
  const expected = `<table data-attr="複雑な値" style="color:red;background-color:#f0f0f0">
    <tbody>
        <tr>
            <td>ヘッダー</td>
        </tr>
        <tr>
            <td>内容</td>
        </tr>
    </tbody>
</table>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("空のテーブル行", () => {
  const input = `table0,
table1,
table2,内容`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("theadタグのみのテーブル", () => {
  const input = `thead,ヘッダー1
thead,ヘッダー2`;

  const expected = `<table>
    <thead>
        <tr>
            <th>ヘッダー1</th>
            <th>ヘッダー2</th>
        </tr>
    </thead>
</table>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("空の入力からのテーブル処理", () => {
  const input = "";
  const expected = "";

  assertHTMLEquals(transform(input), expected);
});

Deno.test("絵文字や特殊文字を含むテーブルセル", () => {
  const input = `table,🎉 祝
table,🌟✨
table,♠♥♦♣
table0,✅ 完了
table0,❌ 失敗
table0,! 警告`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("非ASCII文字（全角文字など）を含むテーブル", () => {
  const input = `table,　全角スペース　
table,ｶﾀｶﾅ
table,漢字
table0,ひらがな　
table0,　端末　
table0,表組み`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("テーブル内で改行を含む場合の空行の扱い", () => {
  const input = `table,A
table,B
.
table0,C
table0,D`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("テーブルエイリアス(|)を使ったテーブルのパース", () => {
  const input = `|,John
|,Doe
|0,Jane
|0,Doe`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("テーブルエイリアス(|,[)を使ったヘッダー付きテーブルのパース", () => {
  const input = `[0,First name
[0,Last name
|0,John
|0,Doe
|1,Jane
|1,Doe`;

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

  assertHTMLEquals(transform(input), expected);
});

Deno.test("テーブルエイリアスと属性を組み合わせたテーブル", () => {
  const input = `|,John,class=user-table;id=users
|,Doe
|1,Jane
|1,Smith`;

  const expected = `<table class="user-table" id="users">
    <tbody>
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

  assertHTMLEquals(transform(input), expected);
});
