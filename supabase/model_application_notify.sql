-- 応募が来たことを Discord へ通知する。
-- Supabase ダッシュボードの SQL Editor で実行する。
--
-- ■ なぜ要るか
-- 応募は model_applications に保存されるだけで、運営へ何も飛ばない。
-- Supabase を自分で見に行かない限り、応募があったことに気づけない。
-- 応募者の画面には「ご連絡します」と出ているので、気づかない間ずっと待たせることになる。
--
-- ■ 通知に個人情報を載せない
-- 本名・連絡先・写真は通知に含めない。28番 §4-1 で本名は「非公開・運営管理用」であり、
-- Discord は運営以外の目に触れうる。通知は「来たこと」だけ伝え、中身は Supabase で見る。

-- ── 1. 拡張を有効にする ──────────────────────────────
create extension if not exists pg_net with schema extensions;

-- ── 2. Webhook URL を Vault に入れる ─────────────────
-- ※ 新しいウェブフックは作らない。**既に使っている通知先に相乗りする。**
--    yolo-members（HUB）が Vercel の環境変数 DISCORD_WEBHOOK_URL で使っているものと同じ値を入れる。
--    メンバー登録申請・承認却下・ポイント更新と同じチャンネルに、応募も並ぶ。
--
-- ※ URL を関数に直書きしない（DBのダンプや定義表示から漏れるため）。
--
--   select vault.create_secret(
--     'https://discord.com/api/webhooks/xxxxx/yyyyy',  -- ← DISCORD_WEBHOOK_URL と同じ値
--     'discord_application_webhook'
--   );
--
--   入れ直すとき：
--   select vault.update_secret(
--     (select id from vault.secrets where name = 'discord_application_webhook'),
--     'https://discord.com/api/webhooks/新しいURL'
--   );

-- ── 3. 通知する関数 ──────────────────────────────────
create or replace function public.notify_model_application()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  hook_url text;
  minor_note text;
  body_json jsonb;  -- Discord へ送る embeds
begin
  select decrypted_secret into hook_url
    from vault.decrypted_secrets
   where name = 'discord_application_webhook'
   limit 1;

  -- URL 未設定でも応募自体は成功させる。通知の失敗で応募を落とさない
  if hook_url is null then
    raise warning 'discord_application_webhook が Vault にありません。通知を飛ばしませんでした。';
    return new;
  end if;

  -- 見え方を yolo-members/lib/discord.ts に合わせる（embeds・同じチャンネルに並ぶため）
  minor_note := case
    when new.is_minor and new.guardian_consent
      then '未成年です。保護者の同意あり。登録・掲載の同意は別途必要です（29番 §2-2-2）。'
    when new.is_minor
      then '**未成年で、保護者の同意がありません。** 内容を確認してください。'
    else '内容は Supabase の model_applications で確認してください。'
  end;

  body_json := jsonb_build_object(
    'embeds', jsonb_build_array(
      jsonb_build_object(
        'title', 'モデル・俳優の応募',
        'description', minor_note,
        -- 通常は YOLO BLUE。保護者同意の無い未成年だけ、既存の警告色に合わせる
        -- 0xb71516（既存の警告色）／ 0x1769e0（YOLO BLUE）
        'color', case when new.is_minor and not new.guardian_consent then 11998486 else 1534432 end,
        'fields', jsonb_build_array(
          jsonb_build_object('name', '応募番号', 'value', upper(substring(new.id::text, 1, 8)), 'inline', true),
          jsonb_build_object('name', '希望', 'value',
            case new.activity_type
              when 'model' then 'モデル'
              when 'actor' then '俳優'
              when 'both'  then 'モデル・俳優の両方'
              else coalesce(new.activity_type, '未記入')
            end, 'inline', true),
          jsonb_build_object('name', '年齢', 'value', coalesce(new.age::text, '未記入'), 'inline', true)
        )
      )
    )
  );

  perform extensions.net.http_post(
    url     := hook_url,
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := body_json
  );

  return new;
exception
  -- 通知が失敗しても応募は通す。応募を取りこぼす方が重い
  when others then
    raise warning '応募の通知に失敗しました: %', sqlerrm;
    return new;
end;
$$;

-- ── 4. トリガー ──────────────────────────────────────
drop trigger if exists on_model_application_insert on public.model_applications;

create trigger on_model_application_insert
  after insert on public.model_applications
  for each row execute function public.notify_model_application();

-- ── 5. 動作確認 ──────────────────────────────────────
-- 下を実行すると Discord に1件届く。確認したら必ず消すこと。
--
--   insert into public.model_applications
--     (name, age, residence, contact_email, activity_type, aspirations,
--      agency_status, privacy_consent, website, face_photo_path, full_photo_path)
--   values
--     ('通知テスト', 25, '熊本市', 'test@example.com', 'model', 'テスト',
--      'none', true, '', 'test/face.jpg', 'test/full.jpg');
--
--   delete from public.model_applications where name = '通知テスト';
