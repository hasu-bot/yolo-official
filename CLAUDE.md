# yolo-official

Creative YOLO 公式サイト（表玄関）。ビルド工程のない素の静的HTML/CSS/JS 1ページ。

## このサイトの役割（最重要）
ゴールはただひとつ「**コミュニティ（Discord）に参加したいと思ってもらうこと**」。
参加の入口は **公式LINE**（LINE友だち追加 → LINEの案内から Discord へ）。サイトから Discord へ直接は誘導しない。
コピー・構成の正本は yolo-members リポジトリの `docs/creative-yolo/21-OFFICIAL-SITE-COPY.md`（構成: HERO→YOLOとは→PROJECTS→COMMUNITY→HUB紹介→NEWS→JOIN）。

## 構成
- `index.html` … 全セクション（1ページ）
- `yolo-tokens.css` … デザイントークン（正本: `docs/creative-yolo/09-DESIGN-SYSTEM.md` §1。直値を書かずこれを経由）
- `site.css` … サイト固有スタイル ／ `site.js` … LINE リンク解決・メニュー・reveal
- `assets/ogp.png` … OGP（1200×630・絶対URL必須）

## ルール
- CTAは LINE 参加に一本化（Primaryボタンは1画面1個）。定員煽り・「今だけ」・フォロワー数自慢は禁止（Brand Book §5）
- プレースホルダーのリンクを公開しない（04-UX-AUDIT P0 の教訓）。LINE 公式URLは `site.js` 先頭の `LINE_OFFICIAL_URL` 1箇所で管理（HTML側 href は同URLのno-JSフォールバック）
- 「約100人」「参加者の声」等の実データ差し替えは `18-FOUNDER-INPUT.md` の回収後
- 事業判断・コピーの変更は yolo-members の `docs/creative-yolo/` が正。単独セッションでは add_repo で参照

## デプロイ
Vercel（main へのプッシュで公開）

## コミット規約
Conventional Commits + 日本語本文（例: `feat: JOINセクションを追加` / `design: 光のグラデーション調整`）
