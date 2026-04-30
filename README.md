# WisdomBase LMS Skill

WisdomBase LMSのコース構築を自動化するClaude Codeプラグイン。

## できること

- 動画レクチャーの一括作成
- 動画ファイルのTUSアップロード
- レクチャーの一括公開
- 確認クイズの一括作成（問題登録・順番変更・公開）
- 実習課題の作成（リッチHTML対応）
- トラック制限の設定
- 既存クイズの更新・抽出

## 必要な環境

- **Claude Code** がインストール済みであること
- **WisdomBase 管理画面** にログイン済みのブラウザ（`https://ai-plus.share-wis.com/`）
- **DevToolsコンソール** での操作に抵抗がないこと（生成されたスクリプトをコンソールに貼って実行する設計）
- コースは事前にWisdomBase管理画面で **手動作成済み** であること（5桁のコースIDが必要）

## インストール

Claude Codeを起動して、以下を順に入力してください:

```
/plugin marketplace add TakuyaTsuchiya/wisdombase-lms-skill
/plugin install wisdombase@wisdombase-lms-skill
```

それぞれインストールの確認プロンプトが出るので承認します。完了すると `/wisdombase` で呼び出せるようになります。

### アップデート

新しいバージョンが出たとき:

```
/plugin update wisdombase@wisdombase-lms-skill
```

### アンインストール

```
/plugin uninstall wisdombase@wisdombase-lms-skill
```

## 使い方

### スキルの呼び出し

```
/wisdombase コース47002にAI入門の動画3本を作成したい
```

または、自然言語で:

```
WisdomBaseでコース45183にクイズを追加して
```

スキルが起動すると、必要な情報（コースID、動画タイトル、クイズ内容など）を順番にヒアリングしてきます。情報が揃うとスクリプトが `~/Desktop/wisdombase-scripts/` に生成されるので、WisdomBase管理画面のDevToolsコンソールに貼って実行してください。

### 全体フロー

1. **動画レクチャー作成** → レクチャーIDが発番される
2. **動画アップロード** → ファイルピッカーで動画を選択
3. **動画レクチャー公開**
4. **クイズ作成** → 問題登録・順番変更・公開を一括実行
5. **実習課題作成** → リッチHTMLで課題文・解説を作成
6. **トラック制限設定** → 動画にクイズ完了条件を設定

### 設計思想

Claudeがスクリプトを一から書くのではなく、**テンプレートのパラメータを埋めるだけ**の設計です。
これにより:

- スクリプトの品質が常に一定
- 既知のGotchas（罠）を踏まない
- ユーザーは要件を伝えるだけでOK

## ファイル構成

```
wisdombase-lms-skill/
├── .claude-plugin/
│   └── plugin.json              # プラグイン定義
├── skills/
│   └── wisdombase/
│       ├── SKILL.md             # メイン指示（フロー制御・ルール）
│       ├── references/
│       │   ├── api-reference.md # WisdomBase API一覧
│       │   ├── gotchas.md       # 重要な注意事項
│       │   └── html-style-guide.md  # 実習課題HTMLテンプレート
│       └── templates/
│           ├── create_video_lectures.js  # 動画レクチャー作成
│           ├── upload_videos.js          # 動画アップロード（TUS）
│           ├── publish_lectures.js       # レクチャー公開
│           ├── create_quizzes.js         # クイズ一括作成
│           ├── create_exam.js            # 実習課題作成
│           ├── set_track_limits.js       # トラック制限設定
│           ├── update_quizzes.js         # クイズ更新
│           └── extract_quizzes.js        # クイズデータ抽出
└── README.md
```

## バグ報告・要望

[Issues](https://github.com/TakuyaTsuchiya/wisdombase-lms-skill/issues) からお願いします。

## ライセンス

MIT
