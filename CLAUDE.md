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
正本は `docs/creative-yolo/25-WEB-DESIGN-SYSTEM.md`（色・書体・写真・グレイン・ロゴVI）。

- **YOLO BLUE `#1769E0` ＝ 行動・挑戦・参加**。青いところ＝YOLOに一歩入るところ。本文を読ませる面では青を使わない
- 配色リズムは 明→青→明→濃青→明→写真→青→明→黒。**青ベタは連続させない／ページ最大の青は JOIN**
- 見出しは Noto Sans JP 900（案内の声）。**STORIES セクションだけ明朝**
- 蛍光アクセント `#D8FF3E` はマーカー・ステータス専用。1画面1点・CTA禁止・必ず黒文字と組む
- **「準備中」「Coming Soon」のダミー枠を出さない**。写真ゼロ時のフォールバックは 25 §5-3
- 旧「夜と光」（`--yolo-night` 等）は DEPRECATED。HOME 刷新が済んだらトークンから削除する

## ルール
- CTAは LINE 参加に一本化（Primaryボタンは1画面1個）。定員煽り・「今だけ」・フォロワー数自慢は禁止（Brand Book §5）
- プレースホルダーのリンクを公開しない（04-UX-AUDIT P0 の教訓）。LINE 公式URLは `site.js` 先頭の `LINE_OFFICIAL_URL` 1箇所で管理（HTML側 href は同URLのno-JSフォールバック）
- 「約100人」「参加者の声」等の実データ差し替えは `18-FOUNDER-INPUT.md` の回収後
- 事業判断・コピーの変更は yolo-members の `docs/creative-yolo/` が正。単独セッションでは add_repo で参照

## デプロイ
Vercel（main へのプッシュで公開）

## コミット規約
Conventional Commits + 日本語本文（例: `feat: JOINセクションを追加` / `design: 配色リズムを調整`）。main へ直接コミットしない（作業ブランチ → PR）。
