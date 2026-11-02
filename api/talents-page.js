import { getPublicProfiles } from "../lib/public-talents.js";
import { renderListing, renderProfile, shell } from "../scripts/talents.mjs";
export default async function handler(request, response) {
  response.setHeader("Cache-Control", "private, no-store, max-age=0");
  response.setHeader("CDN-Cache-Control", "no-store");
  response.setHeader("Vercel-CDN-Cache-Control", "no-store");
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    return response.status(405).end();
  }
  const url = new URL(request.url, "https://yolo-official.vercel.app");
  const slug = request.query?.slug ?? url.searchParams.get("slug");
  if (
    slug &&
    (typeof slug !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      slug.length > 70)
  )
    return response.status(404).send(unavailable(false));
  try {
    const profiles = await getPublicProfiles(slug);
    if (slug && !profiles.length)
      return response.status(404).send(unavailable(false));
    return response
      .status(200)
      .send(slug ? renderProfile(profiles[0]) : renderListing(profiles));
  } catch {
    return response.status(503).send(unavailable(true));
  }
}
function unavailable(retry) {
  return shell({
    title: retry ? "プロフィールを取得できません" : "ページが見つかりません",
    description: "YOLO TALENTS",
    pathname: "/talents/",
    body: `<section class="talents-wrap talents-empty"><h1>${retry ? "プロフィールを取得できませんでした。" : "ページが見つかりません。"}</h1><p>${retry ? "時間をおいて再度お試しください。" : "公開中のプロフィールは一覧からご確認ください。"}</p><a href="/talents/">モデル一覧へ</a><p><a href="/casting/">キャスティングのご相談</a></p></section>`,
  });
}
