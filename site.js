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

/* チャリティーフォトウォークの最新実績を公式サイトへ反映 */
(function () {
  if (!document.body.classList.contains("home-light")) return;

  var charityUrl = "https://yolo-photo-walk.vercel.app/";
  var reportUrl = "https://yolo-photo-walk.vercel.app/record.html";
  var donationUrl = "https://yolo-photo-walk.vercel.app/donation.html";

  document.querySelectorAll(".project-card").forEach(function (card) {
    var title = card.querySelector("h3");
    if (!title || title.textContent.trim() !== "撮影会・フォトウォーク") return;

    card.href = charityUrl;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    var label = card.querySelector(".card-label");
    var desc = title.nextElementSibling;
    var linkText = card.querySelector(".card-link");
    var figcaption = card.querySelector("figcaption");

    if (label) label.textContent = "CHARITY / COMMUNITY";
    if (figcaption) figcaption.textContent = "CHARITY PHOTO WALK";
    title.textContent = "チャリティーフォトウォーク";
    if (desc) desc.textContent = "写真を楽しみながら地域を歩き、開催に必要な経費を除いた金額を支援へ届ける活動。開催後は収支・寄付額・寄付先・証明を公開しています。";
    if (linkText) linkText.textContent = "活動・寄付実績を見る →";
  });

  var newsList = document.querySelector("#news .news-list");
  if (newsList && !newsList.querySelector("[data-charity-report]")) {
    var donationItem = document.createElement("li");
    donationItem.setAttribute("data-charity-report", "donation");
    donationItem.innerHTML = '<time>2026.09.08</time><span><a href="' + donationUrl + '" target="_blank" rel="noopener noreferrer" style="color:inherit">REPORT　チャリティーフォトウォーク寄付完了 — 熊本県へ35,000円</a></span>';
    newsList.prepend(donationItem);

    var reportItem = document.createElement("li");
    reportItem.setAttribute("data-charity-report", "event");
    reportItem.innerHTML = '<time>2026.08.23</time><span><a href="' + reportUrl + '" target="_blank" rel="noopener noreferrer" style="color:inherit">REPORT　チャリティーフォトウォーク in 黒川温泉 開催記録</a></span>';
    donationItem.insertAdjacentElement("afterend", reportItem);
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
  formCss.href = "./form.css?v=20260908";
  document.head.appendChild(formCss);

  var sdk = document.createElement("script");
  sdk.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.114.0/dist/umd/supabase.min.js";
  sdk.crossOrigin = "anonymous";
  sdk.onload = function () {
    var formScript = document.createElement("script");
    formScript.src = "./form.js?v=20260908";
    document.body.appendChild(formScript);
  };
  document.head.appendChild(sdk);
})();