import type { Team, TeamRef } from "../types/team";

export interface ApiTeamEntry {
  team: {
    id: number;
    name: string;
    logo: string;
    country: string;
    founded: number | null;
  };
  venue: {
    name: string | null;
    city: string | null;
    capacity: number | null;
  } | null;
}

export interface ApiLeagueForTeam {
  id: number;
  name: string;
  logo: string;
  season: number;
}

export function transformTeam(entry: ApiTeamEntry, league?: ApiLeagueForTeam): Team {
  return {
    id: entry.team.id,
    name: entry.team.name,
    logo: entry.team.logo,
    country: entry.team.country,
    founded: entry.team.founded ?? undefined,
    venue:
      entry.venue?.name && entry.venue?.city
        ? {
            name: entry.venue.name,
            city: entry.venue.city,
            capacity: entry.venue.capacity ?? undefined,
          }
        : undefined,
    league: league
      ? { id: league.id, name: league.name, logo: league.logo, season: league.season }
      : undefined,
  };
}

export function transformTeamRef(raw: { id: number; name: string; logo: string }): TeamRef {
  return { id: raw.id, name: raw.name, logo: raw.logo };
}
