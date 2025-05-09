import { transform } from "../mod.ts";
import { assertHTMLEquals } from "./utils.ts";

Deno.test("順序なしリスト(ul)のパース", () => {
  const input = `ul,項目1
ul,項目2
ul,項目3`;

  const expected = `<ul>
    <li>項目1</li>
    <li>項目2</li>
    <li>項目3</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("順序付きリスト(ol)のパース", () => {
  const input = `ol,項目1
ol,項目2
ol,項目3`;

  const expected = `<ol>
    <li>項目1</li>
    <li>項目2</li>
    <li>項目3</li>
</ol>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("liタグを使用した順序なしリストのパース", () => {
  const input = `li,項目1
li,項目2
li,項目3`;

  const expected = `<ul>
    <li>項目1</li>
    <li>項目2</li>
    <li>項目3</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("混合タグ(ul/li)を使用したリストのパース", () => {
  const input = `ul,項目1
li,項目2
li,項目3`;

  const expected = `<ul>
    <li>項目1</li>
    <li>項目2</li>
    <li>項目3</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("混合タグ(ul/ol)を使用したリストのパース", () => {
  const input = `ul,項目1
ol,項目2
ol,項目3`;

  const expected = `<ul>
    <li>項目1</li>
</ul>
<ol>
    <li>項目2</li>
    <li>項目3</li>
</ol>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("ネスト(入れ子)構造を持つリストのパース", () => {
  const input = `ul,項目1
_ul,項目1-1
_ul,項目1-2
__ul,項目1-2-1
ul,項目2`;

  const expected = `<ul>
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
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("liタグを使用したネスト構造を持つリストのパース", () => {
  const input = `li,項目1
_li,項目1-1
_li,項目1-2
__li,項目1-2-1
li,項目2`;

  const expected = `<ul>
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
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("リスト要素に属性を付与", () => {
  const input = `ul,項目1,class=feature-list
ol,項目2,id=item2
ol,項目3,data-value=3`;

  const expected = `<ul class="feature-list">
    <li>項目1</li>
</ul>
<ol id="item2" data-value="3">
    <li>項目2</li>
    <li>項目3</li>
</ol>`;

  assertHTMLEquals(transform(input), expected);
});

// エッジケースと異常系のテスト追加

Deno.test("空のリスト項目を含むリストのパース", () => {
  const input = `ul,
ul,項目2
ul,`;

  const expected = `<ul>
    <li></li>
    <li>項目2</li>
    <li></li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("HTML特殊文字を含むリスト項目のパース", () => {
  const input = `ul,<script>alert('XSS')</script>
ul,a & b
ul,1 < 2 > 0`;

  const expected = `<ul>
    <li><script>alert('XSS')</script></li>
    <li>a & b</li>
    <li>1 < 2 > 0</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("順序付きリストと順序なしリストの混在", () => {
  const input = `ol,項目1
ul,項目2
li,項目3
ol,項目4`;

  // 最初のol要素が優先され、すべての項目がol内に生成される
  const expected = `<ol>
    <li>項目1</li>
</ol>
<ul>
    <li>項目2</li>
    <li>項目3</li>
</ul>
<ol>
    <li>項目4</li>
</ol>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("途中でリスト種類が変わる複合リスト（ol -> ul）", () => {
  const input = `ol,項目1
ol,項目2
ul,項目3
ul,項目4`;

  // olで始まったリストはolのまま維持される
  const expected = `<ol>
    <li>項目1</li>
    <li>項目2</li>
</ol>
<ul>
    <li>項目3</li>
    <li>項目4</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("不規則なインデント構造を持つリスト", () => {
  const input = `ul,レベル1
_ul,レベル2（自動補完用）
__ul,レベル3
ul,レベル1-2`;

  const expected = `<ul>
    <li>
        レベル1
        <ul>
            <li>
                レベル2（自動補完用）
                <ul>
                    <li>レベル3</li>
                </ul>
            </li>
        </ul>
    </li>
    <li>レベル1-2</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("入れ子が深すぎるリスト構造", () => {
  const input = `ul,レベル1
_ul,レベル2
__ul,レベル3
___ul,レベル4
____ul,レベル5
_____ul,レベル6`;

  const expected = `<ul>
    <li>
        レベル1
        <ul>
            <li>
                レベル2
                <ul>
                    <li>
                        レベル3
                        <ul>
                            <li>
                                レベル4
                                <ul>
                                    <li>
                                        レベル5
                                        <ul>
                                            <li>レベル6</li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ul>
            </li>
        </ul>
    </li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("複数の属性を持つリスト項目", () => {
  const input = `ul,項目1,class=important;id=first;data-order=1
ul,項目2,class=normal hidden
ul,項目3,style=color:red`;

  const expected = `<ul class="normal hidden" data-order="1" id="first" style="color:red">
    <li>項目1</li>
    <li>項目2</li>
    <li>項目3</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("ネスト構造において子リストに属性を適用", () => {
  const input = `ul,親項目
_ul,子項目1,class=child-list
_ul,子項目2`;

  const expected = `<ul>
    <li>
        親項目
        <ul class="child-list">
            <li>子項目1</li>
            <li>子項目2</li>
        </ul>
    </li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("複数レベルのネストで異なるリスト種類を使用", () => {
  const input = `ul,順序なしリスト項目
_ol,順序付きリスト項目1
_ol,順序付きリスト項目2
__ul,順序なしリスト項目2-1`;

  // 仕様変更に合わせて期待値を修正: ネストされたリスト内のタグの変更でも一つの構造として扱う
  const expected = `<ul>
    <li>
        順序なしリスト項目
        <ol>
            <li>順序付きリスト項目1</li>
            <li>順序付きリスト項目2
                <ul>
                    <li>順序なしリスト項目2-1</li>
                </ul>
            </li>
        </ol>
    </li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("複数行にまたがる値を持つリスト項目", () => {
  const input = `ul,"これは
複数行にまたがる
リスト項目です"
ul,通常の項目`;

  const expected = `<ul>
    <li>これは
複数行にまたがる
リスト項目です</li>
    <li>通常の項目</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("リスト内でカンマを含む項目", () => {
  const input = `ul,"項目1, カンマを含む"
ul,"a,b,c"`;

  const expected = `<ul>
    <li>項目1, カンマを含む</li>
    <li>a,b,c</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("リスト処理後に他の要素が続く場合", () => {
  const input = `ul,リスト項目1
ul,リスト項目2
p,段落テキスト`;

  const expected = `<ul>
    <li>リスト項目1</li>
    <li>リスト項目2</li>
</ul>
<p>段落テキスト</p>`;

  assertHTMLEquals(transform(input), expected);
});

// 追加のエッジケースと異常系テスト

Deno.test("非常に長いリスト項目のパース", () => {
  // 1000文字の長いテキスト
  const longText = "a".repeat(1000);
  const input = `ul,${longText}`;

  const expected = `<ul>
    <li>${longText}</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("空の入力からのリスト解析", () => {
  const input = "";
  const expected = "";

  assertHTMLEquals(transform(input), expected);
});

Deno.test("空行を含むリスト処理", () => {
  const input = `ul,項目1
.
ul,項目2`;

  // 空行がある場合は別々のulとして処理される
  const expected = `<ul>
    <li>項目1</li>
</ul>
<ul>
    <li>項目2</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("深いネストからの階層戻り", () => {
  const input = `ul,レベル1
_ul,レベル2
__ul,レベル3
___ul,レベル4
_ul,レベル2に戻る`;

  const expected = `<ul>
    <li>
        レベル1
        <ul>
            <li>
                レベル2
                <ul>
                    <li>
                        レベル3
                        <ul>
                            <li>レベル4</li>
                        </ul>
                    </li>
                </ul>
            </li>
            <li>レベル2に戻る</li>
        </ul>
    </li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("数値のみの項目値", () => {
  const input = `ol,1
ol,2
ol,3`;

  // 数値のみの項目でも正しくパースされる
  const expected = `<ol>
    <li>1</li>
    <li>2</li>
    <li>3</li>
</ol>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("日本語とマルチバイト文字を含むリスト項目", () => {
  const input = `ul,日本語項目
ul,マルチバイト：😊🌟🎉
ul,特殊記号：♠♥♦♣`;

  const expected = `<ul>
    <li>日本語項目</li>
    <li>マルチバイト：😊🌟🎉</li>
    <li>特殊記号：♠♥♦♣</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("重複した属性を持つリスト項目", () => {
  const input = `ul,項目1,class=first;class=second
ul,項目2,id=one;id=two`;

  // 後の属性が優先される
  const expected = `<ul class="second" id="two">
    <li>項目1</li>
    <li>項目2</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

// 最終的なエッジケースとインライン要素処理のテスト

Deno.test("リスト内のインライン記法の処理", () => {
  const input = `ul,**太字テキスト**
ul,*イタリック* と _イタリック_
ul,\`インラインコード\`
ul,[リンク](https://example.com)
ul,![画像](image.jpg)`;

  const expected = `<ul>
    <li><strong>太字テキスト</strong></li>
    <li><em>イタリック</em> と <em>イタリック</em></li>
    <li><code>インラインコード</code></li>
    <li><a href="https://example.com">リンク</a></li>
    <li><img src="image.jpg" alt="画像" /></li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("ul/olタグの後に空のリスト項目が続く場合", () => {
  const input = `ul,
ul,
ul,項目`;

  const expected = `<ul>
    <li></li>
    <li></li>
    <li>項目</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("不完全なネストでの深さの変更", () => {
  const input = `ul,レベル1
_ul,レベル2
__ul,レベル3
_ul,レベル2に戻る`;

  const expected = `<ul>
    <li>
        レベル1
        <ul>
            <li>
                レベル2
                <ul>
                    <li>レベル3</li>
                </ul>
            </li>
            <li>レベル2に戻る</li>
        </ul>
    </li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("リストのエイリアス(-、*、+)を使った順序なしリストのパース", () => {
  const input = `-,ハイフンで項目1
*,アスタリスクで項目2
+,プラスで項目3`;

  const expected = `<ul>
    <li>ハイフンで項目1</li>
    <li>アスタリスクで項目2</li>
    <li>プラスで項目3</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("リストのエイリアス(1)を使った順序付きリストのパース", () => {
  const input = `1,最初の項目
1,2番目の項目
1,3番目の項目`;

  const expected = `<ol>
    <li>最初の項目</li>
    <li>2番目の項目</li>
    <li>3番目の項目</li>
</ol>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("エイリアスとネスト構造を組み合わせたリスト", () => {
  const input = `-,レベル1
_-,レベル2（ハイフン）
_+,レベル2（プラス）
__*,レベル3（アスタリスク）
_1,順序付きリスト項目`;

  const expected = `<ul>
    <li>
        レベル1
        <ul>
            <li>レベル2（ハイフン）</li>
            <li>レベル2（プラス）
                <ul>
                    <li>レベル3（アスタリスク）</li>
                </ul>
            </li>
        </ul>
        <ol>
            <li>順序付きリスト項目</li>
        </ol>
    </li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("エイリアスとタグを混在させたリスト", () => {
  const input = `ul,通常タグの項目
-,ハイフンエイリアスの項目
li,liタグの項目
*,アスタリスクエイリアスの項目`;

  const expected = `<ul>
    <li>通常タグの項目</li>
    <li>ハイフンエイリアスの項目</li>
    <li>liタグの項目</li>
    <li>アスタリスクエイリアスの項目</li>
</ul>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("エイリアスと属性を組み合わせたリスト", () => {
  const input = `-,ハイフンの項目,class=dash-item
*,アスタリスクの項目,id=star-item
1,番号付き項目,style=color:red`;

  // 現在の実装では、連続するリスト要素は同じリストとして扱われる
  const expected = `<ul class="dash-item" id="star-item">
    <li>ハイフンの項目</li>
    <li>アスタリスクの項目</li>
</ul>
<ol style="color:red">
    <li>番号付き項目</li>
</ol>`;

  assertHTMLEquals(transform(input), expected);
});

Deno.test("リストエイリアスの分離", () => {
  const input = `-,ハイフンの項目
.
1,順序付きリスト項目`;

  // 空行で区切られた場合は別々のリストになる
  const expected = `<ul>
    <li>ハイフンの項目</li>
</ul>
<ol>
    <li>順序付きリスト項目</li>
</ol>`;

  assertHTMLEquals(transform(input), expected);
});
