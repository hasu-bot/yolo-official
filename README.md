# yolo-official

## YOLO SHOP

`/shop/` は映画『ラストコール』の3セットを紹介し、STORESの正規商品へ案内する静的ページです。
公式サイトの主要目的（LINEからYOLO参加）を維持し、ショップは独立ページにしています。

2026-10-22: STORESアカウント・商品URL・決済・販売者条件が未確認のため販売準備中です。
STORESへ商品登録したことを意味しません。架空URLや商品写真は設定していません。

- [現在の移行状況・在庫案・公開条件](docs/stores-migration.md)
- [登録用の商品説明](docs/stores-products.md)
- [Shopifyで行った準備の履歴（移行前）](docs/shop-release.md)

商品データの正本は `shop/catalog.js`。映画サイトPR21は同じ公開データを読み込み、取得できない場合は販売停止状態のローカルデータを使います。
`node --test tests/shop.test.cjs` で公開条件・URL・在庫割当の安全性を検証します。
