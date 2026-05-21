"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getLeagueTeams, getTeam } from "@/lib/apiClient";
import { LocalStorageTeamFavoriteRepository } from "@/lib/favorites/LocalStorageTeamFavoriteRepository";
import type { Team } from "@/types/team";

const repo = new LocalStorageTeamFavoriteRepository();

const LEAGUES = [
  { id: 39,  name: "Premier League",   flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 140, name: "La Liga",          flag: "🇪🇸" },
  { id: 78,  name: "Bundesliga",       flag: "🇩🇪" },
  { id: 135, name: "Serie A",          flag: "🇮🇹" },
  { id: 61,  name: "Ligue 1",          flag: "🇫🇷" },
  { id: 88,  name: "Eredivisie",       flag: "🇳🇱" },
  { id: 94,  name: "Primeira Liga",    flag: "🇵🇹" },
  { id: 2,   name: "Champions League", flag: "🏆" },
  { id: 98,  name: "J1 League",        flag: "🇯🇵" },
] as const;

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3 animate-pulse">
      <div className="w-9 h-9 bg-zinc-800 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-zinc-800 rounded w-28" />
        <div className="h-3 bg-zinc-800 rounded w-16" />
      </div>
      <div className="w-5 h-5 bg-zinc-800 rounded" />
    </div>
  );
}

function TeamCard({ team, isFavorite, onToggle }: {
  team: Team;
  isFavorite: boolean;
  onToggle: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-zinc-700 transition-colors group">
      <Link href={`/teams/${team.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        {team.logo ? (
          <Image src={team.logo} alt={team.name} width={36} height={36} className="object-contain flex-shrink-0" />
        ) : (
          <div className="w-9 h-9 bg-zinc-800 rounded-lg flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate">{team.name}</p>
          <p className="text-xs text-zinc-500">{team.country}</p>
        </div>
      </Link>
      <button
        onClick={() => onToggle(team.id)}
        className={`text-lg flex-shrink-0 transition-colors ${
          isFavorite ? "text-yellow-400" : "text-zinc-700 group-hover:text-zinc-500 hover:!text-yellow-400"
        }`}
        aria-label={isFavorite ? "お気に入り解除" : "お気に入り登録"}
      >
        {isFavorite ? "★" : "☆"}
      </button>
    </div>
  );
}

export default function TopPage() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [leagueTeams, setLeagueTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favoriteTeams, setFavoriteTeams] = useState<Team[]>([]);

  useEffect(() => {
    const ids = repo.getAll();
    setFavoriteIds(ids);
    if (ids.length === 0) return;
    Promise.all(ids.map((id) => getTeam(id).catch(() => null)))
      .then((teams) => setFavoriteTeams(teams.filter(Boolean) as Team[]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedLeagueId === null) { setLeagueTeams([]); return; }
    setLoadingTeams(true);
    setLeagueTeams([]);
    getLeagueTeams(selectedLeagueId)
      .then(setLeagueTeams)
      .catch(() => setLeagueTeams([]))
      .finally(() => setLoadingTeams(false));
  }, [selectedLeagueId]);

  const toggleFavorite = (teamId: number) => {
    if (repo.has(teamId)) {
      repo.remove(teamId);
      setFavoriteIds((ids) => ids.filter((id) => id !== teamId));
      setFavoriteTeams((ts) => ts.filter((t) => t.id !== teamId));
    } else {
      repo.add(teamId);
      setFavoriteIds((ids) => [...ids, teamId]);
      const team = leagueTeams.find((t) => t.id === teamId);
      if (team) setFavoriteTeams((ts) => [...ts, team]);
    }
  };

  return (
    <div className="space-y-8">
      {/* お気に入りチーム */}
      {favoriteTeams.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-yellow-500/80 uppercase tracking-widest mb-3">
            ★ お気に入り
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {favoriteTeams.map((team) => (
              <TeamCard key={team.id} team={team} isFavorite onToggle={toggleFavorite} />
            ))}
          </div>
        </section>
      )}

      {/* リーグ選択 */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          リーグからチームを探す
        </h2>
        <div className="flex flex-wrap gap-2">
          {LEAGUES.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeagueId(selectedLeagueId === league.id ? null : league.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedLeagueId === league.id
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
              }`}
            >
              <span>{league.flag}</span>
              <span>{league.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* チーム一覧 */}
      {selectedLeagueId !== null && (
        <section>
          {loadingTeams ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : leagueTeams.length === 0 ? (
            <p className="text-zinc-600 text-sm">チームデータがありません</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {leagueTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isFavorite={favoriteIds.includes(team.id)}
                  onToggle={toggleFavorite}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {selectedLeagueId === null && favoriteTeams.length === 0 && (
        <p className="text-zinc-700 text-sm mt-2">
          リーグを選択してチームを探し、★ でお気に入り登録できます
        </p>
      )}
    </div>
  );
}
