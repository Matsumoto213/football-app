import type { League, TeamRef } from "./team";

export type FixtureStatus = "scheduled" | "live" | "finished" | "postponed";

export type Fixture = {
  id: number;
  date: string;
  status: FixtureStatus;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  score: {
    home: number | null;
    away: number | null;
  };
  league: League;
};
