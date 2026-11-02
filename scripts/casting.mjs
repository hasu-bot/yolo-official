import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ROOT, shell } from "./talents.mjs";

const fields = {
  purpose: [
    "企画の目的・出演内容",
    "textarea",
    2000,
    "例：店舗のWebサイトやSNSに掲載する写真の撮影",
    "撮影の目的や、希望するイメージをお知らせください。",
  ],
  schedule: ["希望日程・所要時間", "text", 300, "例：11月上旬、半日程度／未定"],
  location: ["撮影・出演場所", "text", 300, "例：熊本市内の店舗／未定"],
  budget: [
    "ご予算",
    "text",
    300,
    "例：金額の目安・範囲／未定",
    "金額の目安や範囲を、決まっているところからご記入ください。",
  ],
  media: [
    "使用する媒体・地域",
    "textarea",
    500,
    "例：Webサイト、SNS、チラシなど",
    "使用する地域や、二次利用の予定がある場合もお知らせください。",
  ],
  period: ["掲載・使用期間", "text", 300, "例：公開から3か月間／未定"],
  name: ["お名前・ご担当者名", "text", 100, "", "", "name"],
  organization: ["会社・団体名", "text", 200, "", "", "organization"],
  email: [
    "メールアドレス",
    "email",
    254,
    "",
    "YOLOからのご連絡に使用します。",
    "email",
  ],
};
const field = (key) => {
  const [label, type, max, placeholder, note, autocomplete] = fields[key];
  const required = key !== "organization";
  const attributes = `id="casting-${key}" name="${key}" maxlength="${max}" ${required ? "required" : ""} ${autocomplete ? `autocomplete="${autocomplete}"` : ""} ${placeholder ? `placeholder="${placeholder}"` : ""} ${note ? `aria-describedby="${key}-note"` : ""}`;
  return `<div class="casting-field casting-field-${key}"><label for="casting-${key}">${label}<span class="required">${required ? "必須" : "任意"}</span></label>${type === "textarea" ? `<textarea ${attributes}></textarea>` : `<input type="${type}" ${attributes}>`}${note ? `<p class="field-note" id="${key}-note">${note}</p>` : ""}</div>`;
};
export function renderCasting() {
  const body = `<section class="talents-wrap casting-intro">
    <p class="talents-kicker">YOLO TALENTS / CASTING</p><h1>出演のご相談</h1>
    <p>写真・映像・広告・イベントへの出演について、YOLOが窓口となって承ります。<br>モデルが決まっていない場合も、企画のイメージからお聞かせください。</p>
    <p class="casting-notice">ご相談の送信時点では、出演は確定しません。本人の希望・日程や条件を確認したうえで進めます。</p>
    <a href="/talents/" class="talents-text-link">モデル一覧を見る <span aria-hidden="true">↗</span></a>
    <details class="casting-guide"><summary>相談から出演までの流れ・確認事項</summary>
      <ol class="casting-steps"><li><h2><span>01</span> ご相談</h2><p>企画内容、日程、場所、ご予算、使用媒体・期間をお知らせください。未定の項目は、その旨をご記入いただけます。</p></li><li><h2><span>02</span> 内容・条件の確認</h2><p>YOLOが本人の希望・日程を確認します。契約相手、出演料・交通費などの費用と支払条件、使用範囲を調整します。</p></li><li><h2><span>03</span> 合意後に出演確定</h2><p>関係者が内容と条件に合意したうえで出演が確定します。企画内容や日程により、お受けできない場合もあります。</p></li></ol>
      <dl class="casting-conditions"><div><dt>写真・動画の使用範囲</dt><dd>使用媒体・使用期間・地域、二次利用、競合に関する条件を確認します。プロフィール掲載への同意は、個別の広告利用への承諾とは別のものです。</dd></div><div><dt>変更・延期・中止</dt><dd>日程や内容の変更、延期・中止時の連絡方法と、費用が発生する条件を事前に確認します。</dd></div></dl>
    </details>
  </section>
  <form id="casting-form" class="casting-form" method="post" action="https://yolo-members.vercel.app/api/casting">
    <p class="form-intro">必須項目をご入力ください。日程・場所・予算・使用予定が未定の場合は「未定」とご記入ください。</p>
    <fieldset><legend><span>01</span> 企画について</legend><p id="selected-model" class="casting-selected">希望モデル：指定なし</p><input type="hidden" name="modelSlug" value="">${field("purpose")}<div class="form-grid">${field("schedule")}${field("location")}</div>${field("budget")}</fieldset>
    <fieldset><legend><span>02</span> 写真・映像の使用予定</legend>${field("media")}${field("period")}</fieldset>
    <fieldset><legend><span>03</span> ご連絡先</legend><div class="form-grid">${field("name")}${field("organization")}</div>${field("email")}
    <div class="honey" aria-hidden="true"><label>ウェブサイト<input name="website" tabindex="-1" autocomplete="off"></label></div>
    <div class="consent-box"><label><input name="privacyConsent" type="checkbox" required> お名前・連絡先・ご相談内容を、YOLOが受付・連絡・出演条件の調整のために利用することに同意します。入力内容は運営の管理画面で確認し、モデル本人への直接送信は行いません。モデルに相談内容を共有する際は必要な範囲で確認します。</label></div></fieldset>
    <button type="submit" disabled class="button button-primary">出演の相談を送信する <span aria-hidden="true">→</span></button><p id="casting-status" role="status" aria-live="polite" tabindex="-1"></p>
    <noscript><p>このフォームの送信にはJavaScriptが必要です。<a href="https://yolo-soudan.vercel.app/">YOLOの相談窓口</a>もご利用いただけます。</p></noscript>
  </form>`;
  return shell({
    title: "出演のご相談｜YOLO TALENTS",
    description:
      "YOLO公式モデルの写真・映像・広告・イベントへの出演相談。モデルの指名がなくても、企画内容からYOLOへご相談いただけます。",
    pathname: "/casting/",
    body,
  })
    .replace(
      "</head>",
      '<link rel="stylesheet" href="/casting.css?v=20261018b"><script src="/casting.js?v=20261018b" defer></script></head>',
    )
    .replace(
      'class="home-light talents-page"',
      'class="home-light talents-page casting-page"',
    );
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await writeFile(path.join(ROOT, "casting/index.html"), renderCasting());
