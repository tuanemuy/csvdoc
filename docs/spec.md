---
access: public
---

# Specification

## 1. Overview

This specification defines a lightweight markup notation using CSV (Comma-Separated Values) or TSV (Tab-Separated Values) file format. This notation is primarily intended for conversion to HTML (HyperText Markup Language). It aims to describe structured text data in CSV/TSV format and easily generate HTML content.

## 2. Basic Rules

### 2.1. File Format

- The file extension should be `.csv` or `.tsv`.
- For CSV files, it complies with basic CSV specifications (such as RFC 4180). Commas `,` and double quotes `"` within fields need to be properly escaped according to CSV rules.
- For TSV files, it uses tabs as field separators instead of commas. Tabs within fields need to be properly escaped.

### 2.2. Column Structure

Each row in the CSV/TSV file has the following column structure:

- 1st column: Specifies the HTML tag name (e.g., h1, p, ul, img).
- 2nd column: Contains the value (content) to be enclosed by the tag.
- 3rd column: Describes attributes to be applied to the HTML tag (optional).

Exceptions:

- If the length of the row is 0, it is treated as an empty line.
- If the 2nd column is empty, the value is treated as an empty string.

### 2.3. Attribute Description

- The 3rd column describes HTML tag attributes in the format `key1=value1;key2=value2`.
- Multiple attributes are separated by semicolons `;`.
- If an attribute value contains a semicolon or equals sign, it should be escaped with a backslash.

### 2.4. Handling Invalid Tags

- If a value specified in the 1st column is an invalid tag name (not defined in this specification or cannot be interpreted as an HTML tag), the row is treated as a `p` tag (paragraph) by default.

### 2.5 Empty Lines

- Empty lines are ignored.
- To explicitly specify an empty line, use `.` in the 1st column.

## 3. Block Elements

Block-level elements form the main structure of the document.

### 3.1. Headings (h1 - h6)

- Tags: h1, h2, h3, h4, h5, h6
- Value (2nd column): The heading text.

#### Aliases

|Alias|Tag|
|:--|:--|
|#|h1|
|##|h2|
|###|h3|
|####|h4|
|#####|h5|
|######|h6|

#### Example 1

```csv
h1,Heading
h2,Heading
h6,Heading
```

```tsv
h1	Heading
h2	Heading
h6	Heading
```

renders as:

```html
<h1>Heading</h1>
<h2>Heading</h2>
<h6>Heading</h6>
```

### 3.2. Paragraphs (p)

- Tag: p
- Value (2nd column): The paragraph text.
- Consecutive `p` tags: Treated as line breaks using `<br />` within the same `<p>` tag.
- Paragraph separation: To start a new paragraph, use `.` in the 1st column and follow it with a new `p` tag.

#### Example 1

```csv
p,This is a paragraph.
```

```tsv
p	This is a paragraph.
```

renders as:

```html
<p>This is a paragraph.</p>
```

#### Example 2

```csv
p,This is the first line of the paragraph.
p,This is the second line.
```

```tsv
p	This is the first line of the paragraph.
p	This is the second line.
```

renders as:

```html
<p>
    This is the first line of the paragraph.
    <br />
    This is the second line.
</p>
```

#### Example 3

```csv
p,This is the first paragraph.
.
p,This is the second paragraph.
```

```tsv
p	This is the first paragraph.
.
p	This is the second paragraph.
```

renders as:

```html
<p>This is the first paragraph.</p>

<p>This is the second paragraph.</p>
```

### 3.3. Links (a)

- Tag: a
- Value (2nd column): The text to be displayed as the link.
- Attributes (3rd column): The `href` attribute is required. Other attributes such as `target`, `title`, etc. can be specified as needed.
- Treatment as a block: When an `a` tag is used as a standalone line, it is enclosed in a `<p>` tag.

#### Example 1

```csv
a,Reference material,href=https://example.com/reference;target=_blank
```

```tsv
a	Reference material	href=https://example.com/reference;target=_blank
```

renders as:

```html
<p><a href="https://example.com/reference" target="_blank">Reference material</a></p>
```

### 3.4. Images (img)

- Tag: img
- Value (2nd column): Alternative text for the image (value for the `alt` attribute).
- Attributes (3rd column): The `src` attribute is required. Other attributes such as `width`, `height`, etc. can be specified as needed.
- `alt` attribute priority: If the `alt` attribute is also specified in the 3rd column attributes, the value in the 2nd column takes precedence.
- Treatment as a block: When an `img` tag is used as a standalone line, it is enclosed in a `<p>` tag.

#### Example 1

```csv
img,car,src=car.jpg;alt=train
```

```tsv
img	car	src=car.jpg;alt=train
```

renders as:

```html
<p><img src="car.jpg" alt="car" /></p>
```

### 3.5. Lists (ul, ol, li)

- Tags:
    - ul, li: Generate an unordered list (`<ul>`). Both tags are treated similarly and create list items (`<li>`).
    - ol: Generates an ordered list (`<ol>`) and creates list items (`<li>`).
- Value (2nd column): The content of the list item.
- Attributes (3rd column): Attributes are applied to the `ul` or `ol` tag.
- Hierarchical structure: Adding underscores `_` before the tag name expresses nested lists. The number of underscores indicates the depth of the hierarchy.
- Consecutive tags: If tag names are the same, they are treated as list items within the same list. If the tag names differ, they are treated as separate lists.

#### Aliases

|Alias|Tag|
|:--|:--|
|-|ul|
|*|ul|
|+|ul|
|1|ol|

#### Example 1

```csv
ul,Item 1
ul,Item 2
```

```tsv
ul	Item 1
ul	Item 2
```

renders as:

```html
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
</ul>
```

#### Example 2

```csv
ol,Item 1
ol,Item 2
```

renders as:

```html
<ol>
    <li>Item 1</li>
    <li>Item 2</li>
</ol>
```

#### Example 3

```csv
li,Item 1
li,Item 2
```

renders as:

```html
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
</ul>
```

#### Example 4

```csv
ul,Item 1
li,Item 2
li,Item 3
```

renders as:

```html
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
</ul>
<ul>
    <li>Item 3</li>
</ul>
```

#### Example 5

```csv
ul,Item 1
_ul,Item 1-1
_ul,Item 1-2
__ul,Item 1-2-1
ul,Item 2
```

renders as:

```html
<ul>
    <li>
        Item 1
        <ul>
            <li>Item 1-1</li>
            <li>Item 1-2
                <ul>
                    <li>Item 1-2-1</li>
                </ul>
            </li>
        </ul>
    </li>
    <li>Item 2</li>
</ul>
```

#### Example 6

```csv
li,Item 1
_li,Item 1-1
_li,Item 1-2
__li,Item 1-2-1
li,Item 2
```

renders as:

```html
<ul>
    <li>
        Item 1
        <ul>
            <li>Item 1-1</li>
            <li>Item 1-2
                <ul>
                    <li>Item 1-2-1</li>
                </ul>
            </li>
        </ul>
    </li>
    <li>Item 2</li>
</ul>
```

### 3.6. Tables (table, thead, tbody, th, td)

- Tags:
    - table, tbody, td: These are treated as generating table body (`<tbody>`), rows (`<tr>`), and data cells (`<td>`). Consecutive occurrences of these tags form rows within the same `<tbody>`.
    - th: Generates rows (`<tr>`) and table header cells (`<th>`) within the table body (`<tbody>`).
    - thead: Generates rows (`<tr>`) and header cells (`<th>`) within the table header (`<thead>`).
- Value (2nd column): The content of the cell.
- Column adjustment: You can add suffix numbers to tag names to group elements into rows. Consecutive tags with the same name and the same suffix are treated as belonging to the same row. For example, a sequence of `td0` tags will form a single row. Following the same rule, consecutive `table1` tags will form one row, and consecutive `table2` tags will form a different row. The suffix number is optional; if omitted, consecutive tags (with no suffix) will also form a single row.
- Attributes (3rd column): Attributes are applied to the `table` tag.

#### Aliases

|Alias|Tag|
|:--|:--|
|\||table|
|[|thead|

#### Example 1

```csv
table0,John
table0,Doe
table1,Jane
table1,Doe
```

```tsv
table0	John
table0	Doe
table1	Jane
table1	Doe
```

renders as:

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

#### Example 3

```csv
tbody0,John
tbody0,Doe
tbody1,Jane
tbody1,Doe
```

renders as:

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

#### Example 4

```csv
th,First name
th,Last name
td0,John
td0,Doe
td1,Jane
td1,Doe
```

renders as:

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

#### Example 5

```csv
thead,First name
thead,Last name
tbody0,John
tbody0,Doe
tbody1,Jane
tbody1,Doe
```

```csv
[,First name
[,Last name
|0,John
|0,Doe
|1,Jane
|1,Doe
```

renders as:

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

#### Example 6

```csv
thead,First name
thead,Last name
td0,John
td0,Doe
td,Jane
td,Doe
```

renders as:

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

### 3.7. Code Blocks (code)

- Tag: code
- Value (2nd column): The code fragment.
- Consecutive `code` tags: Treated as line breaks within the same `<pre><code>...</code></pre>` block.
- Language specification: By specifying an attribute in the format `language=language_name` in the 3rd column of any of the consecutive `code` lines, a class for syntax highlighting is added (e.g., `class="language-javascript"`). It doesn't need to be specified multiple times within the same block.

#### Aliases

|Alias|Tag|
|:--|:--|
|```|code|

#### Example 1

```csv
code,"const message = ""Hello, world!"";",language=javascript
code,"function hello() {"
code,"  console.log(message);"
code,"}"
```

```tsv
code	const message = "Hello, world!";	language=javascript
code	function hello() {
code	  console.log(message);
code	}
```

renders as:

```html
<pre><code class="language-javascript">const message = "Hello, world!";
  function hello() {
    console.log(message);
  }</code></pre>
```

### 3.8. Blockquotes (blockquote)

- Tag: blockquote
- Value (2nd column): The content of the blockquote.
- Consecutive `blockquote` tags: Treated as new paragraphs within the same `<blockquote>` block.
- Nested blockquotes: By prefixing the tag with an underscore `_`, you can create nested blockquotes. The number of underscores indicates the depth of the hierarchy.

#### Example 1

```csv
blockquote,This is a quote.
blockquote,This is a quote.
_blockquote,This is a quote.
```

```tsv
blockquote	This is a quote.
blockquote	This is a quote.
_blockquote	This is a quote.
```

renders as:

```html
<blockquote>
    <p>This is a quote.</p>
    <p>This is a quote.</p>
    <blockquote>
        <p>This is a quote.</p>
    </blockquote>
</blockquote>
```

### 3.9. Horizontal Rules (hr)

- Tag: hr
- Value (2nd column): Not applicable.

#### Example 1

```csv
hr
```

renders as:

```html
<hr />
```

## 4. Inline Elements

The values of block elements (mainly the content in the 2nd column) are parsed into inline elements during conversion to HTML. This parsing process is recommended to comply with the [GitHub Flavored Markdown (GFM) Spec for inline elements](https://github.github.com/gfm/#inlines).

This allows for the use of Markdown-like syntax within the values, such as:

- Emphasis: `*italic*` or `_italic_` ( `<em>` ), `**bold**` or `__bold__` ( `<strong>` )
- Code span: Text enclosed in backticks ( `<code>` )
- Strikethrough: `~~strikethrough~~` ( `<del>` )
- Inline link: `[link text](URL "title")` ( `<a>` )
- Inline image: `![alt text](image URL "title")` ( `<img>` )

#### Example 1

```csv
p,This is **important** text that includes a `code` snippet. For details, refer to [this link](https://example.com).
```

```tsv
p	This is **important** text that includes a `code` snippet. For details, refer to [this link](https://example.com).
```

renders as:

```html
<p>This is <strong>important</strong> text that includes a <code>code</code> snippet. For details, refer to <a href="https://example.com">this link</a>.</p>
```
