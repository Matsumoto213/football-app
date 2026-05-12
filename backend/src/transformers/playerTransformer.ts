import type { Player } from "../types/player";
import type { TeamRef } from "../types/team";

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
  const team: TeamRef = {
    id: entry.team.id,
    name: entry.team.name,
    logo: entry.team.logo,
  };
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
