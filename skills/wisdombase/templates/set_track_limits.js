// ======================================
// WisdomBase トラック制限設定スクリプト（汎用版）
// Chrome DevTools Console で実行
// 実行URL: https://ai-plus.share-wis.com/ja/courses/{courseId}/edit
// 設定内容：動画の前にクイズ完了が必要な制限
// ======================================

(async () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ★★★ ユーザー入力パラメータ ★★★
  const CUSTOM_TEXT = '前の動画のクイズにまだ回答していないため、この動画は視聴できません。';

  const TRACK_LIMITS = __TRACK_LIMITS__;
  // 例:
  // const TRACK_LIMITS = [
  //   { targetLectureId: 451460, requiredLectureIds: [451463] },
  //   { targetLectureId: 451461, requiredLectureIds: [451464] },
  //   { targetLectureId: 451462, requiredLectureIds: [451465] },
  // ];
  // ★★★ ここまで ★★★

  console.log(`📋 ${TRACK_LIMITS.length}件のトラック制限を設定します`);

  for (const limit of TRACK_LIMITS) {
    const requiredIds = limit.requiredLectureIds.join(',');
    const body = {
      lecture_logic_enable: true,
      lecture_logic_require_lectures: requiredIds,
      lecture_logic_required_lecture_mode_cd: '1',
      lecture_logic_custom_text: CUSTOM_TEXT,
      property: 'lecture_logic_enable',
    };
    const res = await fetch(`/lectures/${limit.targetLectureId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const ok = res.ok && data.lecture_logic_enable === true;
    console.log(`  ${ok ? '✅' : '❌'} レクチャーID:${limit.targetLectureId} → 必要レクチャー:[${requiredIds}] (${res.status})`);
    await sleep(300);
  }

  console.log('\n🎉 トラック制限設定完了！');
})();
