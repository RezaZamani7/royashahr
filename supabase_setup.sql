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

-- سیاست (Policy) - فقط در صورت عدم وجود ایجاد می‌شوند
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

-- ایندکس برای مرتب‌سازی بر اساس امتیاز
CREATE INDEX IF NOT EXISTS idx_users_total_score ON users(total_score DESC);

-- تابع RPC برای ذخیره امتیاز (Security Definer برای صرف‌نظر شدن از RLS)
CREATE OR REPLACE FUNCTION upsert_user_score(
  p_user_id UUID,
  p_user_email TEXT,
  p_game_field TEXT,
  p_score INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_row RECORD;
  old_high_val INTEGER;
  new_high_val INTEGER;
  coins_earned INTEGER;
  flags_earned INTEGER;
  is_new_record BOOLEAN;
BEGIN
  -- اعتبارسنجی نام فیلد
  IF p_game_field NOT IN ('high_2048', 'high_tetris', 'high_dino', 'high_snake') THEN
    RAISE EXCEPTION 'Invalid game_field: %', p_game_field;
  END IF;

  coins_earned := FLOOR(p_score / 100);

  -- دریافت ردیف کاربر
  SELECT * INTO existing_row FROM users WHERE id = p_user_id;

  IF existing_row IS NULL THEN
    -- کاربر جدید: INSERT
    INSERT INTO users (
      id, username, email, total_score, coins, flags,
      high_2048, high_tetris, high_dino, high_snake
    ) VALUES (
      p_user_id,
      SPLIT_PART(p_user_email, '@', 1),
      p_user_email,
      p_score,
      coins_earned,
      coins_earned,
      CASE WHEN p_game_field = 'high_2048' THEN p_score ELSE 0 END,
      CASE WHEN p_game_field = 'high_tetris' THEN p_score ELSE 0 END,
      CASE WHEN p_game_field = 'high_dino' THEN p_score ELSE 0 END,
      CASE WHEN p_game_field = 'high_snake' THEN p_score ELSE 0 END
    );

    is_new_record := true;
    new_high_val := p_score;
    flags_earned := coins_earned;
  ELSE
    -- کاربر موجود: UPDATE
    EXECUTE format('SELECT %I FROM users WHERE id = $1', p_game_field) INTO old_high_val USING p_user_id;
    old_high_val := COALESCE(old_high_val, 0);
    new_high_val := GREATEST(old_high_val, p_score);
    is_new_record := p_score > old_high_val;
    flags_earned := CASE WHEN is_new_record THEN FLOOR((p_score - old_high_val) / 100) ELSE 0 END;

    EXECUTE format('
      UPDATE users SET
        total_score = total_score + $1,
        coins = coins + $2,
        flags = flags + $3,
        %I = GREATEST(%I, $4)
      WHERE id = $5
    ', p_game_field, p_game_field)
    USING p_score, coins_earned, flags_earned, p_score, p_user_id;
  END IF;

  RETURN json_build_object(
    'coinsEarned', coins_earned,
    'flagsEarned', flags_earned,
    'isNewRecord', is_new_record,
    'newHigh', new_high_val
  );
END;
$$;

-- اعطای دسترسی به role anon
GRANT EXECUTE ON FUNCTION upsert_user_score TO anon;
GRANT EXECUTE ON FUNCTION upsert_user_score TO authenticated;
