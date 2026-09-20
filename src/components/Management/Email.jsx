import { useState } from "react";

// صفحه‌ی ایمیل (placeholder). داخل مرورگر داخلی ساختمان مدیریت باز می‌شود.
export default function Email() {
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mgmt-page">
      <h1>ارسال ایمیل</h1>
      {sent ? (
        <div className="mgmt-success">
          <p>✓ ایمیل شما ارسال شد.</p>
        </div>
      ) : (
        <form className="mgmt-form" onSubmit={submit}>
          <label>گیرنده</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="ایمیل گیرنده"
            required
          />
          <label>متن ایمیل</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="متن پیام"
            required
            rows={6}
          />
          <button type="submit" className="btn-primary">ارسال ایمیل</button>
        </form>
      )}
    </div>
  );
}
