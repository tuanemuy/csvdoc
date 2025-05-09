# CSVDoc / TSVDoc

A lightweight markup notation using CSV (Comma-Separated Values) or TSV (Tab-Separated Values) file format.

## Specification

See [spec.md](https://github.com/tuanemuy/csvdoc/blob/main/docs/spec.md) for the full specification.

## CLI

You can convert CSVDoc/TSVDoc to HTML using the `csvd` command.

### Installation

```bash
git clone https://github.com/tuanemuy/csvdoc.git
deno task install
```

### Usage

```bash
csvdoc doc.csv doc.html
csvdoc doc.tsv doc.html --type tsv
```

## JSR

### Installation

```bash
deno add jsr:@tuanemuy/csvdoc
```

### Usage

```ts
import { transform } from "@tuanemuy/csvdoc";

const csvText = `#,Title
,description`;
const tsvText = `#\tTitle
\tdescription`;

const csvHtml = transform(csvText);
const tsvHtml = transform(tsvText, "tsv");

console.log(csvHtml); // <h1>Title</h1><p>description</p>
console.log(tsvHtml); // <h1>Title</h1><p>description</p>
```

## Examples

### CSVDoc

```csv
#,Syntax Examples

##,Headings

,"In CSVDoc, heading levels are represented by the number of `#` characters or HTML tags."

##,Lists

-,Item 1
-,Item 2
_-,Subitem

##,Tables

[,Name
[,Age
[,Occupation
|0,Smith
|0,28
|0,Engineer
|1,Johnson
|1,34
|1,Designer
```

### TSVDoc

```tsv
#	Syntax Examples

##	Headings

	In TSVDoc, heading levels are represented by the number of `#` characters or HTML tags.

##	Lists

-	Item 1
-	Item 2
_-	Subitem

##	Tables

[	Name
[	Age
[	Occupation
|0	Smith
|0	28
|0	Engineer
|1	Johnson
|1	34
|1	Designer
```

You can find more examples in [this directory](https://github.com/tuanemuy/csvdoc/blob/main/examples).
