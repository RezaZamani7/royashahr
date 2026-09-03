-- رویاشهر - اسکریپت ساخت جدول در Supabase
-- این اسکریپت را در بخش SQL Editor در داشبورد Supabase اجرا کنید

-- جدول کاربران
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

-- فعال کردن RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- سیاست: کاربران می‌توانند داده‌های خود را بخوانند
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- سیاست: کاربران می‌توانند داده‌های خود را به‌روز کنند
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- سیاست: کاربران می‌توانند داده‌های خود را وارد کنند
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- سیاست: همه می‌توانند برای رتبه‌بندی داده‌ها را بخوانند
CREATE POLICY "Anyone can read leaderboard" ON users
  FOR SELECT USING (true);

-- ایندکس برای مرتب‌سازی بر اساس امتیاز
CREATE INDEX IF NOT EXISTS idx_users_total_score ON users(total_score DESC);
