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

/* ── 光の粒子（「光」の哲学の可視化。reduced-motion では描画しない） ── */
(function () {
  var canvas = document.querySelector("[data-particles]");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var ctx = canvas.getContext("2d");
  var particles = [];
  var running = true;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  var COUNT = Math.min(46, Math.floor(window.innerWidth / 30));
  for (var i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.8 + 0.6,
      vy: Math.random() * 0.00045 + 0.00012,
      vx: (Math.random() - 0.5) * 0.00016,
      tw: Math.random() * Math.PI * 2,
      tws: Math.random() * 0.02 + 0.006
    });
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.y -= p.vy; p.x += p.vx; p.tw += p.tws;
      if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      var alpha = 0.25 + Math.sin(p.tw) * 0.2;
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(240,169,44," + Math.max(alpha, 0.05).toFixed(3) + ")";
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();

  // ヒーローが画面外の間は止める（無駄な描画をしない）
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && !running) { running = true; frame(); }
      else if (!visible) { running = false; }
    }).observe(canvas);
  }
})();
