import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildSite } from '../scripts/build.mjs';
import { startPreview } from '../scripts/preview.mjs';

test('deployment build preserves existing pages and excludes source, samples and stale profiles', async t => {
  const output = await mkdtemp(path.join(tmpdir(), 'yolo-public-build-'));
  t.after(() => rm(output, { recursive: true, force: true }));
  await mkdir(path.join(output, 'talents/withdrawn'), { recursive: true });
  await writeFile(path.join(output, 'talents/withdrawn/index.html'), 'stale');
  const { count } = await buildSite({ output });
  assert.equal(count, 0);
  const files = await readdir(output);
  for (const name of ['content', 'scripts', 'tests', 'docs', '.git', '.claude', 'supabase', 'package.json']) assert.ok(!files.includes(name), name);
  assert.ok(!files.includes('talents'), 'public profiles must use the live HUB gateway');
  const { server, url } = await startPreview({ root: output, port: 0 });
  t.after(() => new Promise(resolve => server.close(resolve)));
  for (const route of ['/', '/model/', '/history/', '/casting/', '/talents.css', '/talents.js', '/model/form.js']) assert.equal((await fetch(url + route)).status, 200, route);
  for (const route of ['/content/talents.json', '/scripts/talents.mjs', '/talents/sample-a/', '/talents/withdrawn/']) assert.equal((await fetch(url + route)).status, 404, route);
});

test('every local stylesheet, script and image referenced by built pages is shipped', async t => {
  const output = await mkdtemp(path.join(tmpdir(), 'yolo-public-refs-'));
  t.after(() => rm(output, { recursive: true, force: true }));
  await buildSite({ output });
  const pages = (await readdir(output, { recursive: true })).filter(file => file.endsWith('.html'));
  assert.ok(pages.length >= 4);
  const missing = [];
  for (const page of pages) {
    const html = await readFile(path.join(output, page), 'utf8');
    for (const [, ref] of html.matchAll(/(?:href|src)="(\/[^"#?]*\.(?:css|js|png|jpe?g|webp|svg|ico|txt|xml))(?:[?#][^"]*)?"/g)) {
      try { await readFile(path.join(output, ref)); } catch { missing.push(`${page} → ${ref}`); }
    }
  }
  assert.deepEqual(missing, []);
  for (const file of ['robots.txt', 'sitemap.xml', 'public-navigation.css']) assert.ok((await readFile(path.join(output, file))).length > 0, file);
  const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, /<loc>https:\/\/creativeyolo\.com\/talents\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/creativeyolo\.com\/history\/<\/loc>/);
  assert.equal(sitemap.split('<loc>https://creativeyolo.com/casting/</loc>').length - 1, 1);
});

test('homepage publishes Organization JSON-LD and only confirmed production domains', async t => {
  const output = await mkdtemp(path.join(tmpdir(), 'yolo-public-seo-'));
  t.after(() => rm(output, { recursive: true, force: true }));
  await buildSite({ output });
  const pages = (await readdir(output, { recursive: true })).filter(file => file.endsWith('.html'));
  const htmlByPage = new Map();
  for (const page of pages) htmlByPage.set(page, await readFile(path.join(output, page), 'utf8'));
  for (const [page, html] of htmlByPage) {
    assert.doesNotMatch(html, /yolo-film-festival\.vercel\.app|yolo-magazine\.rencame\.net/, page);
  }
  const top = htmlByPage.get('index.html');
  assert.match(top, /href="https:\/\/festival\.creativeyolo\.com\/"/);
  assert.match(top, /href="https:\/\/magazine\.creativeyolo\.com\/"/);
  for (const host of ['lumina-site-ecru.vercel.app', 'last-call-movie.vercel.app', 'yolo-soudan.vercel.app']) {
    assert.match(top, new RegExp(`https://${host.replaceAll('.', '\\.')}/`));
  }
  const blocks = [...top.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  assert.equal(blocks.length, 1);
  const org = blocks[0];
  assert.deepEqual(Object.keys(org), ['@context', '@type', 'name', 'url', 'logo', 'sameAs']);
  assert.equal(org['@context'], 'https://schema.org');
  assert.equal(org['@type'], 'Organization');
  assert.equal(org.name, 'Creative YOLO');
  assert.equal(org.url, 'https://creativeyolo.com/');
  assert.equal(org.logo, 'https://creativeyolo.com/assets/ogp.png');
  assert.deepEqual(org.sameAs, [
    'https://festival.creativeyolo.com/',
    'https://magazine.creativeyolo.com/',
    'https://community.creativeyolo.com/',
    'https://www.instagram.com/creative.yolo/',
    'https://line.me/R/ti/p/@140irxqh',
  ]);
  for (const value of org.sameAs) assert.match(value, /^https:\/\/[^ ]+$/);
});

test('top page shows listed models with a link to all models, and keeps the original visual when none are listed', async t => {
  const { withFeaturedTalents } = await import('../scripts/build.mjs');
  const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.equal(withFeaturedTalents(source, []), source);
  const output = await mkdtemp(path.join(tmpdir(), 'yolo-public-top-'));
  t.after(() => rm(output, { recursive: true, force: true }));
  await buildSite({ output });
  const top = await readFile(path.join(output, 'index.html'), 'utf8');
  assert.match(top, /<a href="\/talents\/yuka\/"><img src="\/assets\/talents\/yuka\.webp"/);
  assert.match(top, /<a class="talent-featured-all" href="\/talents\/">/);
  assert.doesNotMatch(top, /MODEL<br \/>ACTOR/);
});
