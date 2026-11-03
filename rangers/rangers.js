// YOLO RANGERS: show the visitor's own registration state when they are signed in to YOLO HUB.
// creativeyolo.com and community.creativeyolo.com are the same site, so the HUB session cookie is sent.
// Any failure keeps the default "join" CTA, which leads to the HUB page that shows the real state.
(function () {
  var HUB = "https://community.creativeyolo.com";
  var ctas = document.querySelectorAll("[data-rangers-cta]");
  var status = document.querySelector("[data-rangers-status]");
  if (!ctas.length || !window.fetch || location.hostname !== "creativeyolo.com") return;
  fetch(HUB + "/api/rangers", { credentials: "include", cache: "no-store" })
    .then(function (response) { return response.ok ? response.json() : null; })
    .then(function (state) {
      if (!state || !state.registration || state.registration.status !== "active") return;
      ctas.forEach(function (cta) { cta.textContent = "参加登録済み｜登録内容を見る →"; });
      if (status) status.textContent = "あなたはYOLO RANGERSに参加登録済みです。活動の案内はDiscordで届きます。登録内容の確認・解除はYOLO HUBから行えます。";
    })
    .catch(function () { /* keep the default CTA */ });
})();
