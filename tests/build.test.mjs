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
  assert.deepEqual(await readdir(path.join(output, 'talents')), ['index.html']);
  const html = await readFile(path.join(output, 'talents/index.html'), 'utf8');
  assert.match(html, /公開中のプロフィールはありません/);
  assert.ok(!html.includes('サンプル A'));
  const { server, url } = await startPreview({ root: output, port: 0 });
  t.after(() => new Promise(resolve => server.close(resolve)));
  for (const route of ['/', '/model/', '/history/', '/talents/', '/talents.css', '/talents.js', '/model/form.js']) assert.equal((await fetch(url + route)).status, 200, route);
  for (const route of ['/content/talents.json', '/scripts/talents.mjs', '/talents/sample-a/', '/talents/withdrawn/']) assert.equal((await fetch(url + route)).status, 404, route);
});
