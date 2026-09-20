import { useMemo } from "react";
import adsConfig from "../../adsConfig";

// یک جای‌نمایش تبلیغ. `slotKey` فقط برای تشخیص محل نمایش است و روی انتخاب تبلیغ
// اثری ندارد؛ از روی کل لیست adsConfig یک تبلیغ تصادفی انتخاب می‌شود تا آگهی
// مستقل از بازی، همیشه متفاوت و تصادفی باشد.
export default function AdBanner({ slotKey }) {
  const ads = adsConfig;

  // انتخاب تصادفی در هر بار نمایش؛ با [] فقط یک‌بار در mount انتخاب می‌شود
  const ad = useMemo(
    () => (ads.length ? ads[Math.floor(Math.random() * ads.length)] : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (!ad) return null;

  return (
    <a
      className="ad-banner"
      href={ad.link}
      target="_blank"
      rel="noopener noreferrer"
      title={ad.title || ad.link}
    >
      <img src={ad.image} alt={ad.title || "تبلیغ"} className="ad-banner-img" />
    </a>
  );
}
