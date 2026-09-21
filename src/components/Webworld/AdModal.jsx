import { useMemo } from "react";
import adsConfig from "../../adsConfig";

export default function AdModal({ onClose }) {
  const ad = useMemo(
    () => (adsConfig.length ? adsConfig[Math.floor(Math.random() * adsConfig.length)] : null),
    []
  );

  if (!ad) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ad-modal-content" onClick={(e) => e.stopPropagation()}>
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="ad-modal-link"
          title={ad.title || ad.link}
        >
          <img src={ad.image} alt={ad.title || "تبلیغ"} className="ad-modal-img" />
        </a>
        <button className="ad-modal-close" onClick={onClose}>
          بستن و شروع بازی ✕
        </button>
      </div>
    </div>
  );
}
