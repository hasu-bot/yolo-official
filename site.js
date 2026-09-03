/* Creative YOLO 公式サイト 共通JS */
const LINE_OFFICIAL_URL = "https://line.me/R/ti/p/@140irxqh";

(function () {
  document.documentElement.classList.add("js");

  document.querySelectorAll("[data-line]").forEach(function (link) {
    link.href = LINE_OFFICIAL_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

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

  var revealTargets = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }
})();

/* 暗背景ページでのみ光の粒子を描画 */
(function () {
  if (document.body.classList.contains("home-light")) return;

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

  var count = Math.min(46, Math.floor(window.innerWidth / 30));
  for (var i = 0; i < count; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
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

    particles.forEach(function (p) {
      p.y -= p.vy;
      p.x += p.vx;
      p.tw += p.tws;
      if (p.y < -0.05) {
        p.y = 1.05;
        p.x = Math.random();
      }
      var alpha = 0.25 + Math.sin(p.tw) * 0.2;
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(240,169,44," + Math.max(alpha, 0.05).toFixed(3) + ")";
      ctx.fill();
    });

    requestAnimationFrame(frame);
  }

  frame();

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && !running) {
        running = true;
        frame();
      } else if (!visible) {
        running = false;
      }
    }).observe(canvas);
  }
})();

/* モデル・俳優応募フォーム */
(function () {
  var entryHost = document.querySelector(".model-entry .model-wrap");
  if (!entryHost) return;

  var formCss = document.createElement("link");
  formCss.rel = "stylesheet";
  formCss.href = "./form.css";
  document.head.appendChild(formCss);

  var sdk = document.createElement("script");
  sdk.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.114.0/dist/umd/supabase.min.js";
  sdk.crossOrigin = "anonymous";
  sdk.onload = function () {
    var formScript = document.createElement("script");
    formScript.src = "./form.js";
    document.body.appendChild(formScript);
  };
  document.head.appendChild(sdk);
})();