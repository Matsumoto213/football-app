import type { TeamRef, League } from "./team";

export type Player = {
  id: number;
  name: string;
  photo?: string;
  age?: number;
  nationality?: string;
  position?: string;
  number?: number;
  team?: TeamRef;
};

export type PlayerSeasonStats = {
  season: number;
  team: TeamRef;
  league: League;
  goals: number;
  assists: number;
  appearances: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  rating?: string;
};
