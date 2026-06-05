-- Phase4: グループ機能
-- Supabase の SQL Editor で実行してください

-- グループテーブル
create table if not exists groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  icon text not null default '👨‍👩‍👧',
  invite_code text unique not null,
  created_by uuid references auth.users not null,
  created_at timestamptz default now() not null
);

-- グループメンバーテーブル
create table if not exists group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  joined_at timestamptz default now() not null,
  unique(group_id, user_id)
);

-- RLS有効化
alter table groups enable row level security;
alter table group_members enable row level security;

-- groups: 全員読み取り可（招待コード6桁で実質アクセス制御）
create policy "groups_select" on groups for select using (true);
create policy "groups_insert" on groups for insert with check (created_by = auth.uid());
create policy "groups_update" on groups for update using (created_by = auth.uid());
create policy "groups_delete" on groups for delete using (created_by = auth.uid());

-- group_members: 全員読み取り可（グループIDはUUIDなので推測不可）
create policy "group_members_select" on group_members for select using (true);
create policy "group_members_insert" on group_members for insert with check (user_id = auth.uid());
create policy "group_members_delete" on group_members for delete using (user_id = auth.uid());
