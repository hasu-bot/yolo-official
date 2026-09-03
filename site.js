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

  // 公式トップのみ、明るいエディトリアル方向＋現在のYOLOに合わせたコピーへ
  var path = window.location.pathname;
  var isHome = path === "/" || path.endsWith("/index.html");
  if (isHome) {
    document.body.classList.add("home-light");

    var homeTheme = document.createElement("link");
    homeTheme.rel = "stylesheet";
    homeTheme.href = "/home-light.css";
    document.head.appendChild(homeTheme);

    function setText(selector, text) {
      var el = document.querySelector(selector);
      if (el) el.textContent = text;
    }
    function setHTML(selector, html) {
      var el = document.querySelector(selector);
      if (el) el.innerHTML = html;
    }

    // ナビ：RPG用語は前面に出さず、初見でも意味が通る言葉へ
    document.querySelectorAll('a[href="#projects"]').forEach(function (el) {
      el.textContent = "活動";
    });

    // HERO
    setHTML('.hero h1', '<span class="nowrap">「やってみたい」を、</span><wbr /><span class="nowrap">ここから。</span>');
    setHTML('.hero-lead', '熊本で、撮る・演じる・歌う・作る。<br />仲間と出会い、挑戦を作品にしていくクリエイティブコミュニティ。');
    setText('.hero-cta .button-primary', 'コミュニティをのぞいてみる →');

    // 言葉のレール
    var rail = document.querySelector('.word-rail-track');
    if (rail) {
      rail.innerHTML = '<span>撮る</span><i>✦</i><span>演じる</span><i>✦</i><span>歌う</span><i>✦</i><span>作る</span><i>✦</i><span>出会う</span><i>✦</i><span>発表する</span><i>✦</i>' +
        '<span>撮る</span><i>✦</i><span>演じる</span><i>✦</i><span>歌う</span><i>✦</i><span>作る</span><i>✦</i><span>出会う</span><i>✦</i><span>発表する</span><i>✦</i>';
    }

    // YOLOとは？：RPGは世界観の裏側に残し、まず活動の意味が伝わるようにする
    setText('.rpg-lead', 'YOLOは、写真だけの場所でも、映画だけの場所でもありません。');
    setHTML('.rpg-declare', '<span class="nowrap">「やってみたい」を、</span><wbr /><span class="nowrap"><em>作品と経験</em>に変える場所です。</span>');
    setHTML('.rpg-roles',
      '<li><span class="rpg-key">まずは</span><strong>小さく始める</strong></li>' +
      '<li><span class="rpg-key">そこで</span><strong>仲間と出会う</strong></li>' +
      '<li><span class="rpg-key">できたものを</span><strong>発表する</strong></li>'
    );
    setHTML('.rpg-note', '撮影会、演技練習、映画制作、展示、映画祭。<br />活動の形は違っても、中心にあるのは誰かの「やってみたい」です。');

    // About
    var aboutParas = document.querySelectorAll('#about .prose p');
    if (aboutParas[0]) aboutParas[0].innerHTML = '撮りたい人、演じたい人、歌いたい人、作りたい人。<br />熊本にはたくさんいるのに、「仲間がいない」「きっかけがない」「発表する場所がない」で止まってしまうことがあります。';
    if (aboutParas[1]) aboutParas[1].innerHTML = 'Creative YOLOは、その最初の一歩を始める場所です。<br />撮影会や練習会で試して、作品をつくり、写真展や映画祭で届ける。<br />やってみたいと思った人が、次へ進める道をこのまちにつくっています。';
    if (aboutParas[2]) aboutParas[2].innerHTML = '大切にしているのは、<strong>まず、やってみること。</strong><br />経験がなくても大丈夫。最初の一歩から、一緒に始められます。';

    // 演技練習会：仕事を保証するように見えない表現へ
    var projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(function (card) {
      var title = card.querySelector('h3');
      var body = card.querySelector('p:not(.card-label)');
      if (title && body && title.textContent.trim() === '演技練習会') {
        body.textContent = '演じてみたい人が、実際に声を出し、身体を動かして試せる練習の場。作品づくりにつながることもあります。';
      }
    });

    // Community：抽象的な「光」説明より、参加のしやすさを先に伝える
    var communityParas = document.querySelectorAll('#community .prose p');
    if (communityParas[0]) communityParas[0].innerHTML = '写真を撮る人、俳優を目指す人、映像をつくる人、モデル、音楽をつくる人、そして「まだ何をやるか決まっていない人」。<br />10代から30代を中心に、約100名が参加しています。';
    if (communityParas[1]) communityParas[1].innerHTML = '経験や肩書きより、何かを「やってみたい」と思っていることを大切にしています。<br />まずは見るだけでも、イベントに1回だけ参加してみるところからでも大丈夫です。';

    // HUB
    var hubParas = document.querySelectorAll('#hub .prose p');
    if (hubParas[0]) hubParas[0].innerHTML = '<strong>YOLO HUB</strong> は、メンバーのための活動拠点です。<br />イベント予定、メンバー情報、これまでの参加履歴などをまとめて確認できます。';
    if (hubParas[1]) hubParas[1].textContent = '活動を続けるほど、自分が何をしてきたのかが残り、次の企画や新しいつながりにつながっていく場所を目指しています。';

    // JOIN
    var joinSteps = document.querySelectorAll('.join-steps li');
    if (joinSteps[2]) joinSteps[2].innerHTML = '<span class="step-num">3</span>気になるイベントや活動があれば、まず一度参加してみてください';
    setText('.join-note', 'まずは見るだけでも大丈夫です。自分のペースで参加できます。');

    // 公式トップからモデル・俳優応募ページへたどれる導線を追加
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

/* ── 光の粒子（暗い世界観ページのみ。公式トップの明るいテーマでは停止） ── */
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