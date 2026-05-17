export interface IPlayerFavoriteRepository {
  getAll(): number[];
  add(playerId: number): void;
  remove(playerId: number): void;
  has(playerId: number): boolean;
}
