import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (password !== confirm) {
      setError("رمز عبور و تکرار آن مطابقت ندارند");
      return;
    }
    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }
    try {
      const data = await register(email, password);
      if (data.session) {
        navigate("/dashboard");
      } else {
        setInfo("ثبت نام انجام شد! لطفاً ایمیل خود را تأیید کنید و سپس وارد شوید.");
      }
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        setError("این ایمیل قبلاً ثبت شده است. لطفاً وارد شوید.");
      } else if (msg.includes("password")) {
        setError("رمز عبور ضعیف است. حداقل ۶ کاراکتر وارد کنید.");
      } else if (msg.includes("email") || msg.includes("Invalid email")) {
        setError("ایمیل نامعتبر است.");
      } else if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
        setError("خطای شبکه. بررسی کنید که کلیدهای Supabase در فایل .env درست تنظیم شده باشند.");
      } else if (msg.includes("signal") || msg.includes("aborted")) {
        setError("ارتباط با سرور قطع شد. دوباره تلاش کنید.");
      } else {
        setError(msg || "ثبت نام انجام نشد. لطفاً دوباره تلاش کنید");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">رویاشهر</h1>
        <h2>ثبت نام</h2>
        {error && <p className="error-text">{error}</p>}
        {info && <p className="info-text">{info}</p>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="رمز عبور (حداقل ۶ کاراکتر)" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" placeholder="تکرار رمز عبور" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <button type="submit">ثبت نام</button>
        </form>
        <p className="auth-link">
          حساب دارید؟ <Link to="/login">ورود</Link>
        </p>
      </div>
    </div>
  );
}
