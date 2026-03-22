# 実習課題 HTMLスタイルガイド

## 共通CSS設定

```css
font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif;
color: #525252;        /* 問題文 */
color: #333;           /* 解説 */
line-height: 1.6;      /* 問題文 */
line-height: 1.8;      /* 解説 */
max-width: 800px;
```

## 問題文で使うHTML要素

### 見出し

```html
<!-- 課題タイトル -->
<h1 style="font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px;">
  課題タイトル
</h1>

<!-- セクション見出し（目的、課題、手順など） -->
<h3 style="font-size: 18px; margin-top: 30px;">セクション見出し</h3>

<!-- サブ見出し（ステップ1, 2, 3など） -->
<h4 style="font-size: 16px; margin-top: 20px;">サブ見出し</h4>

<!-- セクション区切り -->
<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
```

### ボックス

```html
<!-- グレーボックス（題材・依頼文・コード表示） -->
<div style="background: #f5f5f5; border-left: 4px solid #666; padding: 15px; margin: 15px 0;">
  <p>コンテンツ</p>
  <!-- コード表示を含む場合 -->
  <div style="background: #fff; padding: 10px; border-radius: 3px; white-space: pre-wrap;">
    コピー用テキスト
  </div>
</div>

<!-- 青ボックス（ポイント・成果物・回答欄） -->
<div style="background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <p>ポイント・成果物</p>
</div>

<!-- 黄ボックス（注意点） -->
<div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0;">
  <p>注意点</p>
</div>
```

## 解説で使うHTML要素

### ねらい箱

```html
<div class="purpose-box" style="background: #e8f4f8; border-left: 4px solid #3498db; border-radius: 0 8px 8px 0; padding: 15px; margin: 15px 0;">
  <p>課題のねらい・まとめ</p>
</div>
```

### 回答例箱

```html
<div class="example-box" style="background: #f0f7e6; border-left: 4px solid #27ae60; padding: 15px; margin: 15px 0; white-space: pre-wrap;">
  プロンプト例・AI出力例
</div>
```

### 要素分解表

```html
<div class="four-element-box" style="background: #f5f5f5; border-left: 4px solid #666; padding: 15px; margin: 15px 0;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <th style="background: #f8f9fa; padding: 8px; border: 1px solid #ddd; text-align: left;">観点</th>
      <th style="background: #f8f9fa; padding: 8px; border: 1px solid #ddd; text-align: left;">内容</th>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">観点1</td>
      <td style="padding: 8px; border: 1px solid #ddd;">説明</td>
    </tr>
  </table>
</div>
```

### ポイント表

```html
<table class="check-table" style="width: 100%; border-collapse: collapse; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 15px 0;">
  <tr>
    <th style="background: #f8f9fa; padding: 10px; border: 1px solid #ddd; text-align: left;">チェック項目</th>
    <th style="background: #f8f9fa; padding: 10px; border: 1px solid #ddd; text-align: left;">ポイント</th>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd;">項目1</td>
    <td style="padding: 10px; border: 1px solid #ddd;">説明</td>
  </tr>
</table>
```

### NG例表

```html
<table class="ng-table" style="width: 100%; border-collapse: collapse; margin: 15px 0;">
  <tr>
    <th style="background: #ffeaea; color: #c0392b; padding: 10px; border: 1px solid #ddd;">NG例</th>
    <th style="background: #f8f9fa; padding: 10px; border: 1px solid #ddd;">なぜNGか</th>
  </tr>
  <tr>
    <td style="background: #fff8f8; padding: 10px; border: 1px solid #ddd;">例</td>
    <td style="padding: 10px; border: 1px solid #ddd;">理由</td>
  </tr>
</table>
```

### 補足箱

```html
<div class="supplement-box" style="background: #fff9e6; border-left: 4px solid #f39c12; padding: 15px; margin: 15px 0;">
  <p>FAQ・補足情報</p>
</div>
```

## 解説の構成順序（標準）

1. `<h1>解説と回答例</h1>`
2. `<h3>この課題のねらい</h3>` → `.purpose-box`
3. `<hr>`
4. `<h3>回答例</h3>` → `.example-box`
5. `<hr>`
6. `<h3>解説</h3>` → `.check-table` または要素分解表
7. `<hr>`
8. `<h3>よくあるNG例</h3>` → `.ng-table`
9. `<hr>`
10. `<h3>よくある質問</h3>` → `.supplement-box`（任意）
11. `<hr>`
12. まとめ → `.purpose-box`
