import type { IPlayerFavoriteRepository } from "./IPlayerFavoriteRepository";

const KEY = "football_app:favorite_players";

export class LocalStoragePlayerFavoriteRepository
  implements IPlayerFavoriteRepository
{
  getAll(): number[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      return [];
    }
  }

  add(playerId: number): void {
    const ids = this.getAll();
    if (!ids.includes(playerId)) {
      localStorage.setItem(KEY, JSON.stringify([...ids, playerId]));
    }
  }

  remove(playerId: number): void {
    const ids = this.getAll().filter((id) => id !== playerId);
    localStorage.setItem(KEY, JSON.stringify(ids));
  }

  has(playerId: number): boolean {
    return this.getAll().includes(playerId);
  }
}
