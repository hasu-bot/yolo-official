import { readFile, writeFile, mkdir, rm, rename, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://yolo-official.vercel.app';
export const CATEGORIES = { fashion: 'ファッション', beauty: 'ビューティー', lifestyle: 'ライフスタイル' };
export const WORKS = { photo: ['PHOTO', '写真・ポートレート'], film: ['FILM', '映像・MV'], ad: ['ADVERTISING', '広告・PR'], event: ['EVENT', 'イベント'] };
export const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const onlyKeys = (object, allowed) => object && typeof object === 'object' && !Array.isArray(object) && Object.keys(object).every(key => allowed.includes(key));
const validText = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 1200;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(value).toISOString().slice(0, 10) === value;
const image = value => onlyKeys(value, ['src', 'alt']) && /^\/assets\/talents\/[a-z0-9/-]+\.(jpg|jpeg|png|webp)$/.test(value.src) && !value.src.includes('..') && validText(value.alt);

// This is a publication gate, not a connection to the private application database.
// Keep applicant records, contact information, birth dates and private notes out of this repository.
export function publishableProfiles(records) {
  if (!Array.isArray(records)) throw new Error('The talent registry must be an array.');
  const profiles = [];
  const slugs = new Set();
  for (const record of records) {
    const approval = record?.publication;
    if (approval?.status !== 'approved' || approval?.consent !== 'granted' || approval?.profileConfirmed !== true || approval?.photosConfirmed !== true) continue;
    if (!onlyKeys(record, ['publication', 'profile']) || !onlyKeys(approval, ['status', 'consent', 'consentVersion', 'consentRecordedAt', 'profileConfirmed', 'photosConfirmed', 'isMinor', 'guardianConsentRecordedAt'])) throw new Error('Unsupported publication fields.');
    if (!validText(approval.consentVersion) || !date(approval.consentRecordedAt) || typeof approval.isMinor !== 'boolean' || (approval.isMinor && !date(approval.guardianConsentRecordedAt))) throw new Error('Publication consent evidence is incomplete.');
    const p = record.profile;
    if (!onlyKeys(p, ['slug', 'name', 'romanName', 'intro', 'area', 'height', 'skills', 'works', 'categories', 'portrait', 'gallery', 'credits'])) throw new Error('Unsupported public profile fields.');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || p.slug.length > 70 || slugs.has(p.slug)) throw new Error('Invalid or duplicate talent slug.');
    for (const key of ['name', 'romanName', 'intro', 'area']) if (!validText(p[key])) throw new Error(`Missing public profile field: ${key}`);
    if (p.height !== undefined && (!Number.isInteger(p.height) || p.height < 100 || p.height > 250)) throw new Error('Invalid public height.');
    if (!Array.isArray(p.works) || !p.works.length || p.works.some(work => !Object.hasOwn(WORKS, work)) || new Set(p.works).size !== p.works.length) throw new Error('Invalid work categories.');
    if (p.categories !== undefined && (!Array.isArray(p.categories) || p.categories.some(category => !Object.hasOwn(CATEGORIES, category)) || new Set(p.categories).size !== p.categories.length)) throw new Error('Invalid public categories.');
    if (!image(p.portrait) || !Array.isArray(p.gallery) || p.gallery.some(item => !image(item))) throw new Error('Only approved local talent photos are supported.');
    for (const key of ['skills', 'credits']) if (!Array.isArray(p[key]) || p[key].some(item => !validText(item))) throw new Error(`Invalid public ${key}.`);
    slugs.add(p.slug);
    // Explicit public-field projection. Never serialize the source record into HTML or JS.
    profiles.push({ slug: p.slug, name: p.name, romanName: p.romanName, intro: p.intro, area: p.area, height: p.height, works: [...p.works], categories: [...(p.categories || [])], portrait: { src: p.portrait.src, alt: p.portrait.alt }, gallery: p.gallery.map(i => ({ src: i.src, alt: i.alt })), skills: [...p.skills], credits: [...p.credits] });
  }
  return profiles;
}

const img = (photo, eager = false) => `<img src="${escape(photo.src)}" alt="${escape(photo.alt)}" width="900" height="1200" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
const kicker = text => `<p class="talents-kicker">${text}</p>`;
const tags = works => `<ul class="talents-tags" aria-label="対応できる出演">${works.map(key => `<li>${WORKS[key][1]}</li>`).join('')}</ul>`;
const castingUrl = profile => `/casting/${profile ? `?model=${encodeURIComponent(profile.slug)}` : ''}`;
const consultation = profile => `<section class="talents-booking talents-wrap" id="casting" aria-labelledby="casting-title">
  <div class="casting-layout"><div class="booking-heading">${kicker('CASTING')}
    <h2 id="casting-title">${profile ? `${escape(profile.name)}への<br>出演のご相談` : 'モデルが決まっていなくても、<br>企画からご相談ください。'}</h2>
    <p>撮影内容や希望するイメージ、日程、ご予算をお聞かせください。YOLOが窓口となり、本人の希望や出演条件を確認します。</p>
    <p class="booking-status-note">ご相談の送信時点では、出演は確定しません。</p>
  </div><div class="casting-action">
    <a class="button button-primary" href="${castingUrl(profile)}">出演を相談する <span aria-hidden="true">↗</span></a>
    <p class="casting-note">写真・映像・広告・イベントなど。<br>決まっている内容からお知らせください。</p>
    <button class="casting-copy" type="button" data-copy-brief ${profile ? `data-model-name="${escape(profile.name)}"` : ''} hidden>相談メモをコピー <span aria-hidden="true">↗</span></button>
    <p class="copy-status" role="status" aria-live="polite"></p><textarea class="copy-fallback" aria-label="相談メモ（選択してコピーしてください）" readonly hidden></textarea>
  </div></div>
</section>`;
const about = `<section class="talents-about talents-wrap" id="about" aria-labelledby="about-title">
  <div class="about-intro">${kicker('ABOUT YOLO TALENTS')}<h2 id="about-title">表現する人と、<br>つくる人をつなぐ。</h2>
    <p>Creative YOLOは、熊本を拠点に写真・映像の制作やコミュニティ活動を行っています。YOLO TALENTSでは、公式モデルの写真・プロフィールと、対応できる出演内容をご紹介します。</p>
    <a class="talents-text-link" href="/#projects">YOLOの活動を見る <span aria-hidden="true">↗</span></a>
    <a class="talents-text-link" href="/history/">活動の記録を見る <span aria-hidden="true">↗</span></a>
  </div><aside class="talents-join" aria-labelledby="join-model-title">${kicker('JOIN US')}<h3 id="join-model-title">撮られること、演じることに<br>興味のある方へ。</h3>
    <p>モデル・俳優として活動したい方の応募を受け付けています。16歳以上、未経験の方も応募できます。活動内容や応募条件をご確認ください。</p>
    <p class="join-note">登録は審査制です。16〜17歳の方は保護者の同意が必要です。</p>
    <a class="talents-text-link" href="/model/">モデル・俳優の応募条件を見る <span aria-hidden="true">↗</span></a>
  </aside>
</section>`;

export function shell({ title, description, pathname, body, demo = false, castingSlug }) {
  const headerCasting = castingUrl(castingSlug ? { slug: castingSlug } : null);
  return `<!doctype html>
<html lang="ja"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} | Creative YOLO</title><meta name="description" content="${escape(description)}">
${demo ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${ORIGIN}${pathname}">`}
<meta property="og:type" content="website"><meta property="og:title" content="${escape(title)} | Creative YOLO"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${ORIGIN}${pathname}"><meta property="og:image" content="${ORIGIN}/assets/ogp.png"><meta property="og:locale" content="ja_JP"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#ffffff">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%230b0b0b'/%3E%3Crect x='8' y='30' width='48' height='4' fill='%23ffffff'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600&family=Noto+Sans+JP:wght@400;500;600&family=Shippori+Mincho+B1:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/yolo-tokens.css?v=20260921b"><link rel="stylesheet" href="/site.css?v=20260921b"><link rel="stylesheet" href="/home-light.css?v=20260921b"><link rel="stylesheet" href="/talents.css?v=20261018b"><script src="/talents.js?v=20261018b" defer></script>
</head><body class="home-light talents-page${demo ? ' talents-demo' : ''}">
<a class="skip-link" href="#main">本文へ移動</a>
${demo ? '<div class="demo-notice">開発用プレビュー · すべて架空のサンプルです。公式認定・掲載を示すものではありません。</div>' : ''}
<header class="site-header talents-header"><a class="brand" href="/" aria-label="Creative YOLO トップへ"><span class="brand-mark" aria-hidden="true"></span><span class="brand-name">Creative YOLO</span></a><nav class="talents-nav" aria-label="メインナビゲーション"><a href="/talents/"${pathname === '/talents/' ? ' aria-current="page"' : ''}>モデル一覧</a><a href="/model/">モデル応募</a><a class="talents-nav-cta" href="${headerCasting}">出演を相談する <span aria-hidden="true">↗</span></a></nav></header>
<main id="main">${body}</main>
<footer class="talents-footer"><div class="talents-wrap"><a class="brand-name" href="/">Creative YOLO</a><nav aria-label="フッター"><a href="/">YOLOについて</a><a href="/talents/">公式モデル</a><a href="/model/">モデル・俳優募集</a></nav><p>© Creative YOLO</p></div></footer>
</body></html>\n`;
}

export function renderListing(profiles, demo = false) {
  const cards = profiles.map(p => {
    const labels = [...p.categories.map(key => CATEGORIES[key]), ...p.works.map(key => WORKS[key][1])].slice(0, 2);
    return `<article class="talent-card" data-work="${p.works.join(' ')}" data-category="${p.categories.join(' ')}"><a href="/talents/${escape(p.slug)}/"><div class="talent-card-photo">${img(p.portrait, true)}${demo ? '<span class="talent-sample-label">SAMPLE</span>' : ''}</div><div class="talent-card-caption"><h3>${escape(p.name)}</h3><p lang="en">${escape(p.romanName)}</p><p class="talent-card-area">${escape(p.area)}</p></div><ul class="talent-card-tags" aria-label="ジャンル・出演内容">${labels.map(label => `<li>${label}</li>`).join('')}</ul><span class="talent-profile-link">プロフィールを見る <span aria-hidden="true">↗</span></span></a></article>`;
  }).join('');
  const body = `<section class="talents-hero talents-wrap">${kicker('YOLO TALENTS')}<h1>その人らしさが、<br>企画の力になる。</h1><p class="talents-lead">写真・映像・広告・イベント。<br class="mobile-break">YOLO公式モデルのプロフィールをご紹介します。</p></section>
<section class="talents-directory talents-wrap" id="models" aria-labelledby="models-title"><div class="talents-directory-toolbar"><h2 id="models-title"><span lang="en">MODELS</span><span>モデル一覧</span></h2>${profiles.length ? `<div class="talents-filters" role="group" aria-label="ジャンルで絞り込む" hidden><button type="button" data-category-filter="all" aria-pressed="true">すべて</button>${Object.entries(CATEGORIES).map(([key, label]) => `<button type="button" data-category-filter="${key}" aria-pressed="false">${label}</button>`).join('')}</div>` : ''}</div>
${profiles.length ? `<details class="talents-extra-filters" hidden><summary>出演内容から絞り込む</summary><div class="talents-filters" role="group" aria-label="出演内容で絞り込む"><button type="button" data-filter="all" aria-pressed="true">出演内容すべて</button>${Object.entries(WORKS).map(([key, value]) => `<button type="button" data-filter="${key}" aria-pressed="false">${value[1]}</button>`).join('')}</div></details><p class="talents-result" role="status" aria-live="polite">${profiles.length}名のプロフィール</p><div class="talents-grid">${cards}</div><div class="talents-empty" data-filter-empty hidden><h3>条件に合うモデルが見つかりませんでした。</h3><p>ほかのジャンル・出演内容で探すか、企画のイメージからご相談ください。</p><button class="talents-text-link" type="button" data-reset-filter>すべてのモデルを見る →</button></div>${demo ? '<p class="talents-sample-note">掲載の人物・プロフィールはすべてデザイン検討用の架空サンプルです。</p>' : ''}` : `<div class="talents-empty"><h3>現在、公開中のプロフィールはありません。</h3><p>出演のご相談は、モデルの指名がなくてもお送りいただけます。</p><a class="talents-text-link" href="/casting/">出演の相談フォームへ →</a></div>`}</section>
${consultation()}${about}`;
  return shell({ title: 'YOLO TALENTS｜公式モデル', description: 'YOLO公式モデルの写真・プロフィールと対応できる出演内容をご紹介。写真・映像・広告・イベントへの出演のご相談はYOLOが承ります。', pathname: '/talents/', body, demo });
}

export function renderProfile(p, demo = false) {
  const body = `<div class="talents-wrap"><nav class="talents-breadcrumb" aria-label="パンくず"><a href="/talents/">モデル一覧</a><span aria-hidden="true">/</span><span aria-current="page">${escape(p.name)}</span></nav><section class="talents-profile" aria-labelledby="profile-name"><figure class="profile-portrait">${img(p.portrait, true)}</figure><div class="profile-info">${kicker(demo ? 'MODEL / DEVELOPMENT SAMPLE' : 'YOLO OFFICIAL MODEL')}<h1 id="profile-name">${escape(p.name)}</h1><p class="profile-roman" lang="en">${escape(p.romanName)}</p><p class="profile-intro">${escape(p.intro)}</p><dl class="profile-facts"><div><dt>活動エリア</dt><dd>${escape(p.area)}</dd></div>${p.height ? `<div><dt>身長</dt><dd>${p.height} cm</dd></div>` : ''}${p.skills.length ? `<div><dt>特技・好きなこと</dt><dd>${p.skills.map(escape).join(' / ')}</dd></div>` : ''}</dl><h2 class="profile-work-title">対応できる出演</h2>${tags(p.works)}<a class="button button-primary" href="${castingUrl(p)}" aria-label="${escape(p.name)}への出演を相談する">このモデルの出演を相談する <span aria-hidden="true">↗</span></a><p class="profile-contact-note">出演のご相談はYOLOが窓口となります。</p></div></section>
${p.gallery.length ? `<section class="profile-gallery" aria-labelledby="gallery-title">${kicker('GALLERY')}<h2 id="gallery-title">フォトギャラリー</h2><div>${p.gallery.map(photo => `<figure>${img(photo)}</figure>`).join('')}</div></section>` : ''}
${p.credits.length ? `<section class="profile-credits" aria-labelledby="credits-title">${kicker('WORKS')}<h2 id="credits-title">出演・活動実績</h2><ul>${p.credits.map(credit => `<li>${escape(credit)}</li>`).join('')}</ul></section>` : ''}<p class="profile-back"><a class="talents-text-link" href="/talents/">← モデル一覧へ戻る</a></p></div>${consultation(p)}`;
  return shell({ title: `${p.name} — YOLO公式モデル`, description: `${p.name}のプロフィール。${p.intro}`, pathname: `/talents/${p.slug}/`, body, demo, castingSlug: p.slug });
}

export async function buildTalents({ records, root = ROOT, demo = false } = {}) {
  if (demo && path.resolve(root) === ROOT) throw new Error('Development samples must be generated into an isolated temporary directory.');
  records ??= JSON.parse(await readFile(path.join(ROOT, 'content/talents.json'), 'utf8'));
  const profiles = publishableProfiles(records);
  for (const p of profiles) for (const photo of [p.portrait, ...p.gallery]) await access(path.join(root, photo.src));
  const temporary = path.join(root, '.talents-build');
  await rm(temporary, { recursive: true, force: true });
  await mkdir(temporary, { recursive: true });
  await writeFile(path.join(temporary, 'index.html'), renderListing(profiles, demo));
  for (const p of profiles) {
    await mkdir(path.join(temporary, p.slug));
    await writeFile(path.join(temporary, p.slug, 'index.html'), renderProfile(p, demo));
  }
  // Recreate the entire generated directory, removing revoked or renamed pages.
  await rm(path.join(root, 'talents'), { recursive: true, force: true });
  await rename(temporary, path.join(root, 'talents'));
  return profiles.length;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(`Generated /talents/: ${await buildTalents()} public profiles.`);
