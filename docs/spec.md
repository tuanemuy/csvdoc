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
- 2nd column onward: Contains the value (content) to be enclosed by the tag. For elements requiring multiple values like tables (table, th, td, etc.), values continue in the 3rd, 4th columns, and so on.
- Final column: Describes attributes to be applied to the HTML tag (optional).

### 2.3. Attribute Description

- The final column describes HTML tag attributes in the format `key1=value1;key2=value2`.
- Multiple attributes are separated by semicolons `;`.
- If an attribute value contains a semicolon or equals sign, it should be escaped with a backslash.

### 2.4. Handling Invalid Tags

- If a value specified in the 1st column is an invalid tag name (not defined in this specification or cannot be interpreted as an HTML tag), the row is treated as a `p` tag (paragraph) by default.

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

または

```tsv
h1	Heading
h2	Heading
h6	Heading
```

```html
<h1>Heading</h1>
<h2>Heading</h2>
<h6>Heading</h6>
```

### 3.2. Paragraphs (p)

- Tag: p
- Value (2nd column): The paragraph text.
- Consecutive `p` tags: Treated as line breaks using `<br />` within the same `<p>` tag.
- Paragraph separation: To start a new paragraph, insert an empty line in the CSV file.

#### Example 1

```csv
p,This is a paragraph.
```

または

```tsv
p	This is a paragraph.
```

```html
<p>This is a paragraph.</p>
```

#### Example 2

```csv
p,This is the first line of the paragraph.
p,This is the second line.
```

または

```tsv
p	This is the first line of the paragraph.
p	This is the second line.
```

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

p,This is the second paragraph.
```

または

```tsv
p	This is the first paragraph.

p	This is the second paragraph.
```

```html
<p>This is the first paragraph.</p>

<p>This is the second paragraph.</p>
```

### 3.3. Links (a)

- Tag: a
- Value (2nd column): The text to be displayed as the link.
- Attributes (final column): The `href` attribute is required. Other attributes such as `target`, `title`, etc. can be specified as needed.
- Treatment as a block: When an `a` tag is used as a standalone line, it is enclosed in a `<p>` tag.

#### Example 1

```csv
a,Reference material,href=https://example.com/reference;target=_blank
```

または

```tsv
a	Reference material	href=https://example.com/reference;target=_blank
```

```html
<p><a href="https://example.com/reference" target="_blank">Reference material</a></p>
```

### 3.4. Images (img)

- Tag: img
- Value (2nd column): Alternative text for the image (value for the `alt` attribute).
- Attributes (final column): The `src` attribute is required. Other attributes such as `width`, `height`, etc. can be specified as needed.
- `alt` attribute priority: If the `alt` attribute is also specified in the final column attributes, the value in the 2nd column takes precedence.
- Treatment as a block: When an `img` tag is used as a standalone line, it is enclosed in a `<p>` tag.

#### Example 1

```csv
img,car,src=car.jpg;alt=train
```

または

```tsv
img	car	src=car.jpg;alt=train
```

```html
<p><img src="car.jpg" alt="car" /></p>
```

### 3.5. Lists (ul, ol, li)

- Tags:
    - ul, li: Generate an unordered list (`<ul>`). Both tags are treated similarly and create list items (`<li>`).
    - ol: Generates an ordered list (`<ol>`) and creates list items (`<li>`).
- Value (2nd column): The content of the list item.
- Hierarchical structure: Adding dots `.` before the tag name expresses nested lists. The number of dots indicates the depth of the hierarchy.

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
ul,Item 3
```

```html
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
</ul>
```

#### Example 2

```csv
ol,Item 1
ol,Item 2
ol,Item 3
```

```html
<ol>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
</ol>
```

#### Example 3

```csv
li,Item 1
li,Item 2
li,Item 3
```

```html
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
</ul>
```

#### Example 4

```csv
ul,Item 1
li,Item 2
li,Item 3
```

```html
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
</ul>
```

#### Example 5

```csv
ul,Item 1
.ul,Item 1-1
.ul,Item 1-2
..ul,Item 1-2-1
ul,Item 2
```

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
.li,Item 1-1
.li,Item 1-2
..li,Item 1-2-1
li,Item 2
```

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
- Values (2nd column onward): The content of each cell.
- Column adjustment: If the number of values (columns) differs between rows (CSV rows), the generated HTML table will compensate by adding empty cells to match the row with the most columns in that table.

#### Aliases

|Alias|Tag|
|:--|:--|
|\||table|

#### Example 1

```csv
table,John,Doe
table,Jane,Doe
```

または

```tsv
table	John	Doe
table	Jane	Doe
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

#### Example 2

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

#### Example 3

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

#### Example 4

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

#### Example 5

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

#### Example 6

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

### 3.7. Code Blocks (code)

- Tag: code
- Value (2nd column): The code fragment.
- Consecutive `code` tags: Treated as line breaks within the same `<pre><code>...</code></pre>` block.
- Language specification: By specifying an attribute in the format `language=language_name` in the final column of any of the consecutive `code` lines, a class for syntax highlighting is added (e.g., `class="language-javascript"`). It doesn't need to be specified multiple times within the same block.

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

または

```tsv
code	"const message = ""Hello, world!"";"	language=javascript
code	"function hello() {"
code	"  console.log(message);"
code	"}"
```

```html
<pre><code class="language-javascript">const message = "Hello, world!";
  function hello() {
    console.log(message);
  }</code></pre>
```

### Example 1

```csv
p,This is **important** text that includes a `code` snippet. For details, refer to [this link](https://example.com).
```

または

```tsv
p	This is **important** text that includes a `code` snippet. For details, refer to [this link](https://example.com).
```

```html
<p>This is <strong>important</strong> text that includes a <code>code</code> snippet. For details, refer to <a href="https://example.com">this link</a>.</p>
```

#### Example 2

```csv
blockquote,This is a quote.
blockquote,This is a quote.
.blockquote,This is a quote.
```

または

```tsv
blockquote	This is a quote.
blockquote	This is a quote.
.blockquote	This is a quote.
```

```html
<blockquote>
    <p>This is a quote.</p>
    <p>This is a quote.</p>
    <blockquote>
        <p>This is a quote.</p>
    </blockquote>
</blockquote>
```

#### Example 1

```csv
hr
```

または

```tsv
hr
```

```html
<hr />
```
