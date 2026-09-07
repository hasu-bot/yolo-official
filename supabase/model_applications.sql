-- 応募フォーム（/model/）が書き込む先の設定。
-- Supabase ダッシュボードの SQL Editor で実行する。
-- 制度上の要件は yolo-members/docs/creative-yolo/23-OFFICIAL-MODEL-PROGRAM.md §4-1。

-- ── 現状確認 ──────────────────────────────────────────────
-- select policyname, cmd, roles, qual, with_check
--   from pg_policies
--  where schemaname = 'public' and tablename = 'model_applications';

-- ── 1. 保護者の情報を保存する列 ────────────────────────────
-- 16〜17歳は保護者の氏名・連絡先・同意が必須（23 §4-1-4）
alter table public.model_applications
  add column if not exists guardian_name    text,
  add column if not exists guardian_contact text,
  add column if not exists guardian_consent boolean not null default false;

-- ── 2. 応募の登録を許可する ────────────────────────────────
-- 2026-09-08 時点で INSERT のポリシーが無く、応募が
-- "new row violates row-level security policy" で必ず失敗していた。
--
-- クライアント側の検査は迂回できるので、要件は with check にも書く。
-- 特に年齢と保護者同意は制度の根幹なので、DBレベルで守る。
drop policy if exists "public can submit model applications" on public.model_applications;

create policy "public can submit model applications"
  on public.model_applications
  for insert
  to anon
  with check (
    -- ハニーポット（人間は触らない隠し項目）
    website = ''
    -- 利用目的への同意
    and privacy_consent = true
    -- 15歳以下は登録できない（23 §4-1-4）
    and age between 16 and 120
    and char_length(btrim(name)) between 1 and 100
    and char_length(btrim(contact_email)) between 3 and 320
    -- 16〜17歳は保護者の氏名・連絡先・同意が揃っていること
    and (
      age >= 18
      or (
        guardian_consent = true
        and char_length(btrim(coalesce(guardian_name, ''))) > 0
        and char_length(btrim(coalesce(guardian_contact, ''))) > 0
      )
    )
  );

-- ── 3. 読み取りは許可しない ────────────────────────────────
-- anon に select を与えると応募内容が誰でも読める。
-- 運営が見るときは service_role（管理画面・ダッシュボード）を使う。
-- ※ 現状 anon への select は拒否されている。この状態が正しいので変更しない。
