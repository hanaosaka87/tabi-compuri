-- 「みんなの最新情報」に写真添付（1枚まで）を追加（2026-09-26）
alter table spot_updates add column if not exists photo_url text;
