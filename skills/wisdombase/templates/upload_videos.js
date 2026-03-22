// ======================================
// WisdomBase 動画アップロードスクリプト
// TUSプロトコルによるチャンクアップロード
// Chrome DevTools Console で実行
// 実行URL: https://ai-plus.share-wis.com/ja/courses/{courseId}/edit
// ======================================

(async () => {
  // ★★★ ユーザー入力パラメータ ★★★
  const MAPPING = __MAPPING__;
  // 例:
  // const MAPPING = {
  //   'M3_S1_V1.mp4': 451459,
  //   'M3_S1_V2.mp4': 451460,
  // };
  // ★★★ ここまで ★★★

  const CHUNK_SIZE = 128 * 1024 * 1024; // 128MB
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const files = await new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4';
    input.multiple = true;
    input.onchange = (e) => resolve([...e.target.files]);
    input.click();
  });

  if (!files.length) { console.log('❌ ファイルが選択されませんでした'); return; }
  console.log(`📂 ${files.length}本のファイルが選択されました`);
  files.forEach(f => console.log(`  - ${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`));

  const unmapped = files.filter(f => !MAPPING[f.name]);
  if (unmapped.length) {
    console.warn('⚠️ マッピングが見つからないファイル:');
    unmapped.forEach(f => console.warn(`  - ${f.name}`));
    console.warn('処理を中止します。ファイル名を確認してください。');
    return;
  }

  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  async function tusUpload(uploadLink, file) {
    let offset = 0;
    const total = file.size;
    while (offset < total) {
      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      const res = await fetch(uploadLink, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/offset+octet-stream',
          'Upload-Offset': offset,
          'Tus-Resumable': '1.0.0',
          'Content-Length': chunk.size,
        },
        body: chunk,
      });
      if (!res.ok && res.status !== 204) throw new Error(`TUSアップロード失敗: ${res.status}`);
      offset = parseInt(res.headers.get('Upload-Offset') || (offset + chunk.size));
      const pct = ((offset / total) * 100).toFixed(1);
      console.log(`  📤 ${pct}% (${(offset / 1024 / 1024).toFixed(1)} MB / ${(total / 1024 / 1024).toFixed(1)} MB)`);
    }
  }

  for (const file of files) {
    const lectureId = MAPPING[file.name];
    console.log(`\n🎬 開始: ${file.name} → レクチャーID: ${lectureId}`);
    try {
      console.log('  📡 Step1: アップロードURL取得中...');
      const formData = new URLSearchParams();
      formData.append('size', file.size);
      formData.append('name', file.name);
      const initRes = await fetch(`/lectures/${lectureId}/create_vimeo_video_by_tus_approach.json`, {
        method: 'POST',
        headers: { 'X-Csrf-Token': csrfToken, 'X-Requested-With': 'XMLHttpRequest' },
        body: formData,
      });
      const initData = await initRes.json();
      if (initData.error) throw new Error(`アップロードURL取得失敗: ${JSON.stringify(initData)}`);
      const uploadLink = initData.body?.upload_link;
      if (!uploadLink) throw new Error('upload_linkが取得できませんでした');
      console.log('  ✅ Step1完了');
      console.log('  📤 Step2: Vimeoにアップロード中...');
      await tusUpload(uploadLink, file);
      console.log(`  ✅ ${file.name} アップロード完了！`);
      console.log('  ℹ️  Vimeoのエンコードは裏で自動処理されます');
    } catch (err) {
      console.error(`  ❌ エラー: ${file.name} → ${err.message}`);
    }
    await sleep(500);
  }

  console.log('\n🎉 全ファイルのアップロードが完了しました！');
  console.log('※ Vimeoのエンコード処理は数分〜十数分で自動完了します。');
})();
