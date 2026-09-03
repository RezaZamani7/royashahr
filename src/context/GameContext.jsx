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
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.uid)
      .single();

    if (data) {
      setProfile(data);
    } else if (error && error.code === "PGRST116") {
      const newProfile = {
        id: user.uid,
        username: user.email.split("@")[0],
        email: user.email,
        total_score: 0,
        coins: 0,
        flags: 0,
        high_2048: 0,
        high_tetris: 0,
        high_dino: 0,
        high_snake: 0,
      };
      const { data: inserted } = await supabase.from("users").insert(newProfile).select().single();
      if (inserted) setProfile(inserted);
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
    if (!user || !profile) return null;

    const field = GAME_FIELD[game];
    const oldHigh = profile[field] || 0;
    const newHigh = Math.max(oldHigh, score);
    const isNewRecord = score > oldHigh;

    const coinsEarned = Math.floor(score / 100);
    let flagsEarned = 0;
    if (isNewRecord) {
      const diff = score - oldHigh;
      flagsEarned = Math.floor(diff / 100);
    }

    const newTotalScore = (profile.total_score || 0) + score;
    const newCoins = (profile.coins || 0) + coinsEarned;
    const newFlags = (profile.flags || 0) + flagsEarned;

    const updates = {
      total_score: newTotalScore,
      coins: newCoins,
      flags: newFlags,
      [field]: newHigh,
    };

    await supabase.from("users").update(updates).eq("id", user.uid);

    setProfile((prev) => ({
      ...prev,
      total_score: newTotalScore,
      coins: newCoins,
      flags: newFlags,
      [field]: newHigh,
    }));

    return { coinsEarned, flagsEarned, isNewRecord, newHigh };
  };

  const value = { profile, loadProfile, submitScore, updateUsername };
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
