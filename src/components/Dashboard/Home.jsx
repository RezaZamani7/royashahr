import { useState } from "react";
import { useGame } from "../../context/GameContext";
import { useNavigate } from "react-router-dom";
import AdBanner from "../Ads/AdBanner";
import BrowserModal from "../Webworld/BrowserModal";

// ساختمان‌های قابل انتخاب از صفحه اصلی:
//  - ساختمان بازی: به صفحه مجموعه بازی هدایت می‌شود
//  - ساختمان مدرسه (شاد) و موزه: در مرورگر داخلی باز می‌شوند
const BUILDINGS = [
  {
    id: "games",
    icon: "🎮",
    title: "ساختمان بازی",
    desc: "مجموعه بازی‌های آنلاین",
    type: "route",
    path: "/games",
  },
  {
    id: "school",
    icon: "🏫",
    title: "ساختمان مدرسه (شاد)",
    desc: "ورود به سامانه شاد",
    type: "url",
    src: "https://web.shad.ir/",
  },
  {
    id: "museum",
    icon: "🏛️",
    title: "موزه ملی",
    desc: "تور مجازی موزه ملی ایران",
    type: "url",
    src: "https://irannationalmuseum.ir/Virtula-Tour/National%20Museum%20Virtual%20Tour.html",
  },
  {
    id: "shop",
    icon: "🛍️",
    title: "ساختمان خرید",
    desc: "فروشگاه آنلاین دیجی‌کالا",
    type: "url",
    src: "https://www.digikala.com/",
  },
];

export default function Home() {
  const { profile } = useGame();
  const navigate = useNavigate();
  const [browser, setBrowser] = useState(null);

  const openBuilding = (b) => {
    if (b.type === "route") navigate(b.path);
    else if (b.type === "url") {
      // سایت‌های خارجی در پنجره‌ی داخلی (iframe) باز می‌شوند.
      const frameBlockers = [];
      const isBlocked = frameBlockers.some((h) => b.src.includes(h));
      if (isBlocked) {
        window.open(b.src, "_blank", "noopener,noreferrer");
      } else {
        setBrowser({ title: b.title, src: b.src });
      }
    }
  };

  return (
    <div className="home">
      <div className="hero">
        <h1>به رویاشهر خوش آمدید!</h1>
        <p>مرکز بازی های آنلاین - سرگرمی و مسابقه</p>
        <button className="btn-primary world-enter-btn" onClick={() => navigate("/world")}>
          🏙️ ورود به شهر سه‌بعدی
        </button>
      </div>

      {/* انتخاب ساختمان‌ها */}
      <div className="buildings-section">
        <h2>🏢 انتخاب ساختمان</h2>
        <div className="games-grid">
          {BUILDINGS.map((b) => (
            <div key={b.id} className="game-card" onClick={() => openBuilding(b)}>
              <div className="game-icon">{b.icon}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {profile && (
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-icon">⭐</span>
            <div>
              <p className="stat-label">مجموع امتیاز</p>
              <p className="stat-value">{profile.total_score?.toLocaleString("fa-IR") || "۰"}</p>
            </div>
          </div>
          <div className="stat">
            <span className="stat-icon stat-icon-coin"></span>
            <div>
              <p className="stat-label">سکه ها</p>
              <p className="stat-value">{profile.coins?.toLocaleString("fa-IR") || "۰"}</p>
            </div>
          </div>
          <div className="stat">
            <span className="stat-icon">🚩</span>
            <div>
              <p className="stat-label">پرچم ها</p>
              <p className="stat-value">{profile.flags?.toLocaleString("fa-IR") || "۰"}</p>
            </div>
          </div>
        </div>
      )}

      <AdBanner slotKey="home" />

      {browser && (
        <BrowserModal
          title={browser.title}
          src={browser.src}
          backLabel="بستن"
          onClose={() => setBrowser(null)}
        />
      )}
    </div>
  );
}
