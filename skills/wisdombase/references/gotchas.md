# WisdomBase 重要な注意事項（Gotchas）

## 1. 試験設定のエンドポイントは `/exams/{lecture_id}`

- `/exams/{exam_id}` ではない
- フォームの `action` 属性が `/exams/{lecture_id}` になっている
- 間違えると **"Can not find the exam"** エラーになる

## 2. exam_section_id の取得方法

- `/exam_sections/{id}` のURLパターンではHTMLに含まれない場合がある
- `data-section-id` 属性から取得する:
  ```javascript
  lectureHtml.match(/data-section-id=['"](\d+)['"]/)
  ```

## 3. Docタイプ API での X-Requested-With

- `X-Requested-With: 'XMLHttpRequest'` ヘッダーを付けると、リダイレクト先でXHR用のレスポンスが返り404になることがある
- Docタイプは `X-CSRF-Token` ヘッダーだけ付けて、`X-Requested-With` は**付けない**のが安全

## 4. change_order API

- `_method=patch` が**必須**（ないと404）
- `lecture[new_order]=N` で絶対位置を指定（1始まり）

## 5. TUSアップロードの412エラー

- 128MB超のファイルで発生しやすい
- 同じスクリプトを再実行してそのファイルだけ選択すれば解消することが多い

## 6. grade_id の正規表現取得

- grade_idは `<input type="hidden">` に格納
- **HTMLではvalue属性がname属性より先に出力される**:
  ```html
  <input type="hidden" value="112885" name="exam[exam_grades_attributes][0][id]" />
  ```
- 旧パターン（**マッチしない**）:
  ```javascript
  /name="exam\[...\]\[id\]"[^>]*value="(\d+)"/g  // name→value順を前提 → NG
  ```
- 推奨パターン（value先行）:
  ```javascript
  /value="(\d+)"[^>]*name="exam\[exam_grades_attributes\]\[(\d+)\]\[id\]"/g
  // m[1]=grade_id, m[2]=index（name先行パターンと順序が逆なので注意）
  ```
- grade_idなしで送信すると合否設定が重複作成される
- 重複削除:
  ```
  exam[exam_grades_attributes][0][id]=112885&exam[exam_grades_attributes][0][_destroy]=1
  ```

## 7. quiz_id の取得方法

- quiz_idはレクチャー編集HTMLから取得（`/quizzes/N` パスではマッチしない）
- 取得パターン:
  ```javascript
  html.matchAll(/select_quiz_id['":\s]+(\d+)/g)  // → 重複除去
  ```
- option_idは各quizの先頭option_idから `+0, +1, +2, +3`（4選択肢の場合）
- quiz間の先頭option_idは4刻み（例: 4118050, 4118054, 4118058...）
- `GET /quizzes/{id}.json` は404になる（GETでの個別取得は不可）
- `question`, `question_text` を含めなくても、送らなかったフィールドは変更されない

## 8. lecture[type] の値

| 値 | レクチャータイプ |
|----|----------------|
| `QuizLecture` | 理解度チェック（クイズ） |
| `ExamLecture` | 実習課題 |
| **指定なし** | 動画レクチャー |

**`VideoLecture` は存在しない！** 動画レクチャーは型を指定せずに作成する。

## 9. ブラウザのセキュリティ制約

- DevToolsのコンソールからは `input[type=file]` にローカルファイルを直接セットできない
- `DataTransfer` でファイルオブジェクトを作れても、WisdomBase側のフレームワークが合成イベントを無視する
- ファイルピッカーで選ぶのが正しい使い方（`upload_videos.js` の設計通り）

## 10. 動画ファイル命名規則

`M3_S0_V1.mp4`, `M3_S1_V1.mp4` など `{モジュール}_{セクション}_{動画番号}.mp4` 形式。
