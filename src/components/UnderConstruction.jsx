// صفحه‌ی «در دست ساخت» که برای ساختمان‌های هنوز فعال‌نشده نمایش داده می‌شود.
export default function UnderConstruction({ title, onClose, backLabel = "بستن" }) {
  return (
    <div className="browser-modal-overlay" onClick={onClose}>
      <div className="browser-modal under-construction-modal" onClick={(e) => e.stopPropagation()}>
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
        <div className="under-construction-content">
          <div className="under-construction-icon">🚧</div>
          <h3>در دست ساخت</h3>
          <p>این بخش به‌زودی فعال می‌شود. لطفاً بعداً مراجعه کنید.</p>
        </div>
      </div>
    </div>
  );
}
