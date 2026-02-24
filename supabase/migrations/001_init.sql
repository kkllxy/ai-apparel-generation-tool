-- 生成记录表
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_ref_url TEXT,
  outfit_ref_url TEXT,
  prompt TEXT,
  result_url TEXT,
  pose TEXT,
  color_scheme TEXT,
  custom_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读写（简化版，无登录）
CREATE POLICY "Allow all access" ON generations FOR ALL USING (true) WITH CHECK (true);

-- ===========================
-- Storage Policies for images bucket
-- ===========================
-- 允许匿名上传
CREATE POLICY "Allow public uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images');

-- 允许公开读取
CREATE POLICY "Allow public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- 允许更新
CREATE POLICY "Allow public update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'images');

-- 允许删除
CREATE POLICY "Allow public delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'images');
