import type { Team } from "@/types/team";
import type { Fixture, FixtureTeamStats, FixtureStats, TeamFormation } from "@/types/fixture";
import type { Player, PlayerSeasonStats } from "@/types/player";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type ApiResponse<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { code: string; message: string } };

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 300 },
    ...init,
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error.message);
  return json.data;
}

export function searchTeams(q: string): Promise<Team[]> {
  return apiFetch(`/teams/search?q=${encodeURIComponent(q)}`, {
    cache: "no-store",
  });
}

export function getLeagueTeams(leagueId: number | string): Promise<Team[]> {
  return apiFetch(`/leagues/${leagueId}/teams`, { cache: "no-store" });
}

export function getTeam(teamId: number | string): Promise<Team> {
  return apiFetch(`/teams/${teamId}`);
}

export function getFixtures(
  teamId: number | string,
  type: "past" | "upcoming" | "recent" | "all"
): Promise<Fixture[]> {
  return apiFetch(`/teams/${teamId}/fixtures?type=${type}`, {
    cache: "no-store",
  });
}

export function getTeamPlayers(teamId: number | string): Promise<Player[]> {
  return apiFetch(`/teams/${teamId}/players`);
}

export function getFixtureDetail(fixtureId: number | string): Promise<Fixture> {
  return apiFetch(`/fixtures/${fixtureId}`);
}

export function getFixtureLineups(
  fixtureId: number | string
): Promise<FixtureTeamStats[]> {
  return apiFetch(`/fixtures/${fixtureId}/lineups`);
}

export function getFixtureStats(
  fixtureId: number | string
): Promise<FixtureStats | []> {
  return apiFetch(`/fixtures/${fixtureId}/stats`);
}

export function getFixtureFormation(
  fixtureId: number | string
): Promise<TeamFormation[]> {
  return apiFetch(`/fixtures/${fixtureId}/formation`);
}

export function getPlayer(
  playerId: number | string,
  season?: number | string
): Promise<Player> {
  const qs = season ? `?season=${season}` : "";
  return apiFetch(`/players/${playerId}${qs}`);
}

export function getPlayerStats(
  playerId: number | string,
  season?: number | string
): Promise<PlayerSeasonStats[]> {
  const qs = season ? `?season=${season}` : "";
  return apiFetch(`/players/${playerId}/stats${qs}`);
}
