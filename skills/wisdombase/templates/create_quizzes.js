// ======================================
// WisdomBase クイズ一括作成スクリプト
// レクチャー作成 + 問題登録 + 順番変更 + 公開 を一括実行
// 実行URL: https://ai-plus.share-wis.com/ja/courses/{courseId}/edit
// ======================================

(async () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ★★★ ユーザー入力パラメータ ★★★
  const COURSE_ID = __COURSE_ID__;

  const VIDEO_IDS = __VIDEO_IDS__;
  // 例:
  // const VIDEO_IDS = {
  //   video1: 451459,
  //   video2: 451460,
  //   video3: 451461,
  //   video4: 451462,
  // };

  const QUIZZES = __QUIZZES__;
  // 例:
  // const QUIZZES = [
  //   {
  //     title: '動画１：確認クイズ',
  //     afterVideoId: VIDEO_IDS.video1,
  //     questions: [
  //       {
  //         question: '<p>問題文HTML</p>',
  //         questionText: '問題文プレーンテキスト',
  //         explanation: '<p>解説HTML</p>',
  //         options: [
  //           { answer: false, content: 'A: 選択肢', index: 0 },
  //           { answer: false, content: 'B: 選択肢', index: 1 },
  //           { answer: true,  content: 'C: 選択肢（正解）', index: 2 },
  //           { answer: false, content: 'D: 選択肢', index: 3 },
  //         ],
  //       },
  //     ],
  //   },
  // ];
  // ★★★ ここまで ★★★

  const createdQuizLectures = [];

  for (const quiz of QUIZZES) {
    console.log(`\n📝 クイズレクチャー作成: ${quiz.title}`);

    // Step1: QuizLectureを作成
    const createFormData = new URLSearchParams();
    createFormData.append('lecture[title]', quiz.title);
    createFormData.append('lecture[type]', 'QuizLecture');
    createFormData.append('commit', 'レクチャーの編集に進む');
    const createRes = await fetch(`/courses/${COURSE_ID}/lectures`, {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken, 'X-Requested-With': 'XMLHttpRequest' },
      body: createFormData,
    });
    console.log(`  ${createRes.ok || createRes.status === 302 ? '✅' : '❌'} レクチャー作成 (${createRes.status})`);
    await sleep(500);

    // レクチャーIDを取得
    const pageRes = await fetch(`/ja/courses/${COURSE_ID}/edit`);
    const html = await pageRes.text();
    const matches = [...html.matchAll(/\/lectures\/(\d+)\/edit/g)];
    const quizLectureId = parseInt(matches[matches.length - 1][1]);
    console.log(`  レクチャーID: ${quizLectureId}`);

    createdQuizLectures.push({
      quizLectureId,
      title: quiz.title,
      afterVideoId: quiz.afterVideoId,
    });

    // Step2: 各問題を登録
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      const quizBody = {
        type: 'SelectQuiz',
        quiz_lecture_id: quizLectureId,
        question: q.question,
        question_text: q.questionText,
        explanation: q.explanation,
        section: 0,
        select_quiz_options: q.options.map(opt => ({
          answer: opt.answer,
          content: opt.content,
          image: '',
          index: opt.index,
        })),
      };
      const quizRes = await fetch('/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        body: JSON.stringify(quizBody),
      });
      console.log(`  ${quizRes.ok ? '✅' : '❌'} 問${i + 1} 登録完了`);
      await sleep(300);
    }
  }

  // Step3: 公開（順番変更の前に公開が必要）
  console.log('\n🔓 公開中...');
  for (const cq of createdQuizLectures) {
    const publishFormData = new URLSearchParams();
    publishFormData.append('_method', 'patch');
    publishFormData.append('lecture[created]', 'true');
    publishFormData.append('lecture[published]', 'true');
    publishFormData.append('commit', '保存して完成');
    const res = await fetch(`/lectures/${cq.quizLectureId}/publish`, {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken, 'X-Requested-With': 'XMLHttpRequest' },
      body: publishFormData,
    });
    console.log(`  ${res.ok || res.status === 302 ? '✅' : '❌'} ${cq.title} 公開完了`);
    await sleep(300);
  }

  // Step4: 順番変更（各クイズを対応する動画の直後に配置）
  // ★ change_order には _method=patch が必須
  // ★ 動画→クイズ交互: 動画1(1),クイズ1(2),動画2(3),クイズ2(4),...
  console.log('\n📋 順番変更中...');
  for (let i = 0; i < createdQuizLectures.length; i++) {
    const cq = createdQuizLectures[i];
    const newOrder = (i + 1) * 2; // 2, 4, 6, 8
    const formData = new URLSearchParams();
    formData.append('_method', 'patch');
    formData.append('lecture[new_order]', newOrder);
    const res = await fetch(`/lectures/${cq.quizLectureId}/change_order`, {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken, 'X-Requested-With': 'XMLHttpRequest' },
      body: formData,
    });
    console.log(`  ${res.ok ? '✅' : '❌'} ${cq.title} → 位置${newOrder}`);
    await sleep(500);
  }

  console.log('\n🎉 クイズ作成完了！');
  console.log('\n📋 作成されたクイズレクチャーID一覧:');
  createdQuizLectures.forEach(cq => console.log(`  ${cq.title}: ${cq.quizLectureId}`));

  console.log('\n📝 set_track_limits.js 用データ:');
  console.log('const TRACK_LIMITS = [');
  for (let i = 1; i < createdQuizLectures.length; i++) {
    const videoId = QUIZZES[i].afterVideoId;
    const prevQuizId = createdQuizLectures[i - 1].quizLectureId;
    console.log(`  { targetLectureId: ${videoId}, requiredLectureIds: [${prevQuizId}] },`);
  }
  console.log('];');
})();
