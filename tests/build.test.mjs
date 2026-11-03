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
});
