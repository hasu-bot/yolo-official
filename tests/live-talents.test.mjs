import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/talents-page.js";
import { publicProfiles } from "../lib/public-talents.js";
const id = "11111111-1111-4111-8111-111111111111";
const file = "22222222-2222-4222-8222-222222222222.jpg";
const row = {
  id,
  slug: "test-person",
  name: "<script>not executable</script>",
  romanName: "TEST",
  intro: "Test only",
  area: "Test",
  height: 165,
  works: ["photo"],
  categories: ["fashion"],
  portrait: { src: `/api/talents/photos/${id}/${file}`, alt: "Test image" },
  gallery: [],
  skills: [],
  credits: [],
  email: "PRIVATE",
  consent_at: "PRIVATE",
};
function response() {
  return {
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(v) {
      this.statusCode = v;
      return this;
    },
    send(v) {
      this.body = v;
      return this;
    },
    end() {
      return this;
    },
  };
}
test("HUB public contract strips private fields and rejects unexpected photo origins", () => {
  const [p] = publicProfiles([row]);
  assert.equal(p.email, undefined);
  assert.equal(p.id, undefined);
  assert.equal(p.consent_at, undefined);
  assert.match(
    p.portrait.src,
    /^https:\/\/yolo-members\.vercel\.app\/api\/talents\/photos\//,
  );
  assert.throws(() =>
    publicProfiles([
      {
        ...row,
        portrait: { src: "https://example.invalid/private.jpg", alt: "test" },
      },
    ]),
  );
  assert.throws(() => publicProfiles([{ ...row, slug: "../private" }]));
});
test("live page renders public data, escapes text, and disables all caches", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  let init;
  globalThis.fetch = async (_, options) => {
    init = options;
    return Response.json({ profiles: [row] });
  };
  const res = response();
  await handler(
    {
      method: "GET",
      url: "/api/talents-page?slug=test-person",
      query: { slug: "test-person" },
    },
    res,
  );
  assert.equal(res.statusCode, 200);
  assert.match(res.body, /&lt;script&gt;not executable/);
  assert.ok(!res.body.includes("PRIVATE"));
  assert.match(res.headers["Cache-Control"], /no-store/);
  assert.equal(res.headers["Vercel-CDN-Cache-Control"], "no-store");
  assert.equal(init.cache, "no-store");
  assert.ok(res.body.includes("/casting/?model=test-person"));
});
test("revoked direct URLs return generic 404 and upstream outage returns 503", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  globalThis.fetch = async () => Response.json({ profiles: [] });
  const res = response();
  await handler(
    { method: "GET", url: "/talents/hidden", query: { slug: "hidden" } },
    res,
  );
  assert.equal(res.statusCode, 404);
  assert.ok(!res.body.includes("/talents/hidden"));
  globalThis.fetch = async () => new Response("", { status: 503 });
  const failed = response();
  await handler({ method: "GET", url: "/talents/", query: {} }, failed);
  assert.equal(failed.statusCode, 503);
  assert.ok(!failed.body.includes("公開中のプロフィールはありません"));
});
