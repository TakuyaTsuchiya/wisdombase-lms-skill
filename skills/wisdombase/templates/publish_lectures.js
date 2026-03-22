// ======================================
// 動画レクチャー一括公開スクリプト
// 実行URL: https://ai-plus.share-wis.com/ja/courses/{courseId}/edit
// ======================================

(async () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ★★★ ユーザー入力パラメータ ★★★
  const VIDEO_IDS = __VIDEO_IDS__;
  // 例: const VIDEO_IDS = [451459, 451460, 451461, 451462];
  // ★★★ ここまで ★★★

  console.log('🔓 動画レクチャー公開中...');
  for (const id of VIDEO_IDS) {
    const formData = new URLSearchParams();
    formData.append('_method', 'patch');
    formData.append('lecture[created]', 'true');
    formData.append('lecture[published]', 'true');
    formData.append('commit', '保存して完成');
    const res = await fetch(`/lectures/${id}/publish`, {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken, 'X-Requested-With': 'XMLHttpRequest' },
      body: formData,
    });
    console.log(`  ${res.ok || res.status === 302 ? '✅' : '❌'} レクチャーID:${id} (${res.status})`);
    await sleep(300);
  }

  console.log('\n🎉 全動画レクチャー公開完了！');
})();
