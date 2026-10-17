import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, buildTalents } from './talents.mjs';

// Serve only the built site, never the consent registry or development files.
export async function buildSite({ output = path.join(ROOT, 'dist') } = {}) {
  if (path.resolve(output) === ROOT) throw new Error('Build output must differ from the source directory.');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const file of ['index.html', 'site.css', 'site.js', 'home-light.css', 'talent-section.css', 'refinement.css', 'yolo-tokens.css', 'talents.css', 'talents.js', 'model', 'history', 'assets']) {
    await cp(path.join(ROOT, file), path.join(output, file), { recursive: true });
  }
  const count = await buildTalents({ root: output });
  return { output, count };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { count } = await buildSite();
  console.log(`Built dist/: ${count} public model profiles.`);
}
