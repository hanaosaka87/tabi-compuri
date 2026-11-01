-- 旅コンプリ 追加修正：グループ作成直後に自分の新規グループが読めない問題
--
-- 原因：createGroup()は「groupsにINSERT→即座に.select()で取得→その後group_membersにINSERT」
--   という順序で動く。groupsのSELECTポリシーが「自分がメンバーのグループのみ」だと、
--   group_membersへの追加がまだ済んでいない一瞬の間、作成直後のグループ自身が
--   「自分のものなのに見えない」状態になり、new row violates row-level security policy
--   というエラーで作成そのものが失敗する。
--
-- 対策：グループ作成者自身（created_by = auth.uid()）は、group_membersへの
--   登録タイミングに関わらず常に自分のグループを見られるようにする。
--
-- 実行前に必ずChromeの自動翻訳をオフにしてから実行してください。
-- 対象プロジェクト: 旅コンプリのSupabaseプロジェクト（ref: sdnnyvmupbhudxjkjptd）

drop policy if exists "groups_select_members" on groups;
create policy "groups_select_members" on groups for select
  using (
    created_by = auth.uid() or is_group_member(id)
  );

-- 確認クエリ
select tablename, policyname, cmd, qual
from pg_policies
where tablename in ('groups', 'group_members')
order by tablename, cmd;
