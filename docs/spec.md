# 仕様書

## 1. 概要

本仕様書は、CSV（Comma-Separated Values）ファイル形式を利用した軽量マークアップ記法について定義します。この記法は、主にHTML（HyperText Markup Language）への変換を目的としています。構造化されたテキストデータをCSV形式で記述し、容易にHTMLコンテンツを生成することを目指します。

## 2. 基本ルール

### 2.1. ファイル形式

- ファイルの拡張子は `.csv` とします。
- 文字コードはUTF-8を推奨します。
- CSVの基本的な仕様（RFC 4180等）に準拠します。フィールド内のカンマ `,` やダブルクォーテーション `"` は、CSVのルールに従って適切にエスケープする必要があります。

### 2.2. カラム構造

CSVファイルの各行は、以下のカラム構造を持ちます。

- 1列目: HTMLタグ名（例: h1, p, ul, img）を記述します。
- 2列目以降: タグによって囲まれる値（コンテンツ）を記述します。テーブル（table, th, td など）のように複数の値を必要とする場合は、3列目、4列目...と続けます。
- 最終列: HTMLタグに付与する属性を記述します（任意）。

### 2.3. 属性の記述

- 最終列には、HTMLタグの属性を `キー1=値1;キー2=値2` の形式で記述します。
- 複数の属性はセミコロン `;` で区切ります。
- 属性の値にセミコロンまたは等号が含まれる場合は、バックスラッシュによってエスケープします。

### 2.4. 無効なタグの扱い

- 1列目に指定された値が、本仕様で定義されていない、あるいはHTMLタグとして解釈できない無効なタグ名であった場合、その行はデフォルトで `p` タグ（段落）として扱われます。

## 3. ブロック要素

ブロックレベル要素は、文書の主要な構造を形成します。

### 3.1. 見出し（h1 - h6）

- タグ: h1, h2, h3, h4, h5, h6
- 値（2列目）: 見出しのテキストです。

#### 例1

```csv
h1,見出し
h2,見出し
h6,見出し
```

```html
<h1>見出し</h1>
<h2>見出し</h2>
<h6>見出し</h6>
```

### 3.2. 段落（p）

- タグ: p
- 値（2列目）: 段落のテキストです。
- 連続する `p` タグ: 同一 `<p>` タグ内で `<br />` による改行として扱われます。
- 段落の分割: 新しい段落を開始するには、CSVファイル内に空行を挿入します。

#### 例1

```csv
p,段落です。
```

```html
<p>段落です。</p>
```

#### 例2

```csv
p,段落の最初の行です。
p,2行目です。
```

```html
<p>
    段落の最初の行です。
    <br />
    2行目です。
</p>
```

#### 例3

```csv
p,最初の段落です。

p,2つ目の段落です。
```

```html
<p>最初の段落です。</p>

<p>2つ目の段落です。</p>
```

### 3.3. リンク（a）

- タグ: a
- 値（2列目）: リンクとして表示されるテキストです。
- 属性（最終列）: `href` 属性は必須です。その他 `target` , `title` など任意の属性を指定可能です。
- ブロックとしての扱い: 単独行で `a` タグが使用された場合、 `<p>` タグで囲まれます。

#### 例1

```csv
a,参考資料,href=https://example.com/reference;target=_blank
```

```html
<p><a href="https://example.com/reference" target="_blank">参考資料</a></p>
```

### 3.4. 画像（img）

- タグ: img
- 値（2列目）: 画像の代替テキスト（ `alt` 属性の値）です。
- 属性（最終列）: `src` 属性は必須です。その他 `width` , `height` など任意の属性を指定可能です。
- `alt` 属性の優先度: 最終列の属性にも `alt` が指定されている場合、2列目の値が優先されます。
- ブロックとしての扱い: 単独行で `img` タグが使用された場合、 `<p>` タグで囲まれます。

#### 例1

```csv
img,car,src=car.jpg;alt=train
```

```html
<p><img src="car.jpg" alt="car" /></p>
```

### 3.5. リスト（ul, ol, li）

- タグ:
    - ul, li: 順序なしリスト（ `<ul>` ）を生成します。どちらのタグも同様に扱われ、リスト項目（ `<li>` ）を作成します。
    - ol: 順序付きリスト（ `<ol>` ）を生成し、リスト項目（ `<li>` ）を作成します。
- 値（2列目）: リスト項目の内容です。
- 階層構造: タグ名の前に `>` を付与することでリストのネスト（入れ子）を表現します。 `>` の数で階層の深さを示します。

#### 例1

```csv
ul,項目1
ul,項目2
ul,項目3
```

```html
<ul>
    <li>項目1</li>
    <li>項目2</li>
    <li>項目3</li>
</ul>
```

#### 例2

```csv
ol,項目1
ol,項目2
ol,項目3
```

```html
<ol>
    <li>項目1</li>
    <li>項目2</li>
    <li>項目3</li>
</ol>
```

#### 例3

```csv
li,項目1
li,項目2
li,項目3
```

```html
<ul>
    <li>項目1</li>
    <li>項目2</li>
    <li>項目3</li>
</ul>
```

#### 例4

```csv
ul,項目1
li,項目2
li,項目3
```

```html
<ul>
    <li>項目1</li>
    <li>項目2</li>
    <li>項目3</li>
</ul>
```

#### 例5

```csv
ul,項目1
>ul,項目1-1
>ul,項目1-2
>>ul,項目1-2-1
ul,項目2
```

```html
<ul>
    <li>
        項目1
        <ul>
            <li>項目1-1</li>
            <li>項目1-2
                <ul>
                    <li>項目1-2-1</li>
                </ul>
            </li>
        </ul>
    </li>
    <li>項目2</li>
</ul>
```

#### 例6

```csv
li,項目1
>li,項目1-1
>li,項目1-2
>>li,項目1-2-1
li,項目2
```

```html
<ul>
    <li>
        項目1
        <ul>
            <li>項目1-1</li>
            <li>項目1-2
                <ul>
                    <li>項目1-2-1</li>
                </ul>
            </li>
        </ul>
    </li>
    <li>項目2</li>
</ul>
```

### 3.6. テーブル（table, thead, tbody, th, td）

- タグ:
    - table, tbody, td: これらは同様にテーブル本体（ `<tbody>` ）内の行（ `<tr>` ）とデータセル（ `<td>` ）を生成するものとして扱われます。連続するこれらのタグは、同じ `<tbody>` 内の行を構成します。
    - th: テーブル本体（ `<tbody>` ）内の行（ `<tr>` ）とテーブルヘッダーセル（ `<th>` ）を生成します。
    - thead: テーブルヘッダー（ `<thead>` ）内の行（ `<tr>` ）とヘッダーセル（ `<th>` ）を生成します。
- 値（2列目以降）: 各セルの内容です。
- カラム数の調整: 各行（CSVの行）で値の数（列数）が異なる場合、生成されるHTMLテーブルでは、そのテーブル内で最も列数が多い行に合わせて、不足しているセルは空のセルとして補完されます。

#### 例1

```csv
table,John,Doe
table,Jane,Doe
```

```html
<table>
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
</table>
```

#### 例2

```csv
tbody,John,Doe
tbody,Jane,Doe
```

```html
<table>
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
</table>
```

#### 例3

```csv
td,John,Doe
td,Jane,Doe
```

```html
<table>
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
</table>
```

#### 例4

```csv
th,First name,Last name
td,John,Doe
td,Jane,Doe
```

```html
<table>
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
</table>
```

#### 例5

```csv
thead,First name,Last name
tbody,John,Doe
tbody,Jane,Doe
```

```html
<table>
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
</table>
```

#### 例6

```csv
thead,First name,Last name
td,John,Doe
td,Jane,Doe
```

```html
<table>
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
</table>
```

### 3.7. コードブロック（code）

- タグ: code
- 値（2列目）: コードの断片です。
- 連続する `code` タグ: 同一の `<pre><code>...</code></pre>` ブロック内の改行として扱われます。
- 言語指定: 連続する `code` 行のいずれかの最終列に `language=言語名` 形式で属性を指定することで、シンタックスハイライト用のクラスが付与されます（例: `class="language-javascript"` )。同一ブロック内で複数回指定する必要はありません。

#### 例1

```csv
code,"const message = ""Hello, world!"";",language=javascript
code,"funciton hello() {"
code,"  console.log(message);"
code,"}"
```

```html
<pre><code class="language-javascript">const message = "Hello, world!";
  function hello() {
    console.log(message);
  }</code></pre>
```

### 3.8. 引用（blockquote）

- タグ: blockquote
- 値（2列目）: 引用文です。
- 連続する `blockquote` タグ: 同一の `<blockquote>` 要素内で、それぞれが `<p>` タグで囲まれた段落として扱われます。`<br />` による改行は挿入されません。
- 階層構造: タグ名の前に `>` を付与することで引用のネストを表現します。

#### 例1

```csv
blockquote,引用です。
blockquote,引用です。
>blockquote,引用です。
```

```html
<blockquote>
    <p>引用です。</p>
    <p>引用です。</p>
    <blockquote>
        <p>引用です。</p>
    </blockquote>
</blockquote>
```

### 3.9. 水平線（hr）

- タグ: hr
- 値/属性: 不要です。
- 出力: `<hr />` タグが生成されます。

#### 例1

```csv
hr
```

```html
<hr />
```

## 4. インライン要素

ブロック要素の値（主に2列目の内容）は、HTMLへの変換時に二次的にパースされ、インライン要素が解釈されます。このパース処理は、 [GitHub Flavored Markdown（GFM）Spec のインライン要素のルール](https://github.github.com/gfm/#inlines) に準拠することを推奨します。

これにより、以下のようなMarkdownライクな記法が値の中で利用可能になります。

- 強調: `*イタリック*` または `_イタリック_` （ `<em>` ）、 `**太字**` または `__太字__` （ `<strong>` ）
- コードスパン: バックティックで囲われた部分（ `<code>` ）
- 打ち消し線: `~~打ち消し~~` （ `<del>` ）
- インラインリンク: `[リンクテキスト](URL "タイトル")` （ `<a>` ）
- インライン画像: `![代替テキスト](画像URL "タイトル")` （ `<img>` ）

### 例1

```csv
p,これは **重要** なテキストで、 `code` スニペットを含みます。詳細は [こちら](https://example.com）を参照してください。
```

```html
<p>これは<strong>重要</strong> なテキストで、 <code>code</code> スニペットを含みます。詳細は <a href="https://example.com"\こちら</a> を参照してください。</p>
```

注意: ブロックレベルのリンク（a）や画像（img）タグと、インラインのリンク・画像記法の両方が存在します。ブロックレベルはCSVの行として定義し、インラインは他の要素の値の中でMarkdown形式で記述します。

## 5. 実装に関する注意点

- CSVパーサーは、ダブルクォーテーションで囲まれたフィールド内のカンマや改行を正しく処理できる必要があります。
- ネスト構造（リスト、引用）の深さに制限を設けるか、再帰的な処理を適切に行う必要があります。
- テーブルのカラム数不一致の扱いや、属性値のエスケープなど、細かな挙動は実装に依存する可能性があります。
