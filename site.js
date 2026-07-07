/*
 * Creative YOLO 公式サイト 共通JS
 *
 * ▼▼▼ 公開前に必ず設定（1箇所だけ）▼▼▼
 * Discord の招待URL（https://discord.gg/xxxx）を下の定数に入れると、
 * JOIN の大ボタンとフッターの Discord リンクが実URLに切り替わります。
 * 空のままの間は、Instagram DM 経由の参加案内が表示されます
 * （プレースホルダーリンクを公開しないため：04-UX-AUDIT P0 の教訓）。
 * ▲▲▲
 */
const DISCORD_INVITE_URL = "";

(function () {
  // reveal はJSが動く環境でのみ初期非表示にする（no-JSフォールバック）
  document.documentElement.classList.add("js");

  // Discord リンクの解決
  var joinButton = document.querySelector("[data-discord]");
  var fallbackButton = document.querySelector("[data-discord-fallback]");
  var footerLink = document.querySelector("[data-discord-footer]");

  if (DISCORD_INVITE_URL) {
    if (joinButton) {
      joinButton.href = DISCORD_INVITE_URL;
      joinButton.hidden = false;
      joinButton.target = "_blank";
      joinButton.rel = "noopener noreferrer";
    }
    if (fallbackButton) fallbackButton.hidden = true;
    if (footerLink) {
      footerLink.href = DISCORD_INVITE_URL;
      footerLink.target = "_blank";
      footerLink.rel = "noopener noreferrer";
    }
  }

  // モバイルメニュー
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
      mobileNav.setAttribute("aria-hidden", String(!open));
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        mobileNav.setAttribute("aria-hidden", "true");
      });
    });
  }

  // reveal（viewport進入時に1回だけ）
  var revealTargets = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();
