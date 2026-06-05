-- app_reviews: アプリへの星評価＋コメント
CREATE TABLE IF NOT EXISTS app_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_insert" ON app_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_select" ON app_reviews FOR SELECT USING (true);

-- app_feedbacks: 開発者へのフィードバック
CREATE TABLE IF NOT EXISTS app_feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('bug', 'request', 'other')),
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE app_feedbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedbacks_insert" ON app_feedbacks FOR INSERT WITH CHECK (true);
CREATE POLICY "feedbacks_select" ON app_feedbacks FOR SELECT USING (auth.role() = 'authenticated');
