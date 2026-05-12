import type { Fixture, FixtureStatus } from "../types/fixture";

export interface ApiFixtureEntry {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    logo: string;
    season: number;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

const STATUS_MAP: Record<string, FixtureStatus> = {
  FT: "finished", AET: "finished", PEN: "finished",
  NS: "scheduled", TBD: "scheduled",
  "1H": "live", HT: "live", "2H": "live", ET: "live", LIVE: "live", P: "live",
  PST: "postponed", CANC: "postponed", ABD: "postponed", AWD: "postponed",
};

function toStatus(short: string): FixtureStatus {
  return STATUS_MAP[short] ?? "scheduled";
}

export function transformFixture(entry: ApiFixtureEntry): Fixture {
  return {
    id: entry.fixture.id,
    date: entry.fixture.date,
    status: toStatus(entry.fixture.status.short),
    homeTeam: {
      id: entry.teams.home.id,
      name: entry.teams.home.name,
      logo: entry.teams.home.logo,
    },
    awayTeam: {
      id: entry.teams.away.id,
      name: entry.teams.away.name,
      logo: entry.teams.away.logo,
    },
    score: {
      home: entry.goals.home,
      away: entry.goals.away,
    },
    league: {
      id: entry.league.id,
      name: entry.league.name,
      logo: entry.league.logo,
      season: entry.league.season,
    },
  };
}
