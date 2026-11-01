-- 旅コンプリ セキュリティ対応：グループ招待コードの全公開・無断参加を修正
-- 背景：groups の select ポリシーが using(true) で招待コードを含む全データが誰でも取得可能だった。
--       さらに group_members の insert ポリシーが招待コードの正当性を一切検証しておらず、
--       group_idさえ分かれば招待コードなしで任意のグループへ無断参加できてしまう状態だった。

-- 1. groups: 自分がメンバーのグループのみ閲覧可能に変更
drop policy if exists "groups_select" on groups;
create policy "groups_select_members" on groups for select
  using (
    exists (
      select 1 from group_members
      where group_id = groups.id and user_id = auth.uid()
    )
  );

-- 2. group_members: 自分がメンバーであるグループの他メンバー一覧のみ閲覧可能に変更
drop policy if exists "group_members_select" on group_members;
create policy "group_members_select_own_groups" on group_members for select
  using (
    exists (
      select 1 from group_members gm2
      where gm2.group_id = group_members.group_id and gm2.user_id = auth.uid()
    )
  );

-- 3. group_members: 直接INSERTは「グループ作成者が自分自身を追加する場合」のみ許可
--    （招待コード経由の新規参加は下記の join_group_by_code 関数経由のみに限定）
drop policy if exists "group_members_insert" on group_members;
create policy "group_members_insert_own_group" on group_members for insert
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from groups
      where id = group_members.group_id and created_by = auth.uid()
    )
  );

-- 4. 招待コード引き換え関数（SECURITY DEFINER・auth.uid()を内部利用し外部からuser_idを渡させない）
create or replace function public.join_group_by_code(p_code text)
returns uuid
language plpgsql
security definer
as $$
declare
  v_group_id uuid;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select id into v_group_id from groups where invite_code = p_code;

  if v_group_id is null then
    raise exception 'invalid invite code';
  end if;

  insert into group_members (group_id, user_id)
  values (v_group_id, v_user_id)
  on conflict (group_id, user_id) do nothing;

  return v_group_id;
end;
$$;

-- 確認クエリ（実行後、groups/group_membersのポリシー一覧を確認）
select tablename, policyname, cmd
from pg_policies
where tablename in ('groups', 'group_members')
order by tablename, cmd;
