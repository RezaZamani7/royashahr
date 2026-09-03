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

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const loadProfile = async () => {
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
      }
    } catch (err) {
      console.error("[loadProfile] error:", err);
    }
  };

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
    if (!user) return null;

    const field = GAME_FIELD[game];
    console.log("[submitScore]", { game, field, score, userId: user.uid, userEmail: user.email });

    const { data, error } = await supabase.rpc("upsert_user_score", {
      p_user_id: user.uid,
      p_user_email: user.email || "",
      p_game_field: field,
      p_score: score,
    });

    console.log("[submitScore] RPC result:", { data, error });

    if (error) {
      console.error("[submitScore] RPC error:", error);
      return null;
    }

    if (data) {
      setProfile((prev) => ({
        ...prev,
        total_score: (prev?.total_score ?? 0) + score,
        coins: (prev?.coins ?? 0) + (data.coinsEarned ?? 0),
        flags: (prev?.flags ?? 0) + (data.flagsEarned ?? 0),
        [field]: data.newHigh,
      }));
    }

    return data;
  };

  const value = { profile, loadProfile, submitScore, updateUsername };
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
