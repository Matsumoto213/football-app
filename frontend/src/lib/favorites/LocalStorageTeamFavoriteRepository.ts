import type { ITeamFavoriteRepository } from "./ITeamFavoriteRepository";

const KEY = "football_app:favorite_teams";

export class LocalStorageTeamFavoriteRepository
  implements ITeamFavoriteRepository
{
  getAll(): number[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      return [];
    }
  }

  add(teamId: number): void {
    const ids = this.getAll();
    if (!ids.includes(teamId)) {
      localStorage.setItem(KEY, JSON.stringify([...ids, teamId]));
    }
  }

  remove(teamId: number): void {
    const ids = this.getAll().filter((id) => id !== teamId);
    localStorage.setItem(KEY, JSON.stringify(ids));
  }

  has(teamId: number): boolean {
    return this.getAll().includes(teamId);
  }
}
