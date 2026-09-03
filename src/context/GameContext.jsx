import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const GameContext = createContext();

export function useGame() {
  return useContext(GameContext);
}

export function GameProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  const ensureProfile = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.uid)
        .maybeSingle();

      if (data) {
        const safe = {
          total_score: data.total_score ?? 0,
          coins: data.coins ?? 0,
          flags: data.flags ?? 0,
          high_2048: data.high_2048 ?? 0,
          high_tetris: data.high_tetris ?? 0,
          high_dino: data.high_dino ?? 0,
          high_snake: data.high_snake ?? 0,
        };
        setProfile({ ...data, ...safe });
        return { ...data, ...safe };
      }

      if (error) {
        console.error("[ensureProfile] SELECT error:", error);
      }

      const newProfile = {
        id: user.uid,
        username: user.email?.split("@")[0] ?? "user",
        email: user.email ?? "",
        total_score: 0,
        coins: 0,
        flags: 0,
        high_2048: 0,
        high_tetris: 0,
        high_dino: 0,
        high_snake: 0,
      };
      const { data: inserted, error: insertErr } = await supabase
        .from("users")
        .insert(newProfile)
        .select()
        .single();

      if (insertErr) {
        console.error("[ensureProfile] INSERT error:", insertErr);
        return null;
      }
      setProfile(inserted);
      return inserted;
    } catch (err) {
      console.error("[ensureProfile] Unexpected error:", err);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      ensureProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const updateUsername = async (newName) => {
    if (!user || !profile) return;
    await supabase.from("users").update({ username: newName }).eq("id", user.uid);
    setProfile((prev) => ({ ...prev, username: newName }));
  };

  const GAME_FIELD = {
    game2048: "high_2048",
    tetris: "high_tetris",
    dino: "high_dino",
    snake: "high_snake",
  };

  const submitScore = async (game, score) => {
    if (!user) {
      console.error("[submitScore] No user");
      return null;
    }

    const field = GAME_FIELD[game];

    const freshProfile = await ensureProfile();
    if (!freshProfile) {
      console.error("[submitScore] No profile available");
      return null;
    }

    const oldHigh = freshProfile[field] || 0;
    const newHigh = Math.max(oldHigh, score);
    const isNewRecord = score > oldHigh;
    const coinsEarned = Math.floor(score / 100);
    let flagsEarned = 0;
    if (isNewRecord) {
      flagsEarned = Math.floor((score - oldHigh) / 100);
    }

    const updates = {
      total_score: (freshProfile.total_score || 0) + score,
      coins: (freshProfile.coins || 0) + coinsEarned,
      flags: (freshProfile.flags || 0) + flagsEarned,
      [field]: newHigh,
    };

    const { data: updated, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.uid)
      .select();

    if (error) {
      console.error("[submitScore] UPDATE error:", error);
      return null;
    }

    if (!updated || updated.length === 0) {
      console.warn("[submitScore] UPDATE affected 0 rows");
      const { error: insertErr } = await supabase
        .from("users")
        .insert({ id: user.uid, ...updates })
        .select()
        .single();

      if (insertErr) {
        console.error("[submitScore] INSERT fallback error:", insertErr);
        return null;
      }
    }

    setProfile((prev) => ({ ...prev, ...updates }));
    return { coinsEarned, flagsEarned, isNewRecord, newHigh };
  };

  const value = { profile, loadProfile: ensureProfile, submitScore, updateUsername };
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
