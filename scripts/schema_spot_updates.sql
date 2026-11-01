-- スポットごとの「みんなの最新情報」投稿ボード（2026-09-26、テスターフィードバック対応）
-- 道の駅を深掘りしてほしいという要望を受け、ファンが最新情報を投稿できる仕組みを
-- 全カテゴリ共通の仕組みとして実装（道の駅・温泉・城・神社等すべてで使える）

create table if not exists spot_updates (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  spot_id text not null,
  spot_name text not null,
  user_id uuid references auth.users(id) on delete set null,
  nickname text not null default '名無しの旅人',
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_spot_updates_spot on spot_updates (category, spot_id, created_at desc);

alter table spot_updates enable row level security;

-- 閲覧は誰でも可能（ファン同士の情報共有が目的のため）
create policy "spot_updates_select_all" on spot_updates
  for select using (true);

-- 投稿はログインユーザーのみ・本人のuser_idでのみ可能（なりすまし投稿を防止）
create policy "spot_updates_insert_own" on spot_updates
  for insert with check (auth.uid() = user_id);

-- 削除は投稿者本人のみ（登録間違い等の自己修正用）
create policy "spot_updates_delete_own" on spot_updates
  for delete using (auth.uid() = user_id);
