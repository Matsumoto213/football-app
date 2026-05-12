import type { League, TeamRef } from "./team";

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

export type PlayerMatchStats = {
  player: Player;
  team: TeamRef;
  stats: {
    goals: number | null;
    assists: number | null;
    minutesPlayed: number | null;
    rating: string | null;
    yellowCards: number;
    redCards: number;
    shots: number | null;
    passes: number | null;
  };
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
