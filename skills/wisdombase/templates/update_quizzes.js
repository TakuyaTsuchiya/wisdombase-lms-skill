// ======================================
// WisdomBase 既存クイズ更新スクリプト（汎用版）
// 選択肢の並べ替え・解説の修正に使用
// Chrome DevTools Console で実行
// 実行URL: https://ai-plus.share-wis.com/ja/courses/{courseId}/edit
//
// 使い方:
//   1. extract_quizzes.js で quiz_id / option_id を取得
//   2. UPDATES に修正データを記入
//   3. コース編集ページのコンソールで実行
// ======================================

(async () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ★★★ ユーザー入力パラメータ ★★★
  const UPDATES = __UPDATES__;
  // 例:
  // const UPDATES = [
  //   {
  //     quiz_id: 12345,
  //     explanation: '<p>【正解】B<br><br>【解説】<br>解説文</p>',
  //     select_quiz_options: [
  //       { id: '100001', answer: false, content: 'A: 選択肢', index: 0 },
  //       { id: '100002', answer: true,  content: 'B: 選択肢', index: 1 },
  //       { id: '100003', answer: false, content: 'C: 選択肢', index: 2 },
  //       { id: '100004', answer: false, content: 'D: 選択肢', index: 3 },
  //     ],
  //   },
  // ];
  // ★★★ ここまで ★★★

  console.log(`📝 ${UPDATES.length}問のクイズを更新します`);

  for (const upd of UPDATES) {
    const body = {
      id: upd.quiz_id,
      type: 'SelectQuiz',
      explanation: upd.explanation,
      select_quiz_options: upd.select_quiz_options.map(o => ({
        id: o.id,
        select_quiz_id: upd.quiz_id,
        answer: o.answer,
        content: o.content,
        image: '',
        index: o.index,
      })),
    };

    const res = await fetch(`/quizzes/${upd.quiz_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const correctLabel = upd.select_quiz_options.find(o => o.answer)?.content?.substring(0, 2);
    console.log(`  ${res.ok ? '✅' : '❌'} quiz_id:${upd.quiz_id} → 正解:${correctLabel} (${res.status})`);
    await sleep(500);
  }

  console.log('\n🎉 クイズ更新完了！');
})();
