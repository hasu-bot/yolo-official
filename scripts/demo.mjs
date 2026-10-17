// Synthetic fixtures are built only into an OS temporary folder. Never into /talents/ in this repo.
import { mkdtemp, mkdir, cp, writeFile, readFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { ROOT, buildTalents } from './talents.mjs';

export function sampleRecord(slug = 'sample-a') {
  return {
    publication: { status: 'approved', consent: 'granted', consentVersion: 'DEVELOPMENT-ONLY', consentRecordedAt: '2026-10-15', profileConfirmed: true, photosConfirmed: true, isMinor: false },
    profile: { slug, name: `サンプル ${slug.slice(-1).toUpperCase()}（架空）`, romanName: `SAMPLE ${slug.slice(-1).toUpperCase()}`, intro: '開発用の架空プロフィールです。写真・映像の表現を想定した、レイアウトと操作の確認用サンプルです。', area: '熊本県（サンプル）', height: 165, works: ['photo', 'ad'], categories: ['fashion', 'lifestyle'], portrait: { src: `/assets/talents/${slug}.png`, alt: '開発用の抽象画像。人物写真ではありません。' }, gallery: [{ src: `/assets/talents/${slug}.png`, alt: 'ギャラリーのレイアウト確認用画像' }], skills: ['ダンス（サンプル）', '写真（サンプル）'], credits: ['2026 / 架空の作品名 — 開発用の表示例'] }
  };
}

// A deliberately abstract PNG swatch. No real or generated person is presented as a model.
function swatch(index) {
  const width = 600, height = 800;
  const pixels = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const offset = y * (width * 3 + 1) + 1 + x * 3;
    const base = 222 - index * 13;
    const shape = x > 110 + index * 25 && x < 460 && y > 140 && y < 660;
    const val = shape ? base - 34 : base;
    pixels[offset] = val; pixels[offset + 1] = val; pixels[offset + 2] = val - 4;
  }
  const crc = data => {
    let c = 0xffffffff;
    for (const byte of data) { c ^= byte; for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); }
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const name = Buffer.from(type), length = Buffer.alloc(4), checksum = Buffer.alloc(4);
    length.writeUInt32BE(data.length); checksum.writeUInt32BE(crc(Buffer.concat([name, data])));
    return Buffer.concat([length, name, data, checksum]);
  };
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}

export async function createDemo() {
  const root = await mkdtemp(path.join(tmpdir(), 'yolo-model-demo-'));
  for (const file of ['index.html', 'site.css', 'site.js', 'home-light.css', 'talent-section.css', 'refinement.css', 'yolo-tokens.css', 'talents.css', 'talents.js', 'casting.js', 'casting.css', 'casting', 'model', 'assets', 'history']) await cp(path.join(ROOT, file), path.join(root, file), { recursive: true });
  await mkdir(path.join(root, 'assets/talents'), { recursive: true });
  const records = ['sample-a', 'sample-b', 'sample-c', 'sample-d'].map(sampleRecord);
  records[1].profile.works = ['film'];
  records[1].profile.categories = ['beauty'];
  records[2].profile.works = ['photo'];
  records[2].profile.categories = ['lifestyle'];
  records[3].profile.works = ['ad'];
  records[3].profile.categories = ['fashion'];
  // The materialized concept is used unchanged, as a CSS sprite only inside this temporary demo.
  // Its fictional people are never copied to the repository's public assets or generated production pages.
  const concept = path.join(ROOT, '../reference/yolo-model-page-concept-v2.png');
  const haveConcept = await access(concept).then(() => true, () => false);
  for (let i = 0; i < records.length; i++) {
    const profile = records[i].profile;
    if (haveConcept) {
      const source = `/assets/talents/${profile.slug}-concept.png`;
      profile.portrait = { src: source, alt: '参考コンセプトのAI生成による架空人物。開発用で、実在の公式モデルではありません。' };
      profile.gallery = [{ ...profile.portrait }];
      await cp(concept, path.join(root, source));
    } else await writeFile(path.join(root, profile.portrait.src), swatch(i));
  }
  const castingFile=path.join(root,'casting/index.html');
  const castingHtml=await readFile(castingFile,'utf8');
  await writeFile(castingFile,castingHtml.replace('id="casting-form"','id="casting-form" data-demo="true"').replace('<main id="main">','<main id="main"><div class="demo-notice">開発用プレビュー・架空サンプルです。実際の依頼は送信されません。</div>').replace('<head>','<head><meta name="robots" content="noindex, nofollow">'));
  await buildTalents({ records, root, demo: true });
  return root;
}
