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
const consultation = profile => `<section class="talents-booking talents-wrap" id="casting" aria-labelledby="casting-title"><div class="booking-heading">${kicker('FOR CASTING')}<h2 id="casting-title">このモデルに依頼したい。<br>その後の流れをご案内します。</h2><p>写真撮影、広告・PR、映像・MV、イベントなど。対応できる出演内容は、各プロフィールをご確認ください。</p><p>企画内容を伺い、本人の希望や日程、出演条件を確認しながら進めます。</p>${profile ? `<p class="casting-selection">相談するモデル：<strong>${escape(profile.name)}</strong></p>` : ''}</div>
<ol class="booking-steps" aria-label="相談から出演確定までの流れ"><li><span aria-hidden="true">01</span><h3>企画内容を相談</h3><p>希望するモデルと、撮影の目的・内容をお知らせください。モデルが決まっていない場合も、企画のイメージからご相談いただけます。</p></li><li><span aria-hidden="true">02</span><h3>本人の希望・日程を確認</h3><p>出演内容、日程、写真や映像の使い方などについて、本人の希望と対応できる範囲を確認します。</p></li><li><span aria-hidden="true">03</span><h3>見積もり・契約相手を確認</h3><p>出演内容や使用範囲、費用の内訳を確認します。契約する相手と連絡窓口を明示したうえで、必要な条件を調整します。</p></li><li><span aria-hidden="true">04</span><h3>合意後に出演確定</h3><p>関係者が内容と条件に合意したうえで出演を確定し、撮影・出演に進みます。</p></li></ol>
<p class="booking-status-note">ご相談の段階では、出演は確定しません。本人の希望・日程や企画内容により、お受けできない場合があります。</p>
<div class="booking-conditions" aria-labelledby="conditions-title"><h3 id="conditions-title">合意の前に確認すること</h3><dl><div><dt>契約相手・費用・支払条件</dt><dd>契約する相手と窓口、出演料、調整料・交通費などの有無と内訳、支払条件を事前に確認します。</dd></div><div><dt>写真・動画の使用範囲</dt><dd>使用媒体、掲載・使用期間、使用する地域、二次利用、競合に関する条件を確認します。追加利用する場合の扱いも確認します。</dd></div><div><dt>変更・延期・中止の条件</dt><dd>内容や日程を変更する場合の連絡方法、延期・中止時の対応、費用が発生する条件を事前に確認します。</dd></div></dl><p class="booking-consent-note">プロフィールの掲載は、個別の撮影・広告利用への承諾を意味しません。企画ごとに本人の意向と使用範囲を確認します。</p></div>
<div class="booking-request" aria-labelledby="request-info-title"><div><h3 id="request-info-title">ご相談時に教えていただきたいこと</h3><p>決まっている範囲でお知らせください。</p></div><dl class="booking-checklist"><div><dt>撮影の目的・内容</dt><dd>広告、商品撮影、映像作品など。企画の概要や希望するイメージ。</dd></div><div><dt>希望日時</dt><dd>撮影・出演の希望日、時間帯、予定している所要時間。</dd></div><div><dt>撮影・出演場所</dt><dd>エリア、会場やスタジオ、屋内・屋外など。</dd></div><div><dt>使用媒体</dt><dd>Webサイト、SNS、広告、印刷物など。使用する地域、二次利用の予定、競合に関する条件もお知らせください。</dd></div><div><dt>掲載・使用期間</dt><dd>掲載を始めたい時期と、写真や映像を使用する期間。</dd></div><div><dt>ご予算</dt><dd>想定している予算や範囲。未定の場合は、その旨をお知らせください。</dd></div></dl></div>
<div class="talents-casting"><div class="casting-layout"><div><h3>企画に合うモデルを、<br class="mobile-break">一緒に。</h3><p>希望モデルや撮影内容を添えて、YOLOの相談窓口へ。</p><p class="casting-note">フォームからYOLOの運営窓口へお送りいただけます。</p></div><div class="casting-action"><a class="button button-primary" href="/casting/${profile ? `?model=${encodeURIComponent(profile.slug)}` : ''}">制作・出演について相談する <span aria-hidden="true">↗</span></a><button class="casting-copy" type="button" data-copy-brief ${profile ? `data-model-name="${escape(profile.name)}"` : ''} hidden>相談メモをコピー <span aria-hidden="true">↗</span></button><p class="copy-status" role="status" aria-live="polite"></p><textarea class="copy-fallback" aria-label="相談メモ（選択してコピーしてください）" readonly hidden></textarea></div></div></div></section>`;

export function shell({ title, description, pathname, body, demo = false }) {
  return `<!doctype html>
<html lang="ja"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)} | Creative YOLO</title><meta name="description" content="${escape(description)}">
${demo ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${ORIGIN}${pathname}">`}
<meta property="og:type" content="website"><meta property="og:title" content="${escape(title)} | Creative YOLO"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${ORIGIN}${pathname}"><meta property="og:image" content="${ORIGIN}/assets/ogp.png"><meta property="og:locale" content="ja_JP"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#ffffff">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%230b0b0b'/%3E%3Crect x='8' y='30' width='48' height='4' fill='%23ffffff'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600&family=Noto+Sans+JP:wght@400;500;600&family=Shippori+Mincho+B1:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/yolo-tokens.css?v=20260921b"><link rel="stylesheet" href="/site.css?v=20260921b"><link rel="stylesheet" href="/home-light.css?v=20260921b"><link rel="stylesheet" href="/talents.css?v=20261018a"><script src="/talents.js?v=20261018a" defer></script>
</head><body class="home-light talents-page${demo ? ' talents-demo' : ''}">
<a class="skip-link" href="#main">本文へ移動</a>
${demo ? '<div class="demo-notice">開発用プレビュー · すべて架空のサンプルです。公式認定・掲載を示すものではありません。</div>' : ''}
<header class="site-header talents-header"><a class="brand" href="/" aria-label="Creative YOLO トップへ"><span class="brand-mark" aria-hidden="true"></span><span class="brand-name">Creative YOLO</span></a><nav class="talents-nav" aria-label="メインナビゲーション"><a href="/talents/"${pathname === '/talents/' ? ' aria-current="page"' : ''}>公式モデル</a><a href="/model/">応募する</a><a class="talents-nav-cta" href="#casting">制作・出演のご相談 <span aria-hidden="true">↗</span></a></nav></header>
<main id="main">${body}</main>
<footer class="talents-footer"><div class="talents-wrap"><a class="brand-name" href="/">Creative YOLO</a><nav aria-label="フッター"><a href="/">YOLOについて</a><a href="/talents/">公式モデル</a><a href="/model/">モデル・俳優募集</a></nav><p>© Creative YOLO</p></div></footer>
</body></html>\n`;
}

export function renderListing(profiles, demo = false) {
  const cards = profiles.map(p => {
    const labels = [...p.categories.map(key => CATEGORIES[key]), ...p.works.map(key => WORKS[key][1])].slice(0, 2);
    return `<article class="talent-card" data-work="${p.works.join(' ')}" data-category="${p.categories.join(' ')}"><a href="/talents/${escape(p.slug)}/"><div class="talent-card-photo">${img(p.portrait, true)}${demo ? '<span class="talent-sample-label">SAMPLE</span>' : ''}</div><div class="talent-card-caption"><p lang="en">${escape(p.romanName)}</p><h3>${escape(p.name)}</h3></div><ul class="talent-card-tags" aria-label="ジャンル・出演内容">${labels.map(label => `<li>${label}</li>`).join('')}</ul><span class="talent-profile-link">プロフィールを見る <span aria-hidden="true">↗</span></span></a></article>`;
  }).join('');
  const body = `<section class="talents-hero talents-wrap">${kicker('YOLO TALENTS')}<h1>その人らしさが、<br>ブランドの力になる。</h1><p class="talents-lead">一人ひとりの表現を育て、外部の撮影・出演へつなぐことを目指して。</p></section>
<section class="talents-directory talents-wrap" id="models" aria-labelledby="models-title"><div class="talents-directory-toolbar"><h2 id="models-title"><span lang="en">MODEL</span><span>モデルを探す</span></h2>${profiles.length ? `<div class="talents-filters" role="group" aria-label="ジャンルで絞り込む" hidden><button type="button" data-category-filter="all" aria-pressed="true">すべて</button>${Object.entries(CATEGORIES).map(([key, label]) => `<button type="button" data-category-filter="${key}" aria-pressed="false">${label}</button>`).join('')}</div>` : ''}</div>
${profiles.length ? `<details class="talents-extra-filters" hidden><summary>出演内容でも絞り込む</summary><div class="talents-filters" role="group" aria-label="出演内容で絞り込む"><button type="button" data-filter="all" aria-pressed="true">出演内容すべて</button>${Object.entries(WORKS).map(([key, value]) => `<button type="button" data-filter="${key}" aria-pressed="false">${value[1]}</button>`).join('')}</div></details><p class="talents-result" role="status" aria-live="polite">${profiles.length}名のプロフィール</p><div class="talents-grid">${cards}</div><div class="talents-empty" data-filter-empty hidden><h3>条件に合うモデルが見つかりませんでした。</h3><p>ほかのジャンル・出演内容を選ぶか、企画に合うモデルについてご相談ください。</p><button class="talents-text-link" type="button" data-reset-filter>すべてのモデルを見る →</button></div>${demo ? '<p class="talents-sample-note">掲載の人物・プロフィールはすべてデザイン検討用の架空サンプルです。</p>' : ''}` : `<div class="talents-empty"><h3>プロフィールは、公開準備が整い次第ご紹介します。</h3><p>現在、公開中のプロフィールはありません。<br>写真・映像・広告・イベントの撮影・出演は、下の窓口からご相談いただけます。</p><a class="talents-text-link" href="#casting">仕事の相談について見る →</a></div>`}</section>
<section class="talents-growth talents-wrap" id="growth" aria-labelledby="growth-title"><div class="growth-heading">${kicker('EXPERIENCE & GROWTH')}<h2 id="growth-title">経験を重ね、<br>表現を育てる。</h2><p>YOLOは、モデルの成長を支え、外部の撮影・出演につなぐ活動のかたちを目指しています。</p></div><div class="growth-content"><article><p class="growth-label">これまでの活動</p><h3>活動の記録から知る、YOLO。</h3><p>撮影会や映像制作など、YOLOのクリエイティブ活動は公式サイトの活動紹介・記録でご覧いただけます。</p><div class="growth-links"><a class="talents-text-link" href="/#projects">YOLOの活動を見る ↗</a><a class="talents-text-link" href="/history/">これまでの活動記録 ↗</a></div><p class="growth-note">モデル個人の実績は、確認・掲載同意が整ったものからプロフィールでご紹介します。</p></article><article><p class="growth-label">これから目指すこと</p><h3>一人ひとりの成長を、次の出演へ。</h3><p>撮影や表現の経験を重ねながら、それぞれの魅力を育て、企画に合う外部の撮影・出演につなげる体制づくりを目指します。</p></article></div></section>
${consultation()}`;
  return shell({ title: 'YOLO TALENTS｜公式モデル', description: 'YOLO公式モデルのプロフィールと対応できる出演内容をご紹介。活動の記録と、写真・映像・広告・イベントの出演依頼についてご案内します。', pathname: '/talents/', body, demo });
}

export function renderProfile(p, demo = false) {
  const body = `<div class="talents-wrap"><nav class="talents-breadcrumb" aria-label="パンくず"><a href="/talents/">公式モデル</a><span aria-hidden="true">/</span><span aria-current="page">${escape(p.name)}</span></nav><section class="talents-profile" aria-labelledby="profile-name"><figure class="profile-portrait">${img(p.portrait, true)}</figure><div class="profile-info">${kicker(demo ? 'MODEL / DEVELOPMENT SAMPLE' : 'YOLO OFFICIAL MODEL')}<p class="profile-roman" lang="en">${escape(p.romanName)}</p><h1 id="profile-name">${escape(p.name)}</h1><p class="profile-intro">${escape(p.intro)}</p><dl class="profile-facts"><div><dt>活動エリア</dt><dd>${escape(p.area)}</dd></div>${p.height ? `<div><dt>身長</dt><dd>${p.height} cm</dd></div>` : ''}${p.skills.length ? `<div><dt>特技・好きなこと</dt><dd>${p.skills.map(escape).join(' / ')}</dd></div>` : ''}</dl><h2 class="profile-work-title">対応できる出演</h2>${tags(p.works)}<a class="button button-primary" href="#casting">${escape(p.name)}への出演を相談する <span aria-hidden="true">↓</span></a></div></section>
${p.gallery.length ? `<section class="profile-gallery" aria-labelledby="gallery-title">${kicker('MORE EXPRESSIONS')}<h2 id="gallery-title">フォトギャラリー</h2><div>${p.gallery.map(photo => `<figure>${img(photo)}</figure>`).join('')}</div></section>` : ''}
${p.credits.length ? `<section class="profile-credits" aria-labelledby="credits-title">${kicker('SELECTED WORKS')}<h2 id="credits-title">出演・活動実績</h2><ul>${p.credits.map(credit => `<li>${escape(credit)}</li>`).join('')}</ul></section>` : ''}<p class="profile-back"><a class="talents-text-link" href="/talents/">← 公式モデル一覧へ戻る</a></p></div>${consultation(p)}`;
  return shell({ title: `${p.name} — YOLO公式モデル`, description: `${p.name}のプロフィール。${p.intro}`, pathname: `/talents/${p.slug}/`, body, demo });
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
