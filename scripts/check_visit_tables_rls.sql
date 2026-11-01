-- diaries / visits / spot_visits / city_visits のRLS状態確認用（読み取り専用・変更なし）

select tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('diaries', 'visits', 'spot_visits', 'city_visits')
order by tablename, cmd;
