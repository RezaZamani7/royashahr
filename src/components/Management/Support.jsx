import { useState } from "react";

// صفحه‌ی پشتیبانی / تیکت (placeholder). داخل مرورگر داخلی ساختمان مدیریت باز می‌شود.
export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mgmt-page">
      <h1>پشتیبانی / تیکت</h1>
      {sent ? (
        <div className="mgmt-success">
          <p>✓ تیکت شما ثبت شد. همکاران پشتیبانی به‌زودی پاسخ می‌دهند.</p>
        </div>
      ) : (
        <form className="mgmt-form" onSubmit={submit}>
          <label>موضوع</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="موضوع تیکت"
            required
          />
          <label>توضیحات</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="مشکل یا درخواست خود را بنویسید"
            required
            rows={5}
          />
          <button type="submit" className="btn-primary">ارسال تیکت</button>
        </form>
      )}
      <p className="mgmt-note">
        این صفحه نمونه است؛ در نسخه‌ی کامل به سیستم تیکت واقعی متصل می‌شود.
      </p>
    </div>
  );
}
