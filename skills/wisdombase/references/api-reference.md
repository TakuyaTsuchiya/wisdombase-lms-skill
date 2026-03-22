# WisdomBase API リファレンス

## 環境情報

- ベースURL: `https://ai-plus.share-wis.com`（AI+スクール）/ `https://creatorzz.share-wis.com`（クリエイターズ）
- 管理画面: `/ja/courses/{courseId}/edit`
- CSRFトークン: `document.querySelector('meta[name="csrf-token"]').content`

## APIタイプの区別

| タイプ | Content-Type | 特徴 |
|--------|-------------|------|
| Fetch/XHR | `application/json` | JavaScript API通信。`X-Requested-With: XMLHttpRequest` を付ける |
| Doc | `application/x-www-form-urlencoded` | HTMLフォームsubmit。`X-Requested-With` は**付けない** |

調査時はNetworkタブを**All**で見ること（Fetch/XHRだけではDocタイプを見逃す）。

## エンドポイント一覧

### レクチャー作成（Docタイプ）

```
POST /courses/{courseId}/lectures
Body: lecture[title]=タイトル&lecture[type]=QuizLecture&commit=レクチャーの編集に進む
```

`lecture[type]` の値:
- `QuizLecture` → 理解度チェック（クイズ）
- `ExamLecture` → 実習課題
- **指定なし** → 動画レクチャー（`VideoLecture` ではない！）

### レクチャー公開（Docタイプ）

```
POST /lectures/{id}/publish
Body: _method=patch&lecture[created]=true&lecture[published]=true&commit=保存して完成
```

### レクチャー順番変更（Docタイプ）

```
POST /lectures/{id}/change_order
Body: _method=patch&lecture[new_order]=N
```

- `N` は1始まりの絶対位置
- `_method=patch` が必須（ないと404）
- レクチャーが公開済みでないと404になる場合がある

### レクチャータイトル変更

```
PUT /lectures/{id}
Body: lecture[title]=新タイトル
```

### クイズ問題登録（Fetch/XHRタイプ）

```
POST /quizzes
Content-Type: application/json
```

**選択問題（クイズ）:**
```json
{
  "type": "SelectQuiz",
  "quiz_lecture_id": "レクチャーID",
  "question": "<p>問題文HTML</p>",
  "question_text": "問題文プレーンテキスト",
  "explanation": "<p>解説HTML</p>",
  "section": 0,
  "select_quiz_options": [
    { "answer": false, "content": "A: 選択肢", "image": "", "index": 0 },
    { "answer": false, "content": "B: 選択肢", "image": "", "index": 1 },
    { "answer": true,  "content": "C: 選択肢（正解）", "image": "", "index": 2 },
    { "answer": false, "content": "D: 選択肢", "image": "", "index": 3 }
  ]
}
```

**自由記述テキストボックス（実習課題）:**
```json
{
  "type": "LaterScoringMultiLineTextQuiz",
  "quiz_lecture_id": "レクチャーID",
  "section": "exam_section_id（整数）",
  "exam": "exam_id（整数）",
  "question": "問題文HTML（style付きリッチHTML可）",
  "question_text": "問題文プレーンテキスト",
  "explanation": "解説・採点基準HTML（style付きリッチHTML可）",
  "exam_score": 30,
  "select_quiz_options": [],
  "default_height_by_number_of_lines": 10,
  "default_width_by_number_of_chars": 50,
  "display_current_number_of_char": true,
  "answer_limit_char": 100,
  "answer_limit_char_enable": false,
  "paste_disable": false,
  "one_time_playable_media": false
}
```

### クイズ更新（Fetch/XHRタイプ）

```
PUT /quizzes/{quiz_id}
Content-Type: application/json
```

```json
{
  "id": "quiz_id",
  "type": "SelectQuiz",
  "explanation": "<p>解説HTML</p>",
  "select_quiz_options": [
    { "id": "option_id", "select_quiz_id": "quiz_id", "answer": false, "content": "A: 選択肢", "image": "", "index": 0 },
    { "id": "option_id", "select_quiz_id": "quiz_id", "answer": true,  "content": "B: 選択肢", "image": "", "index": 1 },
    { "id": "option_id", "select_quiz_id": "quiz_id", "answer": false, "content": "C: 選択肢", "image": "", "index": 2 },
    { "id": "option_id", "select_quiz_id": "quiz_id", "answer": false, "content": "D: 選択肢", "image": "", "index": 3 }
  ]
}
```

- `question`, `question_text` を含めなくても、送らなかったフィールドは変更されない

### 実習課題セクションタイトル変更（Docタイプ）

```
POST /exam_sections/{exam_section_id}
Body: _method=patch&exam_section[name]=セクション名&exam_section[exam_id]={exam_id}&commit=保存する
```

- Docタイプなのでリダイレクトが発生する。`redirect: 'manual'` を付けるか許容する

### 試験設定 — 合否・配点（Docタイプ）

```
POST /exams/{lecture_id}    ← ★ exam_id ではなく lecture_id を使う
Body:
  _method=patch
  exam[page]=2
  exam[time_limit_enable]=             ← 空値で制限時間オフ
  exam[grades_enable]=1
  exam[exam_grades_attributes][0][grade_name]=合格
  exam[exam_grades_attributes][0][score_start]=20
  exam[exam_grades_attributes][0][score_end]=30
  exam[exam_grades_attributes][0][id]={grade_id}
  exam[exam_grades_attributes][1][grade_name]=不合格
  exam[exam_grades_attributes][1][score_start]=0
  exam[exam_grades_attributes][1][score_end]=19
  exam[exam_grades_attributes][1][id]={grade_id}
  exam[display_type_cd]=2              ← セクションごとページ分割
  exam[finished_count_type_cd]=1
  commit=保存
```

### 試験設定 — 結果通知（Docタイプ）

```
POST /exams/{lecture_id}    ← lecture_id を使う
Body:
  _method=patch
  exam[page]=3
  exam[display_result]=1
  exam[display_exam_score]=1
  exam[display_user_answers_result_and_explanations]=1
  exam[result_display_type_cd]=0
  exam[display_quiz_right_answers]=1
  exam[display_quiz_right_answers_cd]=0
  exam[display_quiz_explanations]=1
  exam[display_quiz_explanations_cd]=0
  exam[display_result_button_enable]=1       ← 過去の受験結果レポートページ表示ON
  exam[send_exam_result_to_user]=1           ← 受験者メール通知ON
  commit=保存
```

`exam[send_exam_result_to_instructor]` を送らないことで講師メール通知OFF。

### 動画アップロード（TUSプロトコル）

```
Step 1: POST /lectures/{id}/create_vimeo_video_by_tus_approach.json
        Body: size=ファイルサイズ&name=ファイル名
        → upload_link が返る

Step 2: PATCH {upload_link}（Vimeoサーバーに直接送信）
        Headers:
          Content-Type: application/offset+octet-stream
          Upload-Offset: オフセット
          Tus-Resumable: 1.0.0
        128MBチャンクで分割送信
```

- Vimeoのエンコードは非同期で自動処理（ポーリング不要）
- 128MB超のファイルで412エラーが出た場合は再実行で解消することが多い

### トラック制限設定（Fetch/XHRタイプ）

```
PUT /lectures/{id}
Content-Type: application/json
```

```json
{
  "lecture_logic_enable": true,
  "lecture_logic_require_lectures": "クイズレクチャーID",
  "lecture_logic_required_lecture_mode_cd": "1",
  "lecture_logic_custom_text": "前の動画のクイズにまだ回答していないため、この動画は視聴できません。",
  "property": "lecture_logic_enable"
}
```

- `lecture_logic_require_lectures` はカンマ区切りで複数指定可
