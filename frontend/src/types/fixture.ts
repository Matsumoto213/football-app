import type { TeamRef, League } from "./team";

export type FixtureStatus = "scheduled" | "live" | "finished" | "postponed";

export type Fixture = {
  id: number;
  date: string;
  status: FixtureStatus;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  score: { home: number | null; away: number | null };
  league: League;
};

export type PlayerMatchStats = {
  player: { id: number; name: string; photo?: string; number?: number };
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

export type FixtureTeamStats = {
  team: TeamRef;
  formation: string | null;
  players: PlayerMatchStats[];
};
