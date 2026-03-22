---
name: wisdombase
description: |
  WisdomBase LMSのコース構築を自動化する。レクチャー作成、動画アップロード、
  クイズ作成、実習課題作成、トラック制限設定をDevToolsコンソール用スクリプトで実行。
  トリガー: "WisdomBase", "LMS", "レクチャー作成", "動画アップロード", "クイズ",
  "実習課題", "トラック制限", "コース構築"
user-invocable: true
argument-hint: "[操作内容]"
allowed-tools: Read, Grep, Glob, Bash
---

# WisdomBase LMS コース構築自動化

WisdomBase LMSのコース構築をDevToolsコンソール用スクリプトで自動化する。
あなたの役割は**テンプレートのパラメータを埋めること**であり、スクリプトを自分で書くことではない。

## 最初に必ずヒアリングする

ユーザーがいきなり全情報を揃えていることは稀。まず以下を質問して情報を集める:

1. **何をしたいか？** — 動画レクチャー作成？クイズ追加？実習課題？全部？
2. **コースID** — URLに含まれる数字（例: `courses/47002/edit` なら `47002`）
3. **レクチャータイトル** — 何本？タイトルは？
4. **動画ファイル** — ファイル名は？（アップロードが必要な場合）

情報が揃ってから初めてスクリプトを出力する。一度に全部聞かず、ステップごとに必要な情報だけ聞く。

## スクリプトの出力方法

パラメータを埋めたスクリプトは**会話に表示するのではなく、ファイルに書き出す**。
ターミナルからのコピペは大変なので、必ずファイルとして保存する。

**書き出し先**: `~/Desktop/wisdombase-scripts/` ディレクトリに保存する。
**ファイル名**: ステップと操作がわかる名前にする（例: `step1_create_lectures.js`）

スクリプトを書き出した後、以下をセットで案内する:

1. 📄 **ファイルパス**: `~/Desktop/wisdombase-scripts/step1_create_lectures.js`
2. 🌐 **実行URL**: `https://ai-plus.share-wis.com/ja/courses/47002/edit` をブラウザで開く
3. 🔧 **実行手順**:
   - **F12**キー（Macは **Cmd + Option + I**）でDevTools（開発者ツール）を開く
   - **Console**タブを選択する
   - 上記ファイルの中身をコピペして **Enter** で実行
4. 📋 コンソールに表示される結果（レクチャーIDなど）を次のステップで使う

## 全体フロー

コース構築は以下の5ステップで行う:

| Step | 操作 | テンプレート |
|------|------|-------------|
| 1 | 動画レクチャー作成 | `templates/create_video_lectures.js` |
| 2 | 動画アップロード | `templates/upload_videos.js` |
| 3 | 動画レクチャー公開 | `templates/publish_lectures.js` |
| 4 | クイズ作成 | `templates/create_quizzes.js` |
| 5 | 実習課題作成 | `templates/create_exam.js` |
| 6 | トラック制限設定 | `templates/set_track_limits.js` |

すべてのスクリプトはコース編集ページ（`https://ai-plus.share-wis.com/ja/courses/{courseId}/edit`）で実行する。

## 各ステップの実行方法

### Step 1: 動画レクチャー作成

1. `templates/create_video_lectures.js` を読む
2. ユーザーから以下を聞く（まだ聞いていない場合）:
   - `COURSE_ID`: コースID
   - `LECTURES`: レクチャータイトルの配列
3. `★ ここを編集して使う` 部分のみパラメータを埋めて出力する
4. 実行URLとDevToolsの操作手順を案内する
5. 実行後に表示されるレクチャーID一覧をStep 2で使うことを案内する

### Step 2: 動画アップロード

1. `templates/upload_videos.js` を読む
2. ユーザーから以下を聞く:
   - `MAPPING`: ファイル名→レクチャーIDの対応表（Step 1の出力を使う）
3. パラメータを埋めて出力する
4. **重要**: ファイル選択はブラウザのファイルピッカーで手動で行う（セキュリティ制約）

### Step 3: 動画レクチャー公開

1. `templates/publish_lectures.js` を読む
2. `VIDEO_IDS`: Step 1で取得したレクチャーIDの配列を埋める

### Step 4: クイズ作成

1. `templates/create_quizzes.js` を読む
2. ユーザーから以下を聞く:
   - `COURSE_ID`: コースID
   - `VIDEO_IDS`: 動画レクチャーIDの対応
   - `QUIZZES`: クイズデータ（タイトル、問題文、選択肢、正解、解説）
3. パラメータを埋めて出力する

### Step 5: 実習課題作成

1. `templates/create_exam.js` を読む
2. ユーザーから以下を聞く:
   - `COURSE_ID`: コースID
   - `EXAM_DATA`: 課題タイトル、セクション名、配点、合否基準、問題文HTML、解説HTML
3. HTMLテンプレートは `references/html-style-guide.md` を参照
4. パラメータを埋めて出力する
5. 実行後に表示されるレクチャーIDをStep 6で使うことを案内する

### Step 6: トラック制限設定

1. `templates/set_track_limits.js` を読む
2. `TRACK_LIMITS`: Step 4・Step 5の出力で表示されるデータを使う
3. トラック制限ロジック:
   - 動画2 → クイズ1完了が必要
   - 動画3 → クイズ2完了が必要
   - 動画N → クイズN-1完了が必要
   - **クイズにはトラック制限をかけない**

### クイズ更新（既存クイズの修正）

1. `templates/extract_quizzes.js` でquiz_id/option_idを取得
2. `templates/update_quizzes.js` で更新データを埋めて実行

## 重要ルール

1. **テンプレートを改変しない** — `★ ここを編集して使う` のパラメータ部分のみ変更する
2. **`lecture[type]` は動画なら指定しない** — `VideoLecture` は間違い。動画は型指定なしで作成される
3. **アップロードはTUSプロトコル** — `DataTransfer` や `FileList` は使わない
4. **ファイルピッカーは手動** — ブラウザのセキュリティ制約により、スクリプトからファイルパスを指定できない
5. **試験設定のエンドポイントは `/exams/{lecture_id}`** — `exam_id` ではない
6. **Docタイプ API では `X-Requested-With` を付けない** — 付けると404になることがある

詳細な注意事項は `references/gotchas.md` を参照。
API仕様の詳細は `references/api-reference.md` を参照。
実習課題のHTMLテンプレートは `references/html-style-guide.md` を参照。
