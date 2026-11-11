import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { ROOT, publishableProfiles, escape } from './talents.mjs';
import { renderCasting } from './casting.mjs';

// Serve only the built site, never the consent registry or development files.
const TALENT_VISUAL = `<div class="talent-visual" data-reveal aria-hidden="true">
          <div class="talent-word">MODEL<br />ACTOR</div>
        </div>`;
// Top page #talent: show listed models (up to 3) with a link to all of them.
// With no listed model the decorative word stays; never publish an empty frame (31 §4-5).
export function withFeaturedTalents(html, profiles) {
  if (html.split(TALENT_VISUAL).length !== 2) throw new Error('Top page talent visual anchor not found.');
  if (!profiles.length) return html;
  const cards = profiles.slice(0, 3).map(p => `<li><a href="/talents/${escape(p.slug)}/"><img src="${escape(p.portrait.src)}" alt="${escape(p.portrait.alt)}" width="900" height="1200" loading="lazy" decoding="async"><span class="talent-featured-name">${escape(p.name)}</span><span class="talent-featured-roman" lang="en">${escape(p.romanName)}</span></a></li>`).join('');
  return html.replace(TALENT_VISUAL, `<div class="talent-visual talent-featured" data-reveal>
          <p class="talent-featured-label" lang="en">YOLO OFFICIAL MODELS</p>
          <ul class="talent-featured-list" aria-label="公式モデル">${cards}</ul>
          <a class="talent-featured-all" href="/talents/"><span lang="en">VIEW ALL TALENTS</span> →</a>
        </div>`);
}

export async function buildSite({ output = path.join(ROOT, 'dist') } = {}) {
  if (path.resolve(output) === ROOT) throw new Error('Build output must differ from the source directory.');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const file of ['index.html', 'site.css', 'site.js', 'home-light.css', 'talent-section.css', 'refinement.css', 'yolo-tokens.css', 'talents.css', 'talents.js', 'casting.js', 'casting.css', 'casting', 'model', 'history', 'assets', 'public-navigation.css', 'robots.txt']) {
    await cp(path.join(ROOT, file), path.join(output, file), { recursive: true });
  }
  await writeFile(path.join(output, 'casting/index.html'), renderCasting());
  // /casting/ is rendered at build time. Repository-published profiles are known then too.
  const local = publishableProfiles(JSON.parse(await readFile(path.join(ROOT, 'content/talents.json'), 'utf8')));
  const top = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  await writeFile(path.join(output, 'index.html'), withFeaturedTalents(top, local));
  const urls = ['/casting/', '/talents/', ...local.map(p => `/talents/${p.slug}/`)].map(u => `  <url><loc>https://creativeyolo.com${u}</loc></url>`).join('\n');
  const sitemap = await readFile(path.join(ROOT, 'sitemap.xml'), 'utf8');
  await writeFile(path.join(output, 'sitemap.xml'), sitemap.replace('</urlset>', `${urls}\n</urlset>`));
  // Public profiles are rendered from the HUB on every request. Never ship a stale registry.
  const count = 0;
  return { output, count };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { count } = await buildSite();
  console.log(`Built dist/: ${count} public model profiles.`);
}
