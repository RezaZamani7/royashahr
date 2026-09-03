# رویاشهر - مرکز بازی

## راه‌اندازی پروژه

### ۱. نصب پکیج‌ها

```bash
cd royashahr
npm install
```

### ۲. ساخت پروژه Supabase

۱. به سایت [supabase.com](https://supabase.com) بروید و ثبت‌نام کنید
۲. یک پروژه جدید بسازید (پکیج رایگان کافی است)
۳. از بخش **Settings > API** مقادیر زیر را کپی کنید:
   - **Project URL**
   - **anon public key**

### ۳. ساخت جدول دیتابیس

۱. در داشبورد Supabase به بخش **SQL Editor** بروید
۲. محتوای فایل `supabase_setup.sql` را کپی کرده و اجرا کنید
۳. این کار جدول `users` را با تمام فیلدهای لازم می‌سازد

### ۴. تنظیم متغیرهای محیطی

فایل `.env` را در پوشه اصلی پروژه ویرایش کنید و مقادیر واقعی Supabase را قرار دهید:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### ۵. اجرای پروژه

```bash
npm run dev
```

سپس به آدرس `http://localhost:5173` بروید.

### ۶. ساخت نسخه نهایی

```bash
npm run build
npm run preview
```

## بازی‌ها

- **۲۰۴۸**: با کلیدهای جهت‌دار بازی کنید
- **تتریس**: ← → حرکت، ↑ چرخش، ↓ سرعت، Space رها کردن، P توقف
- **دایناسور**: Space یا ↑ برای پرش، ↓ برای خم شدن

## سیستم امتیازدهی

- هر ۱۰۰ امتیاز = ۱ سکه
- شکستن رکورد شخصی = ۱ پرچم به ازای هر ۱۰۰ امتیاز اضافه
- مجموع امتیازات همه بازی‌ها در پروفایل ثبت می‌شود

## ساختار فایل‌ها

```
src/
├── lib/supabase.js              # اتصال به Supabase
├── context/AuthContext.jsx      # احراز هویت
├── context/GameContext.jsx      # امتیاز، سکه، پرچم
├── components/Auth/             # ورود و ثبت‌نام
├── components/Dashboard/        # داشبورد و منو
├── components/Games/            # بازی‌ها
│   ├── Game2048.jsx
│   ├── Tetris.jsx
│   └── DinoGame.jsx
├── components/Leaderboard/       # رتبه‌بندی
├── App.jsx                      # مسیریابی
└── style.css                    # استایل
```
