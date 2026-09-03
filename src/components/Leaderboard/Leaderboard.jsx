import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, username, total_score, coins, flags")
        .order("total_score", { ascending: false })
        .limit(50);

      if (!error && data) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Leaderboard error:", err);
    }
    setLoading(false);
  };

  const userRank = users.findIndex((u) => u.id === user?.uid) + 1;

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <button onClick={() => navigate("/dashboard")}>← بازگشت</button>
        <h1>🏆 رتبه بندی کاربران</h1>
        <button onClick={loadLeaderboard} className="refresh-btn">🔄 تازه سازی</button>
      </div>

      {user && userRank > 0 && (
        <div className="user-rank-card">
          رتبه شما: <strong>{userRank.toLocaleString("fa-IR")}</strong> از {users.length.toLocaleString("fa-IR")}
        </div>
      )}

      {loading ? (
        <p className="loading-text">در حال بارگذاری...</p>
      ) : (
        <div className="leaderboard-table">
          <div className="lb-header">
            <span>رتبه</span>
            <span>نام کاربری</span>
            <span>مجموع امتیاز</span>
            <span>سکه</span>
            <span>پرچم</span>
          </div>
          {users.map((u, i) => (
            <div
              key={u.id}
              className={`lb-row ${u.id === user?.uid ? "lb-my-row" : ""}`}
            >
              <span className="lb-rank">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1).toLocaleString("fa-IR")}
              </span>
              <span className="lb-name">{u.username || "ناشناس"}</span>
              <span className="lb-score">{(u.total_score || 0).toLocaleString("fa-IR")}</span>
              <span className="lb-coins">{(u.coins || 0).toLocaleString("fa-IR")}</span>
              <span className="lb-flags">{(u.flags || 0).toLocaleString("fa-IR")}</span>
            </div>
          ))}
          {users.length === 0 && <p className="empty-text">هنوز کاربری ثبت نام نکرده است</p>}
        </div>
      )}
    </div>
  );
}
