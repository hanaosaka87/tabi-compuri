-- 旅コンプリ 緊急修正：group_membersのRLSポリシーで無限再帰が発生しグループ作成が全て失敗していた問題
--
-- 原因：group_migration_invite_security.sql で作成した
--   "group_members_select_own_groups" ポリシーが、group_members テーブル自身を
--   （別名gm2として）SELECTで参照する自己参照ポリシーになっていた。
--   PostgreSQLのRLSでは、ポリシー内で同じテーブルを参照するとその参照にも
--   同じポリシーが再度適用されるため、無限再帰（42P17）になる。
--
-- 対策：SECURITY DEFINER関数でRLSをバイパスしたメンバーシップ判定を行い、
--   ポリシーからはその関数を呼ぶだけにする。
--
-- 実行前に必ずChromeの自動翻訳をオフにしてから実行してください。
-- 対象プロジェクト: 旅コンプリのSupabaseプロジェクト（ref: sdnnyvmupbhudxjkjptd）

create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from group_members
    where group_id = p_group_id and user_id = auth.uid()
  );
$$;

drop policy if exists "group_members_select_own_groups" on group_members;
create policy "group_members_select_own_groups" on group_members for select
  using (is_group_member(group_id));

drop policy if exists "groups_select_members" on groups;
create policy "groups_select_members" on groups for select
  using (is_group_member(id));

-- 確認クエリ（実行後、groups/group_membersのポリシー一覧を確認）
select tablename, policyname, cmd, qual
from pg_policies
where tablename in ('groups', 'group_members')
order by tablename, cmd;
