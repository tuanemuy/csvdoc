# CSVDoc / TSVDoc

A lightweight markup notation using CSV (Comma-Separated Values) or TSV (Tab-Separated Values) file format.

## Specification

See [spec.md](https://github.com/tuanemuy/csvdoc/blob/main/docs/spec.md) for the full specification.

## CLI

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
import { parse } from "@tuanemuy/csvdoc";

const csvText = `#,Title
,description`;
const tsvText = `#\tTitle
\tdescription`;

const csvHtml = parse(csvText);
const tsvHtml = parse(tsvText, "tsv");

console.log(csvHtml); // <h1>Title</h1><p>description</p>
console.log(tsvHtml); // <h1>Title</h1><p>description</p>
```

## Examples

```csv
#,Syntax Examples

##,Headings

,"In CSVDoc, heading levels are represented by the number of `#` characters or HTML tags."

##,Lists

-,Item 1
-,Item 2
.-,Subitem

##,Tables

[,Name,Age,Occupation
|,Smith,28,Engineer
|,Johnson,34,Designer
```

```tsv
#	Syntax Examples

##	Headings

	In TSVDoc, heading levels are represented by the number of `#` characters or HTML tags.

##	Lists

-	Item 1
-	Item 2
.-	Subitem

##	Tables

[	Name	Age	Occupation
|	Smith	28	Engineer
|	Johnson	34	Designer
```

You can find more examples in [this directory](https://github.com/tuanemuy/csvdoc/blob/main/examples).
