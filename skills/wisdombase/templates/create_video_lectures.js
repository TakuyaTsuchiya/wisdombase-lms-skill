// ======================================
// 動画レクチャー一括作成スクリプト
// 実行URL: https://ai-plus.share-wis.com/ja/courses/{courseId}/edit
// ======================================

(async () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ★★★ ユーザー入力パラメータ ★★★
  const COURSE_ID = __COURSE_ID__;

  const LECTURES = __LECTURES__;
  // ★★★ ここまで ★★★

  console.log(`📝 ${LECTURES.length}本の動画レクチャーを作成します`);

  for (const title of LECTURES) {
    const formData = new URLSearchParams();
    formData.append('lecture[title]', title);
    formData.append('commit', 'レクチャーの編集に進む');

    const res = await fetch(`/courses/${COURSE_ID}/lectures`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: formData,
    });

    console.log(`  ${res.ok || res.status === 302 ? '✅' : '❌'} ${title} (${res.status})`);
    await sleep(500);
  }

  // レクチャーID一覧を取得して表示
  console.log('\n📋 レクチャーID一覧を取得中...');
  const pageRes = await fetch(`/ja/courses/${COURSE_ID}/edit`);
  const html = await pageRes.text();
  const matches = [...html.matchAll(/\/lectures\/(\d+)\/edit/g)];
  const ids = matches.map(m => parseInt(m[1]));

  console.log('\n🎉 作成完了！レクチャーID一覧:');
  ids.forEach((id, i) => console.log(`  ${LECTURES[i] || `レクチャー${i+1}`}: ${id}`));

  console.log('\n📝 upload_videos.js の MAPPING にこれを貼ってください:');
  console.log('{');
  ids.forEach((id, i) => console.log(`  'ファイル名${i+1}.mp4': ${id},`));
  console.log('}');
})();
