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
    <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-md p-3 animate-pulse">
      <div className="w-9 h-9 bg-stone-200 rounded flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-stone-200 rounded w-28" />
        <div className="h-3 bg-stone-200 rounded w-16" />
      </div>
      <div className="w-5 h-5 bg-stone-200 rounded" />
    </div>
  );
}

function TeamCard({ team, isFavorite, onToggle }: {
  team: Team;
  isFavorite: boolean;
  onToggle: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-md p-3 hover:border-stone-300 hover:shadow-sm transition-all group">
      <Link href={`/teams/${team.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        {team.logo ? (
          <span className="flex-shrink-0 bg-stone-50 border border-stone-100 rounded p-1 inline-flex">
            <Image src={team.logo} alt={team.name} width={32} height={32} className="object-contain" />
          </span>
        ) : (
          <div className="w-9 h-9 bg-stone-100 rounded flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-800 truncate">{team.name}</p>
          <p className="text-xs text-stone-400">{team.country}</p>
        </div>
      </Link>
      <button
        onClick={() => onToggle(team.id)}
        className={`text-lg flex-shrink-0 transition-colors ${
          isFavorite ? "text-yellow-500" : "text-stone-200 group-hover:text-stone-300 hover:!text-yellow-400"
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
      {favoriteTeams.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-3">
            ★ お気に入り
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {favoriteTeams.map((team) => (
              <TeamCard key={team.id} team={team} isFavorite onToggle={toggleFavorite} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
          リーグからチームを探す
        </h2>
        <div className="flex flex-wrap gap-2">
          {LEAGUES.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeagueId(selectedLeagueId === league.id ? null : league.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all border ${
                selectedLeagueId === league.id
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:text-stone-800"
              }`}
            >
              <span>{league.flag}</span>
              <span>{league.name}</span>
            </button>
          ))}
        </div>
      </section>

      {selectedLeagueId !== null && (
        <section>
          {loadingTeams ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : leagueTeams.length === 0 ? (
            <p className="text-stone-400 text-sm">チームデータがありません</p>
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
        <p className="text-stone-400 text-sm mt-2">
          リーグを選択してチームを探し、★ でお気に入り登録できます
        </p>
      )}
    </div>
  );
}
