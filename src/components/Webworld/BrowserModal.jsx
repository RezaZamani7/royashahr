// پنجره‌ی مرورگر داخلی: یک iframe که صفحات (داخلی یا خارجی) را بدون خروج از
// صفحه‌ی فعلی باز می‌کند.
export default function BrowserModal({ title, src, onClose, backLabel = "بازگشت به شهر" }) {
  return (
    <div className="browser-modal-overlay" onClick={onClose}>
      <div className="browser-modal" onClick={(e) => e.stopPropagation()}>
        <div className="browser-modal-header">
          <span className="browser-modal-title">{title}</span>
          <div className="browser-modal-actions">
            <button className="browser-back-btn" onClick={onClose}>
              {backLabel}
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
