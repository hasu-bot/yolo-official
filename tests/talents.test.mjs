import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { publishableProfiles, buildTalents, renderProfile } from '../scripts/talents.mjs';
import { sampleRecord } from '../scripts/demo.mjs';
import { startPreview } from '../scripts/preview.mjs';
const clone = value => structuredClone(value);

test('publication gate omits applicants, pending consent and unconfirmed content', () => {
  const original = sampleRecord();
  for (const [key, value] of [['status', 'pending'], ['consent', 'pending'], ['profileConfirmed', false], ['photosConfirmed', false]]) {
    const record = clone(original); record.publication[key] = value;
    record.profile.intro = 'PRIVATE_APPLICANT_MUST_NEVER_SHIP';
    assert.deepEqual(publishableProfiles([record]), []);
  }
  assert.deepEqual(publishableProfiles([{}, { profile: { email: 'PRIVATE' } }]), []);
});

test('published profiles require dated/versioned consent and guardian evidence for minors', () => {
  for (const key of ['consentVersion', 'consentRecordedAt', 'isMinor']) {
    const record = sampleRecord(); delete record.publication[key];
    assert.throws(() => publishableProfiles([record]));
  }
  const minor = sampleRecord(); minor.publication.isMinor = true;
  assert.throws(() => publishableProfiles([minor]));
  minor.publication.guardianConsentRecordedAt = '2026-10-15';
  assert.equal(publishableProfiles([minor]).length, 1);
});

test('public field allowlist rejects private fields, duplicate and unsafe slugs, remote photos', () => {
  for (const key of ['email', 'legalName', 'dateOfBirth', 'privateNotes', 'phone']) {
    const record = sampleRecord(); record.profile[key] = 'PRIVATE';
    assert.throws(() => publishableProfiles([record]));
  }
  for (const slug of ['../secret', 'index.html', 'Name', 'sample/secret']) {
    const record = sampleRecord(); record.profile.slug = slug;
    assert.throws(() => publishableProfiles([record]));
  }
  assert.throws(() => publishableProfiles([sampleRecord(), sampleRecord()]));
  const category = sampleRecord(); category.profile.categories = ['not-a-category'];
  assert.throws(() => publishableProfiles([category]));
  const remote = sampleRecord(); remote.profile.portrait.src = 'https://example.com/private.jpg';
  assert.throws(() => publishableProfiles([remote]));
});

test('generated profile escapes content instead of executing supplied HTML', () => {
  const record = sampleRecord(); record.profile.name = '<script>alert("x")</script>';
  const html = renderProfile(publishableProfiles([record])[0]);
  assert.ok(!html.includes('<script>alert'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('consentRecordedAt'));
});

test('build removes revoked pages, excludes unpublished data, and stops on missing photos', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'yolo-talents-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const record = sampleRecord();
  await mkdir(path.join(root, 'assets/talents'), { recursive: true });
  await writeFile(path.join(root, record.profile.portrait.src), 'test photo existence');
  await buildTalents({ records: [record], root });
  assert.match(await readFile(path.join(root, 'talents/sample-a/index.html'), 'utf8'), /SAMPLE A/);
  const pending = sampleRecord('private-person'); pending.publication.consent = 'pending'; pending.profile.intro = 'PRIVATE_APPLICANT_MUST_NEVER_SHIP';
  await buildTalents({ records: [pending], root });
  assert.deepEqual(await readdir(path.join(root, 'talents')), ['index.html']);
  assert.ok(!(await readFile(path.join(root, 'talents/index.html'), 'utf8')).includes('PRIVATE_APPLICANT'));
  const missing = sampleRecord('missing');
  await assert.rejects(buildTalents({ records: [missing], root }));
});

test('preview uses real static routes; unknown and unpublished profiles never return a page', async t => {
  const { server, url } = await startPreview({ port: 0 });
  t.after(() => new Promise(resolve => server.close(resolve)));
  for (const route of ['/talents/', '/model/', '/talents.css', '/talents.js']) assert.equal((await fetch(url + route)).status, 200, route);
  for (const route of ['/talents/private-person/', '/talents/sample-a/', '/content/talents.json', '/scripts/demo.mjs', '/.git/config']) assert.equal((await fetch(url + route)).status, 404, route);
});
