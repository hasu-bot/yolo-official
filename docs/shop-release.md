# YOLO SHOP 販売準備・引き継ぎ

2026-10-22。既存 PR #19 (`feat/yolo-shop-shopify`) を継続。STORES の旧試作は使用しない。
Shopify 正本: `ngtsfz-h8.myshopify.com`。現在 trial。以下は全て DRAFT で、実受注可能ではない。

## 登録済みの標準固定バンドル

| セット | 価格 (JPY) | 内容 (各1点) | Shopify Product ID | Variant ID |
| --- | ---: | --- | --- | --- |
| 日常使いセット | 3000 | トートバッグ・缶バッジ | 15429906694211 | 67749508808771 |
| タオルセット | 3500 | タオル・缶バッジ | 15429906792515 | 67749510217795 |
| 応援セット | 5500 | タオル・トートバッグ・缶バッジ | 15429906890819 | 67749510381635 |

全親 variant に `requiresComponents: true`。Shopify `productBundleCreate` で作成。
有料アプリのインストール・トークン作成・Cart Transform の独自実装は行っていない。

| 構成品 SKU | 販売可能数 | Product ID | Variant ID |
| --- | ---: | --- | --- |
| LC-TOWEL | 20 | 15429905088579 | 67749491212355 |
| LC-TOTE | 20 | 15429905317955 | 67749492392003 |
| LC-BADGE | 20 | 15429905383491 | 67749493637187 |

ユーザーが確認した販売可能数を、既存のストアロケーション `93014982723` に設定。
構成品は `tracked: true`、全 variant は `inventoryPolicy: DENY`。セット側の在庫数を独立して20に設定していない。
全セットが同じ `LC-BADGE` variant を1個消費するため、全セット合計の初期上限は20組。
例: 日常使い10組＋タオル6組＋応援4組なら、トート14・タオル10・缶バッジ20を使用。
親商品にそれぞれ在庫20と表示されても、合計60組売れるという意味ではない。
構成品の価格0は単品販売をしない内部管理用の初期値。公開・単品販売しない。
写真は未登録。UIは「商品写真準備中」。ポスターは含めない。

## 販売開始に必要な確認

1. ストア所有者によるプラン選択・購入。エージェントは購入しない。
2. 本番で有効な決済方法とテストモードの解除状況。接続APIは `read_shopify_payments` / `read_shopify_payments_accounts` がなく、`shopifyPaymentsAccount.activated` の読み取りが拒否された。未設定と断定せず管理画面で確認待ち。入金先や決済口座は変更しない。
3. 販売者名・責任者・所在地・電話・連絡先、特商法表示、返品・不良品・キャンセル条件、発送までの日数を確定。既存ポリシーはプライバシーポリシーだけで、販売条件として転用しない。
4. 梱包後の寸法・重量、発送方法・配送対象地域・離島等の扱いを確認。送料・梱包料500円は未承認案で、設定していない。1注文あたりか、複数セット同梱時・地域別の加算を決める。
5. 各セット価格の税込/税別と商品課税区分を確認。現在ストアの `taxesIncluded: true`、`taxShipping: false` は既存設定であり、今回の商品の税務判断を確認した意味ではない。税率・商品税区分は勝手に確定しない。

商品写真は後日差し替え可能。実在庫20の再質問は不要。

## 公開手順

- 上記条件を確定し、Shopify に検証済みの販売者・返品・配送設定を保存。
- 同じ Product/Variant ID を継続利用し、重複商品を作らない。
- 構成品は単品販売・公開しない。バンドルの公開先で必要な構成品ステータスを公式仕様に従って確認する。
- バンドルを対応チャネルに公開。カスタムストアフロントのバンドル公開対応と tokenless Web Components での取得を実機で確認。新しい持続的アクセスが必要ならユーザーが許可するまで止める。
- `/shop/index.html` の `data-sales-status="preparing"` を `ready` に変えるのは、販売条件と決済確認後のみ。準備中の案内、送料・税・発送説明も確定した内容に更新。
- Shopifyからライブのタイトル・価格・販売可否が読み込まれたカードのみカート追加を許可。未公開商品・API/CDN障害・JS無効時は静的なセット案内を維持して購入不可。
- スマホで3商品の表示、カート追加、数量変更・削除、価格、Shopify checkoutへの遷移、送料と税の総額表示、複数セット共有在庫の上限を確認。
- 実購入・架空注文は送信しない。今回の依頼で注文完了・課金テストは許可されていない。
- 検証結果を PR #19 に残し、公開条件が揃った段階でマージする。

## 公式仕様

- [Shopify product fixed bundles](https://shopify.dev/docs/apps/build/product-merchandising/bundles/add-product-fixed-bundle)
- [Storefront Web Components](https://shopify.dev/docs/api/storefront-web-components/getting-started)
- [Product context / gid](https://shopify.dev/docs/api/storefront-web-components/components/shopify-context)
- [Shopify cart](https://shopify.dev/docs/api/storefront-web-components/components/shopify-cart)

## 今回の検証結果

- Shopify Admin API: バンドル3件、構成品3件のDRAFT状態・価格・構成品参照・在庫追跡・売越し拒否設定を再取得して確認。
- tokenless Storefront API (`2026-01`、公式Web Componentsの既定バージョン): 商品読み取りは HTTP 400 / `Online Store channel is locked.`。公開チャネルがロック中のため、実カート・checkoutへの疎通は未検証。制限を回避せず、公開前の解除確認待ち。
- Node `node --test tests/shop.test.cjs`: 6件成功。販売準備中の停止、未読込、在庫なし、SDK未読込、正常時カート連携、例外案内をローカルのスタブで検証。Shopifyに注文や架空注文は送信していない。
- ローカルブラウザ 390×844 / 1440×1000: 3セット・価格・構成内容・写真準備中・購入停止を確認。390pxで横スクロールなし。準備中は未公開商品の問い合わせを開始せず、SDKエラー文字列を表示しない。
- Vercel既存ブランチプレビューは認証付き。MCP `web_fetch_vercel_url` は一時認証回避リンクの作成/再利用を伴うため自動承認レビューに拒否された。回避リンク作成・保護の変更は行わず、デプロイ実体のブラウザ検証は未実施。
- Macはロック中。ネイティブ画面やChromeは操作していない。ローカル検証は独立したin-app browserのみ。
- リポジトリに AGENTS.md はなく、CLAUDE.md の既存デザイン・静的構成を確認。利用可能なスキル一覧に software engineering の専用スキルはなかった。ShopifyスキルとVercelデプロイ関連スキルを使用。
