import { getPublicProfiles } from "../lib/public-talents.js";
export default async function handler(request, response) {
  for (const name of [
    "Cache-Control",
    "CDN-Cache-Control",
    "Vercel-CDN-Cache-Control",
  ])
    response.setHeader(name, "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ message: "Method not allowed" });
  }
  const slug = request.query?.slug;
  if (
    typeof slug !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    slug.length > 70
  )
    return response.status(404).json({ message: "Not found" });
  try {
    const profiles = await getPublicProfiles(slug);
    if (!profiles.length)
      return response.status(404).json({ message: "Not found" });
    return response.status(200).json({ name: profiles[0].name });
  } catch {
    return response.status(503).json({ message: "Unavailable" });
  }
}
