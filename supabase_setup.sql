-- رویاشهر - اسکریپت ساخت جدول در Supabase
-- این اسکریپت را در بخش SQL Editor در داشبورد Supabase اجرا کنید

-- 1. جدول کاربران
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL DEFAULT 'ناشناس',
  email TEXT NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 0,
  flags INTEGER NOT NULL DEFAULT 0,
  high_2048 INTEGER NOT NULL DEFAULT 0,
  high_tetris INTEGER NOT NULL DEFAULT 0,
  high_dino INTEGER NOT NULL DEFAULT 0,
  high_snake INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. فعال کردن RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. سیاست‌ها (Policies) - فقط در صورت عدم وجود ایجاد می‌شوند
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can read own data') THEN
    CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can update own data') THEN
    CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Users can insert own data') THEN
    CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Anyone can read leaderboard') THEN
    CREATE POLICY "Anyone can read leaderboard" ON users FOR SELECT USING (true);
  END IF;
END;
$$;

-- 4. ایندکس برای مرتب‌سازی بر اساس امتیاز
CREATE INDEX IF NOT EXISTS idx_users_total_score ON users(total_score DESC);

-- 5. ⚠️ اگر جدول از قبل وجود داشته باشد و ستون high_snake ندارد، این خط را اجرا کنید:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS high_snake INTEGER NOT NULL DEFAULT 0;
