// ======================================
// WisdomBase クイズデータ一括抽出スクリプト（汎用版）
// Chrome DevTools Console で実行
// 実行URL: https://ai-plus.share-wis.com/ja/courses/{courseId}/edit
//
// 使い方:
//   1. COURSE_ID を対象コースに書き換え
//   2. コース編集ページのConsoleで実行
//   3. 全クイズレクチャーを自動検出 → データ抽出 → テキスト出力＋クリップボードコピー
//
// 抽出対象: SelectQuiz（4択クイズ）のみ
// 出力形式: 問題文・選択肢（★正解マーク付き）・解説・正解分布
// ======================================

(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ★★★ ユーザー入力パラメータ ★★★
  const COURSE_ID = __COURSE_ID__;
  // ★★★ ここまで ★★★

  // Step1: コース編集ページから全レクチャーIDを取得
  console.log('📋 Step1: コース編集ページからレクチャー一覧を取得中...');
  const courseRes = await fetch(`/ja/courses/${COURSE_ID}/edit`);
  const courseHtml = await courseRes.text();
  const lectureIds = [...new Set(
    [...courseHtml.matchAll(/\/lectures\/(\d+)\/edit/g)].map(m => m[1])
  )];
  console.log(`  全${lectureIds.length}レクチャー検出`);

  // Step2: 各レクチャーの編集ページを取得し、クイズレクチャーを自動判定
  console.log('\n📋 Step2: クイズレクチャーを自動検出中...');
  const quizLectures = [];

  for (const lid of lectureIds) {
    const res = await fetch(`/lectures/${lid}/edit`);
    const html = await res.text();

    // クイズ判定: select_quiz_id を含むJSONオブジェクトがあればクイズ
    const optionBlocks = [...html.matchAll(/\{[^{}]*select_quiz_id[^{}]*\}/g)];
    if (optionBlocks.length === 0) continue;

    // タイトル取得
    const titleMatch = html.match(/lecture\[title\].*?value="([^"]*)"/);
    const title = titleMatch?.[1] || `レクチャー${lid}`;

    quizLectures.push({ id: lid, title, html });
    console.log(`  ✅ クイズ検出: ${title} (ID: ${lid}, ${optionBlocks.length}選択肢)`);
    await sleep(200);
  }

  if (quizLectures.length === 0) {
    console.log('❌ クイズレクチャーが見つかりませんでした');
    return;
  }

  // Step3: 各クイズレクチャーからデータ抽出
  console.log(`\n📝 Step3: ${quizLectures.length}個のクイズからデータ抽出中...\n`);

  let output = '';
  let totalQuestions = 0;
  const distByQuiz = [];

  for (const ql of quizLectures) {
    const html = ql.html;

    // 選択肢JSONオブジェクト抽出 → パース
    const optionBlocks = [...html.matchAll(/\{[^{}]*select_quiz_id[^{}]*\}/g)].map(m => JSON.parse(m[0]));

    // 問題文抽出（HTMLタグ除去）
    const questions = [...html.matchAll(/question"?:\s*"((?:[^"\\]|\\.)*)"/g)]
      .map(m => m[1].replace(/<[^>]+>/g, '').replace(/\\"/g, '"').replace(/\\n/g, ''));

    // 解説抽出（HTMLタグ除去）
    const explanations = [...html.matchAll(/explanation"?:\s*"((?:[^"\\]|\\.)*)"/g)]
      .map(m => m[1].replace(/<[^>]+>/g, '').replace(/\\"/g, '"').replace(/\\n/g, ''));

    // quiz_idでグループ化
    const quizIds = [...new Set(optionBlocks.map(o => o.select_quiz_id))];

    output += `\n【${ql.title}】レクチャーID: ${ql.id}\n`;
    output += '========================================\n';

    const correctLetters = [];

    for (let qi = 0; qi < quizIds.length; qi++) {
      const qid = quizIds[qi];
      const opts = optionBlocks.filter(o => o.select_quiz_id === qid);
      const questionText = questions[qi] || '(取得失敗)';
      const explanation = explanations[qi] || '(取得失敗)';

      output += `\n■ 問${qi + 1} (ID: ${qid})\n`;
      output += `問題：${questionText}\n`;

      let correctLetter = '?';
      for (const opt of opts) {
        const mark = opt.answer ? ' ★正解' : '';
        output += `${opt.content}${mark}\n`;
        if (opt.answer) {
          correctLetter = opt.content.charAt(0);
        }
      }
      correctLetters.push(correctLetter);

      output += `解説：${explanation}\n`;
      totalQuestions++;
    }

    distByQuiz.push({ title: ql.title, count: quizIds.length, correct: correctLetters });
  }

  // 正解分布
  output += '\n========================================\n';
  output += '正解分布\n';
  output += '========================================\n';
  for (const d of distByQuiz) {
    output += `${d.title}（${d.count}問）：${d.correct.join(', ')}\n`;
  }

  // 全体ABCD集計
  const all = distByQuiz.flatMap(d => d.correct);
  const countA = all.filter(x => x === 'A').length;
  const countB = all.filter(x => x === 'B').length;
  const countC = all.filter(x => x === 'C').length;
  const countD = all.filter(x => x === 'D').length;
  output += `\n全体分布（${totalQuestions}問）：A=${countA}(${Math.round(countA/totalQuestions*100)}%), B=${countB}(${Math.round(countB/totalQuestions*100)}%), C=${countC}(${Math.round(countC/totalQuestions*100)}%), D=${countD}(${Math.round(countD/totalQuestions*100)}%)\n`;

  console.log(output);

  // クリップボードコピー
  try {
    await navigator.clipboard.writeText(output);
    console.log('\n✅ クリップボードにコピー済み！');
  } catch (e) {
    console.log('\n⚠️ クリップボードコピー失敗。上のテキストを手動でコピーしてください。');
  }

  console.log(`\n🎉 完了！ ${quizLectures.length}個のクイズ、合計${totalQuestions}問を抽出しました`);
})();
