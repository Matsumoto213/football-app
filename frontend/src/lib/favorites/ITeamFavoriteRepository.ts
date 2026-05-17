export interface ITeamFavoriteRepository {
  getAll(): number[];
  add(teamId: number): void;
  remove(teamId: number): void;
  has(teamId: number): boolean;
}
