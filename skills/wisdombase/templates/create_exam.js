// ======================================
// WisdomBase 実習課題作成スクリプト
// Chrome DevTools Console で実行
// 実行URL: https://ai-plus.share-wis.com/ja/courses/{courseId}/edit
//
// 処理内容:
//   1. ExamLectureを作成
//   2. exam_id / exam_section_id を動的取得
//   3. セクションタイトル変更
//   4. 問題文・解説HTML登録（LaterScoringMultiLineTextQuiz）
//   5. 試験設定（合否・配点・結果通知）
//   6. 公開
// ======================================

(async () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ★★★ ユーザー入力パラメータ ★★★
  const COURSE_ID = __COURSE_ID__;

  const EXAM_DATA = __EXAM_DATA__;
  // 例:
  // const EXAM_DATA = {
  //   title: '実習課題：ケーススタディ',
  //   sectionName: 'ケーススタディ 課題',
  //   examScore: 30,
  //   passScoreStart: 20,
  //   passScoreEnd: 30,
  //   failScoreStart: 0,
  //   failScoreEnd: 19,
  //   question: `<style>...</style><h1>課題タイトル</h1><p>問題文</p>`,
  //   explanation: `<style>...</style><h1>解説タイトル</h1><p>解説文</p>`,
  // };
  // ★★★ ここまで ★★★

  console.log('📝 Step1: レクチャー作成中...');
  const createFormData = new URLSearchParams();
  createFormData.append('lecture[title]', EXAM_DATA.title);
  createFormData.append('lecture[type]', 'ExamLecture');
  createFormData.append('commit', 'レクチャーの編集に進む');
  await fetch(`/courses/${COURSE_ID}/lectures`, {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken, 'X-Requested-With': 'XMLHttpRequest' },
    body: createFormData,
  });

  const pageRes = await fetch(`/ja/courses/${COURSE_ID}/edit`);
  const html = await pageRes.text();
  const matches = [...html.matchAll(/\/lectures\/(\d+)\/edit/g)];
  const lectureId = parseInt(matches[matches.length - 1][1]);
  console.log(`  ✅ レクチャー作成完了 (ID: ${lectureId})`);
  await sleep(500);

  // ★ exam_section_id は data-section-id 属性から取得
  console.log('📝 Step2: exam_id / exam_section_id 取得中...');
  const lecturePageRes = await fetch(`/lectures/${lectureId}/edit`);
  const lectureHtml = await lecturePageRes.text();
  const examIdMatch = lectureHtml.match(/\/exams\/(\d+)/);
  const sectionIdMatch = lectureHtml.match(/data-section-id=['"](\d+)['"]/);
  const examId = examIdMatch?.[1];
  const examSectionId = sectionIdMatch?.[1];
  if (!examId || !examSectionId) {
    console.error('❌ exam_id または exam_section_id が取得できませんでした');
    console.log('  exam_id:', examId);
    console.log('  exam_section_id:', examSectionId);
    return;
  }
  console.log(`  ✅ exam_id: ${examId}, exam_section_id: ${examSectionId}`);
  await sleep(500);

  console.log('📝 Step3: セクションタイトル変更中...');
  const sectionFormData = new URLSearchParams();
  sectionFormData.append('_method', 'patch');
  sectionFormData.append('exam_section[id]', examSectionId);
  sectionFormData.append('exam_section[exam_id]', examId);
  sectionFormData.append('exam_section[name]', EXAM_DATA.sectionName);
  sectionFormData.append('exam_section[displayed]', 'true');
  sectionFormData.append('exam_section[fixed_texts]', '');
  sectionFormData.append('exam_section[split_screen]', 'false');
  sectionFormData.append('exam_section[has_random_quizzes]', '0');
  sectionFormData.append('exam_section[has_limited_of_quizzes]', '0');
  sectionFormData.append('commit', '保存する');
  const sectionRes = await fetch(`/exam_sections/${examSectionId}`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'X-CSRF-Token': csrfToken, 'X-Requested-With': 'XMLHttpRequest' },
    body: sectionFormData,
  });
  console.log(`  ${sectionRes.ok || sectionRes.type === 'opaqueredirect' ? '✅' : '❌'} セクションタイトル変更 (${sectionRes.status}/${sectionRes.type})`);
  await sleep(500);

  console.log('📝 Step4: 問題文・解説登録中...');
  const quizBody = {
    type: 'LaterScoringMultiLineTextQuiz',
    quiz_lecture_id: lectureId,
    section: parseInt(examSectionId),
    exam: parseInt(examId),
    question: EXAM_DATA.question,
    question_text: EXAM_DATA.question.replace(/<[^>]+>/g, ''),
    explanation: EXAM_DATA.explanation,
    exam_score: EXAM_DATA.examScore,
    select_quiz_options: [],
    default_height_by_number_of_lines: 10,
    default_width_by_number_of_chars: 50,
    display_current_number_of_char: true,
    answer_limit_char: 100,
    answer_limit_char_enable: false,
    paste_disable: false,
    one_time_playable_media: false,
  };
  const quizRes = await fetch('/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken, 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
    body: JSON.stringify(quizBody),
  });
  const quizData = await quizRes.json();
  console.log(`  ${quizRes.ok ? '✅' : '❌'} 問題文登録完了 (quiz_id: ${quizData?.id})`);
  await sleep(500);

  // ★ grade_id を動的に取得
  // ★★★ HTMLではvalue属性がname属性より先に来る: value="112885" name="exam[...][0][id]"
  console.log('📝 Step5a: grade_id 取得中...');
  const gradePageRes = await fetch(`/lectures/${lectureId}/edit?page=2`);
  const gradeHtml = await gradePageRes.text();
  const gradeIdMatches = [...gradeHtml.matchAll(/value="(\d+)"[^>]*name="exam\[exam_grades_attributes\]\[(\d+)\]\[id\]"/g)];
  const gradeIds = gradeIdMatches.map(m => ({ index: m[2], id: m[1] }));
  if (gradeIds.length >= 2) {
    console.log(`  ✅ grade_ids: ${gradeIds.map(g => `[${g.index}]=${g.id}`).join(', ')}`);
  } else {
    console.warn('  ⚠️ grade_id が取得できませんでした。grade_idなしで続行します。');
  }
  await sleep(500);

  // ★ 試験設定は /exams/{lecture_id} に送る（exam_idではない）
  // ★ Docタイプなので X-Requested-With は付けない
  console.log('📝 Step5b: 試験設定（合否・ページ分割）中...');
  const examFormData = new URLSearchParams();
  examFormData.append('_method', 'patch');
  examFormData.append('exam[page]', '2');
  examFormData.append('exam[time_limit_enable]', '');
  examFormData.append('exam[grades_enable]', '1');
  examFormData.append('exam[exam_grades_attributes][0][grade_name]', '合格');
  examFormData.append('exam[exam_grades_attributes][0][score_start]', EXAM_DATA.passScoreStart);
  examFormData.append('exam[exam_grades_attributes][0][score_end]', EXAM_DATA.passScoreEnd);
  if (gradeIds[0]) examFormData.append('exam[exam_grades_attributes][0][id]', gradeIds[0].id);
  examFormData.append('exam[exam_grades_attributes][1][grade_name]', '不合格');
  examFormData.append('exam[exam_grades_attributes][1][score_start]', EXAM_DATA.failScoreStart);
  examFormData.append('exam[exam_grades_attributes][1][score_end]', EXAM_DATA.failScoreEnd);
  if (gradeIds[1]) examFormData.append('exam[exam_grades_attributes][1][id]', gradeIds[1].id);
  examFormData.append('exam[display_type_cd]', '2');
  examFormData.append('exam[finished_count_type_cd]', '1');
  examFormData.append('commit', '保存');
  const examRes = await fetch(`/exams/${lectureId}`, {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken },
    body: examFormData,
  });
  console.log(`  ${examRes.ok || examRes.redirected ? '✅' : '❌'} 試験設定（page2） (${examRes.status})`);
  await sleep(1000);

  console.log('📝 Step5c: 試験設定（結果通知）中...');
  const examPage3FormData = new URLSearchParams();
  examPage3FormData.append('_method', 'patch');
  examPage3FormData.append('exam[page]', '3');
  examPage3FormData.append('exam[display_result]', '1');
  examPage3FormData.append('exam[display_exam_score]', '1');
  examPage3FormData.append('exam[display_user_answers_result_and_explanations]', '1');
  examPage3FormData.append('exam[result_display_type_cd]', '0');
  examPage3FormData.append('exam[display_quiz_right_answers]', '1');
  examPage3FormData.append('exam[display_quiz_right_answers_cd]', '0');
  examPage3FormData.append('exam[display_quiz_explanations]', '1');
  examPage3FormData.append('exam[display_quiz_explanations_cd]', '0');
  examPage3FormData.append('exam[display_result_button_enable]', '1');
  examPage3FormData.append('exam[send_exam_result_to_user]', '1');
  examPage3FormData.append('commit', '保存');
  const examPage3Res = await fetch(`/exams/${lectureId}`, {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken },
    body: examPage3FormData,
  });
  console.log(`  ${examPage3Res.ok || examPage3Res.redirected ? '✅' : '❌'} 試験設定（page3） (${examPage3Res.status})`);
  await sleep(500);

  console.log('📝 Step6: 公開中...');
  const publishFormData = new URLSearchParams();
  publishFormData.append('_method', 'patch');
  publishFormData.append('lecture[created]', 'true');
  publishFormData.append('lecture[published]', 'true');
  publishFormData.append('commit', '保存して完成');
  const publishRes = await fetch(`/lectures/${lectureId}/publish`, {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken, 'X-Requested-With': 'XMLHttpRequest' },
    body: publishFormData,
  });
  console.log(`  ${publishRes.ok || publishRes.status === 302 || publishRes.type === 'opaqueredirect' ? '✅' : '❌'} 公開完了 (${publishRes.status})`);

  console.log(`\n🎉 実習課題作成完了！`);
  console.log(`  レクチャーID: ${lectureId}`);
  console.log(`  確認URL: https://ai-plus.share-wis.com/lectures/${lectureId}/edit`);
})();
