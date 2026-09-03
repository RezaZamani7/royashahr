import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("Invalid login") || msg.includes("invalid credentials")) {
        setError("ایمیل یا رمز عبور اشتباه است");
      } else if (msg.includes("Email not confirmed") || msg.includes("not confirmed")) {
        setError("ایمیل شما تأیید نشده است. لطفاً صندوق ورودی ایمیل خود را بررسی کنید.");
      } else if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
        setError("خطای شبکه. بررسی کنید که کلیدهای Supabase در فایل .env درست تنظیم شده باشند.");
      } else {
        setError(msg || "ورود انجام نشد. لطفاً دوباره تلاش کنید");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">رویاشهر</h1>
        <h2>ورود</h2>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">ورود</button>
        </form>
        <p className="auth-link">
          حساب ندارید؟ <Link to="/register">ثبت نام</Link>
        </p>
      </div>
    </div>
  );
}
