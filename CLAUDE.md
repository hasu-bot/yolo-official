# yolo-official

Creative YOLO 公式サイト（表玄関）。ビルド工程のない素の静的HTML/CSS/JS 1ページ。

## このサイトの役割（最重要）
ゴールはただひとつ「**コミュニティ（Discord）に参加したいと思ってもらうこと**」。
参加の入口は **公式LINE**（LINE友だち追加 → LINEの案内から Discord へ）。サイトから Discord へ直接は誘導しない。
コピー・構成の正本は yolo-members リポジトリの `docs/creative-yolo/21-OFFICIAL-SITE-COPY.md`。
**HOMEは9セクション**（HERO→YOLOとは→できること→PEOPLE→はじめ方→STORIES→地域との活動→JOIN→BUSINESS）。
**NEWSは置かない**——トップを「更新しないと古く見えるサイト」にしないため。最新情報は HUB の EVENTS と SNS の担当。

## 構成
- `index.html` … 全セクション（1ページ）
- `yolo-tokens.css` … デザイントークン（正本: `docs/creative-yolo/09-DESIGN-SYSTEM.md` §1。直値を書かずこれを経由）
- `site.css` … サイト固有スタイル ／ `site.js` … LINE リンク解決・メニュー・reveal
- `styleguide.html` … トークン確認用（noindex・公開サイトからリンクしない）
- `assets/ogp.png` … OGP（1200×630・絶対URL必須）

## デザイン
正本は `docs/creative-yolo/25-WEB-DESIGN-SYSTEM.md` ＋ **`26-YOLO-TALENTS-SITE.md` §7（白黒への転換）**。
25番の §1・§2-0（群青ベース）は 26番で置き換え済み。

- **紙面は白黒、行動は青。** 地は `--yolo-paper #F7F7F3` と `--yolo-white`、黒ベタは `--yolo-ink #0B0B0B`
- **YOLO BLUE `#1769E0` は「押す場所」だけ**——CTA・リンク・ナビの現在位置。見出し・罫線・地色・装飾には使わない
- 配色リズムは 写真→紙→紙→黒→紙→紙→写真→紙→黒→紙→黒。**黒ベタは「間」「JOIN」「footer」の3面まで**
- 書体は **Zen Old Mincho で全面統一**（本文・UIまで明朝。ゴシックを1か所も混ぜない）。欧文は Cormorant Garamond
- **色は必ず意味トークンを経由する**——`--ink-1`（主文字・太罫）／`--ink-2`（補助）／`--rule`（細罫）／`--accent`。
  暗い面（`.hero .rail .interlude .join .section-local .site-footer .mobile-nav` とヘッダー既定）では
  site.css の「暗い面スコープ」がこの4つを反転させる。**個別に白や黒を直書きしない**
- `--yolo-blue` on 紙 は 4.73:1（AAぎりぎり）。**14px以下の文字には使わず黒に**。黒ベタの上では青を使わない（3.40:1）
- 蛍光アクセント `#D8FF3E` はマーカー・ステータス専用。1画面1点・CTA禁止・必ず黒文字と組む
- **「準備中」「Coming Soon」のダミー枠を出さない**。写真ゼロ時のフォールバックは 25 §5-3
- 写真は紙面に合わせて `filter: saturate(.55) contrast(1.04)`。**紙面を白黒にするのであって、写真を白黒にするのではない**

## キャッシュ
CSS / JS は `?v=YYYYMMDD` 付きで読み込む（`index.html` `404.html` `styleguide.html`）。
**`site.css` `yolo-tokens.css` `site.js` を変更したら、この 3ファイルの `?v=` を必ず更新する。**
更新を忘れると、Vercel にデプロイしても既存ユーザーには古い見た目のまま出る。

## ルール
- CTAは LINE 参加に一本化（Primaryボタンは1画面1個）。定員煽り・「今だけ」・フォロワー数自慢は禁止（Brand Book §5）
- プレースホルダーのリンクを公開しない（04-UX-AUDIT P0 の教訓）。LINE 公式URLは `site.js` 先頭の `LINE_OFFICIAL_URL` 1箇所で管理（HTML側 href は同URLのno-JSフォールバック）
- 「約100人」「参加者の声」等の実データ差し替えは `18-FOUNDER-INPUT.md` の回収後
- 事業判断・コピーの変更は yolo-members の `docs/creative-yolo/` が正。単独セッションでは add_repo で参照

## デプロイ
Vercel（main へのプッシュで公開）

## コミット規約
Conventional Commits + 日本語本文（例: `feat: JOINセクションを追加` / `design: 配色リズムを調整`）。main へ直接コミットしない（作業ブランチ → PR）。
