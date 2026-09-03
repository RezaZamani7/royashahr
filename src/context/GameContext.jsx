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

      console.log("[ensureProfile] Creating new profile for user:", user.uid);
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
        console.error("[ensureProfile] INSERT error:", {
          message: insertErr.message,
          code: insertErr.code,
          details: insertErr.details,
          hint: insertErr.hint,
        });
        return null;
      }

      console.log("[ensureProfile] Profile created successfully:", inserted?.id);
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
    console.log("[submitScore] Starting", { game, field, score, userId: user.uid });

    const freshProfile = await ensureProfile();
    if (!freshProfile) {
      console.error("[submitScore] Could not load or create profile");
      return null;
    }

    const oldHigh = freshProfile[field] || 0;
    const newHigh = Math.max(oldHigh, score);
    const isNewRecord = score > oldHigh;
    const coinsEarned = Math.floor(score / 100);
    let flagsEarned = 0;
    if (isNewRecord) {
      const diff = score - oldHigh;
      flagsEarned = Math.floor(diff / 100);
    }

    const updates = {
      total_score: (freshProfile.total_score || 0) + score,
      coins: (freshProfile.coins || 0) + coinsEarned,
      flags: (freshProfile.flags || 0) + flagsEarned,
      [field]: newHigh,
    };

    console.log("[submitScore] Attempting UPDATE:", { updates, userId: user.uid });

    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.uid)
      .select();

    console.log("[submitScore] UPDATE result:", { updated, updateError });

    if (updateError) {
      console.error("[submitScore] UPDATE failed:", updateError.message);

      const { data: upserted, error: upsertError } = await supabase
        .from("users")
        .upsert({
          id: user.uid,
          username: freshProfile.username,
          email: freshProfile.email,
          ...updates,
        }, { onConflict: "id" })
        .select()
        .single();

      if (upsertError) {
        console.error("[submitScore] UPSERT fallback failed:", upsertError.message);
        return null;
      }

      console.log("[submitScore] UPSERT fallback succeeded:", upserted);
      setProfile(upserted);
      return { coinsEarned, flagsEarned, isNewRecord, newHigh };
    }

    if (!updated || updated.length === 0) {
      console.error("[submitScore] UPDATE affected 0 rows. Trying insert...");

      const { data: inserted, error: insertError } = await supabase
        .from("users")
        .insert({ id: user.uid, ...updates })
        .select()
        .single();

      if (insertError) {
        console.error("[submitScore] INSERT fallback failed:", insertError.message);
        return null;
      }

      console.log("[submitScore] INSERT fallback succeeded:", inserted);
      setProfile(inserted);
    } else {
      console.log("[submitScore] UPDATE succeeded:", updated);
      setProfile((prev) => ({
        ...prev,
        ...updates,
      }));
    }

    return { coinsEarned, flagsEarned, isNewRecord, newHigh };
  };

  const value = { profile, loadProfile: ensureProfile, submitScore, updateUsername };
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
