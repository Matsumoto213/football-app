"use client";

import { useState, useEffect } from "react";
import { LocalStoragePlayerFavoriteRepository } from "@/lib/favorites/LocalStoragePlayerFavoriteRepository";

const repo = new LocalStoragePlayerFavoriteRepository();

export default function PlayerFavoriteButton({ playerId }: { playerId: number }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(repo.has(playerId));
  }, [playerId]);

  const toggle = () => {
    if (repo.has(playerId)) {
      repo.remove(playerId);
      setIsFavorite(false);
    } else {
      repo.add(playerId);
      setIsFavorite(true);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`text-xl flex-shrink-0 ${
        isFavorite ? "text-yellow-400" : "text-zinc-600 hover:text-yellow-400"
      } transition-colors`}
      aria-label={isFavorite ? "お気に入り解除" : "お気に入り登録"}
    >
      {isFavorite ? "★" : "☆"}
    </button>
  );
}
