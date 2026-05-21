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
  players: PlayerMatchStats[];
};

export type FixtureStatItem = {
  label: string;
  home: string | number;
  away: string | number;
};

export type FixtureStats = {
  homeTeamId: number;
  awayTeamId: number;
  stats: FixtureStatItem[];
};

export type FormationPlayer = {
  id: number;
  name: string;
  number: number | null;
  pos: string;
  grid: string | null;
  isSubstitute: boolean;
};

export type TeamFormation = {
  team: { id: number; name: string; logo?: string };
  formation: string;
  startXI: FormationPlayer[];
  substitutes: FormationPlayer[];
};
