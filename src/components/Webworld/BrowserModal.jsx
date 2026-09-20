// پنجره‌ی مرورگر داخلی: یک iframe که فقط صفحات همین سایت را باز می‌کند تا
// کاربر بدون خروج از فضای سه‌بعدی، داخل سایت بماند.
export default function BrowserModal({ title, src, onClose }) {
  return (
    <div className="browser-modal-overlay" onClick={onClose}>
      <div className="browser-modal" onClick={(e) => e.stopPropagation()}>
        <div className="browser-modal-header">
          <span className="browser-modal-title">{title}</span>
          <div className="browser-modal-actions">
            <button className="browser-back-btn" onClick={onClose}>
              بازگشت به شهر
            </button>
            <button className="browser-close-btn" onClick={onClose} aria-label="بستن">
              ✕
            </button>
          </div>
        </div>
        <iframe
          className="browser-modal-frame"
          src={src}
          title={title}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
