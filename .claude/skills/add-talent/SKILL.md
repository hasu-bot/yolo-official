---
name: add-talent
description: 公式サイトの YOLO TALENTS（公式モデル）に人を掲載する・内容を更新する・掲載をやめるときに必ず使う。「〇〇さんをモデル掲載して」「プロフィールの写真を差し替えて」「掲載をやめて」など。応募データの確認、公開してよい項目の選び方、写真とデータの追加、テスト・PR・本番確認までの手順。
---

# 公式モデルの掲載・更新・掲載終了

公式モデルのページは `content/talents.json` と `assets/talents/` から作られる。
一覧 `/talents/`・個別 `/talents/<slug>/`・トップの `#talent` 節（最大3名）・`sitemap.xml` に自動で反映される。
HUB（yolo-members）の管理画面から掲載する仕組みもあるが、通常はこのリポジトリで行う。

## 前提（守ること）

- **掲載は代表（坂本）の判断と、本人の了承があってから。** 了承の方法と日付を必ず記録する（下の `consentVersion`）。了承が確認できないときは掲載しない
- **応募データ（Supabase `model_applications`）は読むだけ。** 書き換えない。連絡先・本名・生年月日・住所は会話にもファイルにも出さない
- **未成年（18歳未満）は保護者の掲載同意が必要。** 記録が無ければ掲載しない
- 事務所に所属している人は載せない（応募の条件が「事務所未所属」）

## 公開してよい項目

| 載せる | 載せない |
|---|---|
| 活動名・ローマ字名 | 本名（応募の `name`）※本人が活動名にしたい場合のみ |
| 活動エリア（「熊本県内」など県単位） | 住んでいる市町村・年齢・生年月日 |
| 身長（本人が了承したもの） | スリーサイズ（依頼時に運営から伝える。本人が公開を希望したときだけ載せる） |
| 靴のサイズ・特技（本人が了承したもの） | Instagram などのSNS（サイト経由の依頼は `/casting/` に集めるため。本人が強く希望したら相談） |
| 紹介文・出演実績 | 活動できる曜日・連絡先・事務所や家庭の事情 |

## 掲載の手順

1. **応募を確認する**（Supabase MCP、プロジェクト `yolo-platform`）
   `model_applications` から `status='approved'` の該当者を探し、次だけを読む：`age`, `height_cm`, `activity_type`, `experience`, `aspirations`, `self_pr`, `agency_status`, `activity_area`, `is_minor`。
   承認されていない・事務所所属・未成年で保護者同意の記録が無い場合は、ここで止めて代表に伝える。
2. **プロフィール案を作って見せる**
   - `slug`：ローマ字名を小文字で（例 `yuka`）。既存と重複しないこと
   - `intro`：自己PRとやりたいことから、本人の言葉を活かして3〜4文。誇張しない（「人気」「実力派」などを書かない）。経験が少ない人は正直に書いてよい
   - `works`：`photo` / `film` / `ad` / `event` のうち本人が受けられるもの。分からなければ `photo` のみ
   - `categories`：`fashion` / `beauty` / `lifestyle`。地域・旅の撮影が中心なら `lifestyle`
   - `credits`：応募の経験欄から。何の仕事か分からない項目は入れずに確認する
   - **確認が必要な点を箇条書きで添える**（活動名・身長などの公開可否・実績の表記・写真）
3. **写真を受け取る**
   - 代表から受け取る（応募写真を使ってよいと言われた場合はそれでよい。Supabase Storage から自分で取り出す手段は無い）
   - 実写のみ。生成画像・加工しすぎた画像は使わない
   - WebP または JPEG。1枚目はバストアップ寄り（一覧のカードと共有画像になる）、2枚目以降はギャラリー
   - 置き場所：`assets/talents/<slug>.webp`、`assets/talents/<slug>-2.webp` …。権限は `chmod 644`
4. **`content/talents.json` に追加する**（`scripts/talents.mjs` の `publishableProfiles` が検査する）
   ```json
   {
     "publication": {
       "status": "approved",
       "consent": "granted",
       "consentVersion": "talents-publication-2026-10-18（運営確認：坂本がLINEで本人の了承を確認）",
       "consentRecordedAt": "YYYY-MM-DD",
       "profileConfirmed": true,
       "photosConfirmed": true,
       "isMinor": false
     },
     "profile": {
       "slug": "…", "name": "…", "romanName": "…", "intro": "…", "area": "熊本県内",
       "height": 161, "works": ["photo"], "categories": ["lifestyle"],
       "portrait": { "src": "/assets/talents/<slug>.webp", "alt": "〇〇の前に立つ<活動名>" },
       "gallery": [{ "src": "/assets/talents/<slug>-2.webp", "alt": "…" }],
       "skills": [], "credits": ["…"]
     }
   }
   ```
   - `consentVersion` には**実際の了承の方法**を書く（本人がHUBの同意リンクで同意したなら「同意リンク」）。事実と違う記録を作らない
   - 未成年は `"isMinor": true` と `"guardianConsentRecordedAt": "YYYY-MM-DD"` が必須
   - `alt` は写真の様子を短く。場所を断定できないときは「温泉街の石段」のようにぼかす
5. **確認する**
   - `npm test`（一覧・個別ページ・トップ・sitemap・参照ファイルの存在まで検査される）
   - `npm run build` のあと `dist/` をローカルで配信し、`/talents/`・`/talents/<slug>/`・トップの `#talent` をPCとスマホ幅で目視する
6. **PR → マージ → 本番確認**
   - ブランチ `feat/talent-<slug>`、コミット例 `feat: 公式モデル「〇〇」を掲載`
   - マージ後、Vercel のデプロイ完了を待ってから `https://creativeyolo.com/talents/<slug>/` が200、`og:image` が本人の写真、トップに写真が出ていることを確認する

## 内容の更新・写真の差し替え

`content/talents.json` の該当プロフィールと写真を差し替える。**本文や写真を変えたら、本人に見せて了承をもらい直す**（`consentRecordedAt` を更新）。手順5・6は同じ。

## 掲載をやめるとき（本人の希望・事務所への所属・了承の撤回など）

1. `content/talents.json` から該当レコードを消し、`assets/talents/<slug>*.webp` も削除する
2. 手順5・6と同じ流れで公開。本番で `/talents/<slug>/` が404、一覧とトップから消えたことを確認する
3. 本人の希望で止めた場合は、**急ぎで**対応する（その日のうちに）

## 参考

- 設計と方針：yolo-members `docs/creative-yolo/31-YOLO-TALENTS-SITE.md`（特に §2-4 立ち位置、§5 掲載項目、§8 写真）
- 出演相談：リポジトリ掲載のモデルを指名した相談は、相談内容に「希望モデル：〇〇」が入ってHUBの依頼一覧に届く
