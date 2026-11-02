import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { startPreview } from "../scripts/preview.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = path.resolve(process.env.EVIDENCE_DIR || "../evidence");
await mkdir(output, { recursive: true });
const preview = await startPreview({ port: 0 });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  let attempts = 0;
  const keys = [];
  let mode = "failure";
  await page.route(
    "https://yolo-members.vercel.app/api/casting",
    async (route) => {
      if (route.request().method() === "OPTIONS")
        return route.fulfill({
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": preview.url,
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
          },
        });
      attempts++;
      const body = route.request().postDataJSON();
      assert.equal(body.modelSlug, "sample-b");
      assert.equal(body.privacyConsent, true);
      assert.equal(body.budget, "未定");
      keys.push(route.request().headers()["idempotency-key"]);
      await route.fulfill({
        status: mode === "success" ? 201 : 503,
        headers: {
          "Access-Control-Allow-Origin": preview.url,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          mode === "success"
            ? { ok: true, receipt: "TEST-RECEIPT-ONLY" }
            : { message: "受付を確認できませんでした。再度お試しください。" },
        ),
      });
    },
  );
  await page.route("**/api/talent-selection?slug=sample-b", (route) =>
    route.fulfill({ json: { name: "検証用モデル（架空）" } }),
  );
  await page.goto(preview.url + "/casting/?model=sample-b");
  await page.waitForFunction(() =>
    document
      .querySelector("#selected-model")
      .textContent.includes("検証用モデル"),
  );
  assert.match(await page.locator("#selected-model").innerText(), /検証用モデル/);
  await page.getByRole("button", { name: "出演の相談を送信する" }).click();
  assert.equal(attempts, 0);
  results.push("native required-field validation prevents incomplete requests");
  for (const [key, value] of Object.entries({
    name: "ブラウザ検証（架空）",
    organization: "検証用",
    email: "test@example.invalid",
    purpose: "ローカル動作確認",
    schedule: "未定",
    location: "未定",
    budget: "未定",
    media: "Web",
    period: "未定",
  }))
    await page.locator(`[name=${key}]`).fill(value);
  await page.locator("[name=privacyConsent]").check();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}`,
    );
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await settle(page);
  await page.screenshot({
    path: path.join(output, "casting-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await settle(page);
  await page.screenshot({
    path: path.join(output, "casting-mobile.png"),
    fullPage: true,
  });
  results.push("320/390/768/1440px casting form has no horizontal overflow");
  await page.getByRole("button", { name: "出演の相談を送信する" }).click();
  await page.waitForFunction(() =>
    document
      .querySelector("#casting-status")
      .textContent.includes("再度お試し"),
  );
  assert.equal(
    await page.locator("[name=purpose]").inputValue(),
    "ローカル動作確認",
  );
  mode = "success";
  await page.getByRole("button", { name: "出演の相談を送信する" }).click();
  await page.waitForFunction(() =>
    document
      .querySelector("#casting-status")
      .textContent.includes("TEST-RECEIPT-ONLY"),
  );
  assert.equal(await page.locator("fieldset[disabled]").count(),3);
  assert.equal(keys.length, 2);
  assert.equal(keys[0], keys[1]);
  assert.equal(await page.locator("[name=name]").isDisabled(), true);
  results.push(
    "simulated failure preserves input; retry keeps idempotency key; successful receipt locks form",
  );
  const api = await context.request.get(
    "http://127.0.0.1:3000/api/admin/talents",
  );
  assert.equal(api.status(), 401);
  assert.match(api.headers()["cache-control"], /no-store/);
  const self = await context.request.get("http://127.0.0.1:3000/api/my/talent");
  assert.equal(self.status(), 401);
  const hidden = await context.request.get(
    "http://127.0.0.1:3000/api/talents/photos/11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222.jpg",
  );
  assert.equal(hidden.status(), 404);
  assert.match(hidden.headers()["cache-control"], /no-store/);
  const invalid = await context.request.post(
    "http://127.0.0.1:3000/api/casting",
    { headers: { Origin: "https://yolo-official.vercel.app" }, data: {} },
  );
  assert.equal(invalid.status(), 400);
  const denied = await context.request.post(
    "http://127.0.0.1:3000/api/casting",
    { headers: { Origin: "https://example.invalid" }, data: {} },
  );
  assert.equal(denied.status(), 403);
  const preflight = await context.request.fetch(
    "http://127.0.0.1:3000/api/casting",
    {
      method: "OPTIONS",
      headers: { Origin: "https://yolo-official.vercel.app" },
    },
  );
  assert.equal(preflight.status(), 204);
  assert.equal(
    preflight.headers()["access-control-allow-origin"],
    "https://yolo-official.vercel.app",
  );
  results.push(
    "real local HUB endpoints: anonymous admin/self denied, hidden photo denied, validation 400, foreign origin 403, valid preflight 204",
  );
  await page.goto("http://127.0.0.1:3000/my/talent");
  await page.getByRole("button", { name: "Discordでログイン" }).waitFor();
  await settle(page);
  await page.screenshot({
    path: path.join(output, "hub-self-logged-out-mobile.png"),
    fullPage: true,
  });
  results.push(
    "HUB publication management prompts unauthenticated owner to sign in",
  );
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto(preview.url + "/casting/");
  assert.equal(
    await noJsPage
      .getByRole("button", { name: "出演の相談を送信する" })
      .isDisabled(),
    true,
  );
  assert.equal(await noJsPage.locator("form").getAttribute("method"), "post");
  await noJs.close();
  results.push(
    "without JavaScript, submit is disabled and HTML form uses POST",
  );
  await context.close();
  await writeFile(
    path.join(output, "casting-browser-results.json"),
    JSON.stringify(
      {
        results,
        submission:
          "Browser success/error responses simulated; no external submission. HUB HTTP authorization/validation checks use the real local Next server.",
      },
      null,
      2,
    ),
  );
  for (const result of results) console.log("PASS " + result);
} finally {
  await browser.close();
  await new Promise((resolve) => preview.server.close(resolve));
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.activeElement?.blur();
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
}
