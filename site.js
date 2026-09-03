/*
 * Creative YOLO 公式サイト 共通JS
 *
 * ▼▼▼ 参加導線のURLはここ（1箇所だけ）で管理 ▼▼▼
 * 参加の入口は公式LINE。Discordへは LINE の案内から誘導する
 * （LINEアカウントを変更したら下の定数を差し替えると、
 *   JOIN の大ボタンとフッターの LINE リンクがすべて切り替わります）。
 * ▲▲▲
 */
const LINE_OFFICIAL_URL = "https://line.me/R/ti/p/@140irxqh";

(function () {
  // reveal はJSが動く環境でのみ初期非表示にする（no-JSフォールバック）
  document.documentElement.classList.add("js");

  // LINE リンクの解決（HTML側の href は実URLのフォールバック）
  document.querySelectorAll("[data-line]").forEach(function (link) {
    link.href = LINE_OFFICIAL_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  // 公式トップからモデル・俳優応募ページへたどれる導線を追加
  var path = window.location.pathname;
  var isHome = path === "/" || path.endsWith("/index.html");
  if (isHome) {
    var desktopNav = document.querySelector(".desktop-nav");
    var desktopJoin = desktopNav && desktopNav.querySelector(".nav-join");
    if (desktopNav && desktopJoin && !desktopNav.querySelector('[href="/model/"]')) {
      var desktopModelLink = document.createElement("a");
      desktopModelLink.href = "/model/";
      desktopModelLink.textContent = "モデル・俳優募集";
      desktopNav.insertBefore(desktopModelLink, desktopJoin);
    }

    var mobileNavRoot = document.querySelector("[data-mobile-nav]");
    var mobileJoin = mobileNavRoot && mobileNavRoot.querySelector('a[href="#join"]');
    if (mobileNavRoot && mobileJoin && !mobileNavRoot.querySelector('[href="/model/"]')) {
      var mobileModelLink = document.createElement("a");
      mobileModelLink.href = "/model/";
      mobileModelLink.textContent = "モデル・俳優募集";
      mobileNavRoot.insertBefore(mobileModelLink, mobileJoin);
    }

    var communityInner = document.querySelector("#community .section-inner.narrow");
    if (communityInner && !communityInner.querySelector("[data-model-entry-link]")) {
      var modelCta = document.createElement("p");
      modelCta.className = "section-cta";
      modelCta.setAttribute("data-model-entry-link", "");
      var modelButton = document.createElement("a");
      modelButton.className = "button button-secondary";
      modelButton.href = "/model/";
      modelButton.textContent = "モデル・俳優として応募する →";
      modelCta.appendChild(modelButton);
      communityInner.appendChild(modelCta);
    }

    var footerLinks = document.querySelector(".site-footer .footer-links");
    if (footerLinks && !footerLinks.querySelector('[href="/model/"]')) {
      var footerModelLink = document.createElement("a");
      footerModelLink.href = "/model/";
      footerModelLink.textContent = "モデル・俳優募集";
      footerLinks.appendChild(footerModelLink);
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

/* ── モデル・俳優応募フォーム（JS利用時はDM案内をフォームへ置き換える） ── */
(function () {
  var entryHost = document.querySelector('.model-entry .model-wrap');
  if (!entryHost) return;

  var formCss = document.createElement('link');
  formCss.rel = 'stylesheet';
  formCss.href = './form.css';
  document.head.appendChild(formCss);

  var sdk = document.createElement('script');
  sdk.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.114.0/dist/umd/supabase.min.js';
  sdk.crossOrigin = 'anonymous';
  sdk.onload = function () {
    var formScript = document.createElement('script');
    formScript.src = './form.js';
    document.body.appendChild(formScript);
  };
  document.head.appendChild(sdk);
})();
