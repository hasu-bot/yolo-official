const DEFAULT_HUB = "https://yolo-members.vercel.app";
export const hubOrigin = () => process.env.TALENTS_HUB_ORIGIN || DEFAULT_HUB;
const text = (value, max = 1200) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;
const array = (value, allowed) =>
  Array.isArray(value) &&
  value.length <= 20 &&
  value.every((v) => allowed.includes(v));
// Accept only the HUB's explicit projection. Never render raw source objects.
export function publicProfiles(value, origin = DEFAULT_HUB) {
  if (!Array.isArray(value)) throw new Error("Invalid public profiles");
  const seen = new Set();
  return value.map((p) => {
    if (
      !p ||
      !text(p.slug, 70) ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) ||
      seen.has(p.slug)
    )
      throw new Error("Invalid slug");
    for (const key of ["name", "romanName", "intro", "area"])
      if (!text(p[key])) throw new Error("Invalid text");
    if (
      !array(p.works, ["photo", "film", "ad", "event"]) ||
      !p.works.length ||
      !array(p.categories, ["fashion", "beauty", "lifestyle"])
    )
      throw new Error("Invalid categories");
    if (
      p.height != null &&
      (!Number.isInteger(p.height) || p.height < 100 || p.height > 250)
    )
      throw new Error("Invalid height");
    function photo(v) {
      if (
        !v ||
        !text(v.alt, 200) ||
        typeof v.src !== "string" ||
        !/^\/api\/talents\/photos\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(
          v.src,
        )
      )
        throw new Error("Invalid photo");
      return { src: origin + v.src, alt: v.alt };
    }
    if (!Array.isArray(p.gallery) || p.gallery.length > 20)
      throw new Error("Invalid gallery");
    for (const key of ["skills", "credits"])
      if (
        !Array.isArray(p[key]) ||
        p[key].length > 20 ||
        !p[key].every((v) => text(v))
      )
        throw new Error("Invalid profile list");
    seen.add(p.slug);
    return {
      slug: p.slug,
      name: p.name,
      romanName: p.romanName,
      intro: p.intro,
      area: p.area,
      ...(p.height ? { height: p.height } : {}),
      works: [...p.works],
      categories: [...p.categories],
      portrait: photo(p.portrait),
      gallery: p.gallery.map(photo),
      skills: [...p.skills],
      credits: [...p.credits],
    };
  });
}
export async function getPublicProfiles(slug) {
  const origin = hubOrigin();
  const url = new URL("/api/talents", origin);
  if (slug) url.searchParams.set("slug", slug);
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("HUB unavailable");
  const json = await response.json();
  return publicProfiles(json.profiles, origin);
}
