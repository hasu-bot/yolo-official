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

/* ── ヘッダーの明暗切り替え ＋ 現在位置のハイライト ──
   HEROの上では透明＋白文字、抜けたら Off White の面にする。
   現在位置は青で示す（「青いところ＝YOLOに一歩入るところ」：25 §1）。
   IntersectionObserver ではなく scroll で判定する——ヒーローが画面より短い場合や、
   IOのコールバックが走らない環境でもヘッダーが透明のまま取り残されないようにするため */
(function () {
  var header = document.querySelector("[data-header]");
  var hero = document.querySelector(".hero");
  var links = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));

  var sections = links
    .map(function (link) {
      var target = document.querySelector(link.getAttribute("href"));
      return target ? { el: target, link: link } : null;
    })
    .filter(Boolean);

  if (!header && !sections.length) return;

  function update() {
    if (header) {
      var heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
      header.classList.toggle("is-solid", heroBottom <= header.offsetHeight);
    }

    if (sections.length) {
      // 画面の中央にいちばん近いセクションを現在位置とする
      var middle = window.innerHeight / 2;
      var current = null;
      sections.forEach(function (s) {
        var rect = s.el.getBoundingClientRect();
        if (rect.top <= middle && rect.bottom >= middle) current = s;
      });
      links.forEach(function (l) { l.classList.remove("is-current"); });
      if (current) current.link.classList.add("is-current");
    }
  }

  // 読み取りだけの軽い処理なので、rAFで間引かず毎回そのまま走らせる
  // （rAFで間引くと、タブが描画されていない間にフラグが立ったままになり二度と更新されなくなる）
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  // #stories 等のハッシュ付きで開かれた場合、ジャンプ後にもう一度判定する
  window.addEventListener("load", update);
  window.addEventListener("hashchange", update);
  update();
})();

/* ── HEROの光の粒子 ──
   「光＝心が動いた瞬間」（Brand Book §1）の可視化。
   reduced-motion では描画しない。ヒーローが画面外の間は止める */
(function () {
  var canvas = document.querySelector("[data-particles]");
  if (!canvas || !canvas.getContext) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var ctx = canvas.getContext("2d");
  var particles = [];
  var running = true;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
  }
  resize();
  window.addEventListener("resize", resize);

  var COUNT = Math.min(54, Math.floor(window.innerWidth / 26));
  for (var i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.9 + 0.5,
      vy: Math.random() * 0.0005 + 0.00012,
      vx: (Math.random() - 0.5) * 0.00018,
      tw: Math.random() * Math.PI * 2,
      tws: Math.random() * 0.02 + 0.005
    });
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.y -= p.vy; p.x += p.vx; p.tw += p.tws;
      if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
      var alpha = 0.3 + Math.sin(p.tw) * 0.25;
      var x = p.x * canvas.width, y = p.y * canvas.height, r = p.r * dpr;
      var halo = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
      halo.addColorStop(0, "rgba(160,205,255," + Math.max(alpha, 0.06).toFixed(3) + ")");
      halo.addColorStop(1, "rgba(160,205,255,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, r * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      if (visible && !running) { running = true; frame(); }
      else if (!visible) { running = false; }
    }).observe(canvas);
  }
})();

/* ── 見出しのカーテン・リビール ──
   [data-mask] が画面に入ったら、下から立ち上げる（文字は分割しないので読み上げに影響しない） */
(function () {
  var masks = document.querySelectorAll("[data-mask]");
  if (!masks.length) return;
  if (!("IntersectionObserver" in window)) {
    masks.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.3 });
  masks.forEach(function (el) { io.observe(el); });
})();

/* ── 数字のカウントアップ ── 「いま、約100人。」を 0 から数える */
(function () {
  var el = document.querySelector("[data-count]");
  if (!el) return;
  var target = parseInt(el.getAttribute("data-count"), 10);
  if (!target) return;

  function run() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(target);
      return;
    }
    var start = null;
    var DUR = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / DUR, 1);
      // 終盤をゆっくり止める
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!("IntersectionObserver" in window)) { el.textContent = String(target); return; }
  var io = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) { run(); io.disconnect(); }
  }, { threshold: 0.5 });
  io.observe(el);
})();

/* ── 視差とレールの歪み ──
   背面の漢字・欧文・地名はスクロールに対して遅れて動く。
   ことばのレールはスクロール速度に応じて文字が傾く（速いほど大きく歪む） */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var layers = [].slice.call(document.querySelectorAll(".kanji, .ghost, .place-wall"));
  var rails = [].slice.call(document.querySelectorAll(".rail"));
  var lastY = window.scrollY;
  var settle = null;

  function update() {
    var y = window.scrollY;
    var vh = window.innerHeight;

    layers.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      // セクション中央からの距離で -60〜60px ずらす
      var center = rect.top + rect.height / 2;
      var ratio = (center - vh / 2) / vh;
      // 画面外のセクションでは ratio が大きく振れるので必ず挟む（挟まないと数百px飛ぶ）
      ratio = Math.max(-1, Math.min(1, ratio));
      el.style.setProperty("--p", (ratio * -60).toFixed(1) + "px");
    });

    if (rails.length) {
      var v = Math.max(-14, Math.min(14, (y - lastY) * 0.35));
      rails.forEach(function (r) { r.style.setProperty("--skew", v.toFixed(2) + "deg"); });
      clearTimeout(settle);
      settle = setTimeout(function () {
        rails.forEach(function (r) { r.style.setProperty("--skew", "0deg"); });
      }, 140);
    }
    lastY = y;
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

/* ── HERO のカーソル追従の光 ── ポインタがある環境だけ */
(function () {
  var hero = document.querySelector(".hero");
  if (!hero || !window.matchMedia("(hover: hover)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  hero.addEventListener("mousemove", function (e) {
    var rect = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%");
    hero.style.setProperty("--my", (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%");
  }, { passive: true });
})();
