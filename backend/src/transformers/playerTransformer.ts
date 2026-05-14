import type { Player, PlayerMatchStats, PlayerSeasonStats } from "../types/player";
import type { TeamRef } from "../types/team";

// ---------- Squad (チーム選手一覧) ----------

export interface ApiSquadEntry {
  team: { id: number; name: string; logo: string };
  players: Array<{
    id: number;
    name: string;
    age: number;
    number: number | null;
    position: string;
    photo: string;
  }>;
}

export function transformSquadPlayers(entry: ApiSquadEntry): Player[] {
  const team: TeamRef = { id: entry.team.id, name: entry.team.name, logo: entry.team.logo };
  return entry.players.map((p) => ({
    id: p.id,
    name: p.name,
    photo: p.photo || undefined,
    age: p.age,
    position: p.position,
    number: p.number ?? undefined,
    team,
  }));
}

// ---------- Fixture Players (試合別選手スタッツ) ----------

export interface ApiFixturePlayerEntry {
  team: { id: number; name: string; logo: string };
  players: Array<{
    player: { id: number; name: string; photo: string };
    statistics: Array<{
      games: {
        minutes: number | null;
        rating: string | null;
        captain: boolean;
        substitute: boolean;
      };
      goals: { total: number | null; assists: number | null };
      shots: { total: number | null; on: number | null };
      passes: { total: number | null; key: number | null };
      cards: { yellow: number; red: number };
    }>;
  }>;
}

export interface FixtureTeamStats {
  team: TeamRef;
  players: PlayerMatchStats[];
}

export function transformFixtureTeamStats(entry: ApiFixturePlayerEntry): FixtureTeamStats {
  const team: TeamRef = { id: entry.team.id, name: entry.team.name, logo: entry.team.logo };
  const players: PlayerMatchStats[] = entry.players.map((p) => {
    const s = p.statistics[0];
    return {
      player: {
        id: p.player.id,
        name: p.player.name,
        photo: p.player.photo || undefined,
      },
      team,
      stats: {
        goals: s?.goals.total ?? null,
        assists: s?.goals.assists ?? null,
        minutesPlayed: s?.games.minutes ?? null,
        rating: s?.games.rating ?? null,
        yellowCards: s?.cards.yellow ?? 0,
        redCards: s?.cards.red ?? 0,
        shots: s?.shots.total ?? null,
        passes: s?.passes.total ?? null,
      },
    };
  });
  return { team, players };
}

// ---------- Player Profile + Season Stats ----------

export interface ApiPlayerEntry {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    nationality: string;
    photo: string;
  };
  statistics: Array<{
    team: { id: number; name: string; logo: string };
    league: { id: number; name: string; logo: string; season: number };
    games: {
      appearences: number | null;
      minutes: number | null;
      rating: string | null;
    };
    goals: { total: number | null; assists: number | null };
    cards: { yellow: number | null; yellowred: number | null; red: number | null };
  }>;
}

export function transformPlayerProfile(entry: ApiPlayerEntry): Player {
  const firstStat = entry.statistics[0];
  return {
    id: entry.player.id,
    name: entry.player.name,
    photo: entry.player.photo || undefined,
    age: entry.player.age,
    nationality: entry.player.nationality,
    team: firstStat
      ? { id: firstStat.team.id, name: firstStat.team.name, logo: firstStat.team.logo }
      : undefined,
  };
}

export function transformPlayerSeasonStats(entry: ApiPlayerEntry): PlayerSeasonStats[] {
  return entry.statistics.map((s) => ({
    season: s.league.season,
    team: { id: s.team.id, name: s.team.name, logo: s.team.logo },
    league: { id: s.league.id, name: s.league.name, logo: s.league.logo, season: s.league.season },
    goals: s.goals.total ?? 0,
    assists: s.goals.assists ?? 0,
    appearances: s.games.appearences ?? 0,
    minutesPlayed: s.games.minutes ?? 0,
    yellowCards: (s.cards.yellow ?? 0) + (s.cards.yellowred ?? 0),
    redCards: s.cards.red ?? 0,
    rating: s.games.rating ?? undefined,
  }));
}
