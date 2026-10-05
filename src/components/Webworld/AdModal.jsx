import { useMemo } from "react";
import adsConfig from "../../adsConfig";

// پاپ‌آپ شروع بازی: یک تبلیغ تصادفی + راهنمای بازی را نمایش می‌دهد.
// با بستن این پاپ‌آپ (onClose) بازی واقعاً شروع می‌شود.
export default function AdModal({ title, instructions = [], onClose }) {
  const ad = useMemo(
    () => (adsConfig.length ? adsConfig[Math.floor(Math.random() * adsConfig.length)] : null),
    []
  );

  return (
    <div className="modal-overlay">
      <div className="modal game-intro-modal" onClick={(e) => e.stopPropagation()}>
        <h2>بازی {title}</h2>
        {ad && (
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ad-modal-link"
            title={ad.title || ad.link}
          >
            <img src={ad.image} alt={ad.title || "تبلیغ"} className="ad-modal-img" />
          </a>
        )}
        {instructions.length > 0 && (
          <div className="game-intro-guide">
            <p className="game-intro-guide-title">🎮 راهنمای بازی:</p>
            <ul>
              {instructions.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}
        <button className="btn-primary" onClick={onClose}>بستن و شروع بازی ✕</button>
      </div>
    </div>
  );
}
