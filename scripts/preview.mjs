import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, buildTalents } from './talents.mjs';
import { createDemo } from './demo.mjs';

// Loopback only, without directory listing or access to source registries or private files.
export async function startPreview({ root = ROOT, port = 4173 } = {}) {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
  const server = createServer(async (req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); res.end(); return; }
    const allowed = pathname === '/' || pathname === '/index.html' || pathname === '/talents' || /^\/(talents|casting|model|history|assets)\//.test(pathname) || /^\/(site|home-light|talent-section|refinement|yolo-tokens|talents|casting)\.(css|js)$/.test(pathname);
    const parts = pathname.split('/');
    if (!allowed || parts.some(p => p.startsWith('.') || p.includes('\\'))) { res.writeHead(404); res.end('Not found'); return; }
    try {
      let target = path.join(root, pathname);
      if ((await stat(target)).isDirectory()) {
        if (!pathname.endsWith('/')) { res.writeHead(308, { Location: pathname + '/' + new URL(req.url, 'http://localhost').search }); res.end(); return; }
        target = path.join(target, 'index.html');
      }
      const bytes = await readFile(target);
      res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
      res.end(bytes);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow' });
      res.end('<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ページが見つかりません | Creative YOLO</title><main><h1>ページが見つかりません</h1><p>公開中のプロフィールは、公式モデル一覧からご確認ください。</p><a href="/talents/">公式モデル一覧へ</a></main></html>');
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const demo = process.argv.includes('--demo');
  if (!demo) await buildTalents();
  const root = demo ? await createDemo() : ROOT;
  const { url } = await startPreview({ root, port: Number(process.env.PORT || 4173) });
  console.log(`${demo ? 'DEVELOPMENT SAMPLES ONLY' : 'Public empty state'}: ${url}/talents/`);
  if (demo) console.log(`Isolated preview directory: ${root}`);
}
