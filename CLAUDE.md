# yolo-official

Creative YOLO 公式サイト（表玄関）。ビルド工程のない素の静的HTML/CSS/JS 1ページ。

## このサイトの役割（最重要）
ゴールはただひとつ「**Discordに参加したいと思ってもらうこと**」。
コピー・構成の正本は yolo-members リポジトリの `docs/creative-yolo/21-OFFICIAL-SITE-COPY.md`（構成: HERO→YOLOとは→PROJECTS→COMMUNITY→HUB紹介→NEWS→JOIN）。

## 構成
- `index.html` … 全セクション（1ページ）
- `yolo-tokens.css` … デザイントークン（正本: `docs/creative-yolo/09-DESIGN-SYSTEM.md` §1。直値を書かずこれを経由）
- `site.css` … サイト固有スタイル ／ `site.js` … Discord リンク解決・メニュー・reveal
- `assets/ogp.png` … OGP（1200×630・絶対URL必須）

## ルール
- CTAは Discord 参加に一本化（Primaryボタンは1画面1個）。定員煽り・「今だけ」・フォロワー数自慢は禁止（Brand Book §5）
- プレースホルダーのリンクを公開しない（04-UX-AUDIT P0 の教訓）。Discord 招待URLは `site.js` 先頭の `DISCORD_INVITE_URL` 1箇所で管理
- 「約100人」「参加者の声」等の実データ差し替えは `18-FOUNDER-INPUT.md` の回収後
- 事業判断・コピーの変更は yolo-members の `docs/creative-yolo/` が正。単独セッションでは add_repo で参照

## デプロイ
Vercel（main へのプッシュで公開）

## コミット規約
Conventional Commits + 日本語本文（例: `feat: JOINセクションを追加` / `design: 光のグラデーション調整`）
