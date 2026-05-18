"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getLeagueTeams, getTeam } from "@/lib/apiClient";
import { LocalStorageTeamFavoriteRepository } from "@/lib/favorites/LocalStorageTeamFavoriteRepository";
import type { Team } from "@/types/team";

const repo = new LocalStorageTeamFavoriteRepository();

const LEAGUES = [
  { id: 39,  name: "Premier League",   country: "England" },
  { id: 140, name: "La Liga",          country: "Spain" },
  { id: 78,  name: "Bundesliga",       country: "Germany" },
  { id: 135, name: "Serie A",          country: "Italy" },
  { id: 61,  name: "Ligue 1",          country: "France" },
  { id: 88,  name: "Eredivisie",       country: "Netherlands" },
  { id: 94,  name: "Primeira Liga",    country: "Portugal" },
  { id: 2,   name: "Champions League", country: "Europe" },
  { id: 98,  name: "J1 League",        country: "Japan" },
] as const;

function TeamCard({ team, isFavorite, onToggle }: {
  team: Team;
  isFavorite: boolean;
  onToggle: (id: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors group">
      <Link href={`/teams/${team.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        {team.logo && (
          <Image
            src={team.logo}
            alt={team.name}
            width={32}
            height={32}
            className="object-contain flex-shrink-0"
          />
        )}
        <span className="text-sm font-medium text-zinc-200 truncate">{team.name}</span>
      </Link>
      <button
        onClick={() => onToggle(team.id)}
        className={`text-lg flex-shrink-0 transition-colors ${
          isFavorite ? "text-yellow-400" : "text-zinc-700 group-hover:text-zinc-500"
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
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favoriteTeams, setFavoriteTeams] = useState<Team[]>([]);

  // お気に入りチームのID一覧とデータを初期ロード
  useEffect(() => {
    const ids = repo.getAll();
    setFavoriteIds(ids);
    if (ids.length === 0) return;
    Promise.all(ids.map((id) => getTeam(id).catch(() => null)))
      .then((teams) => setFavoriteTeams(teams.filter(Boolean) as Team[]))
      .catch(() => {});
  }, []);

  // リーグ選択時にチーム一覧を取得
  useEffect(() => {
    if (selectedLeagueId === null) {
      setLeagueTeams([]);
      return;
    }
    setLoading(true);
    setLeagueTeams([]);
    getLeagueTeams(selectedLeagueId)
      .then((data) => setLeagueTeams(data))
      .catch(() => setLeagueTeams([]))
      .finally(() => setLoading(false));
  }, [selectedLeagueId]);

  const toggleFavorite = (teamId: number) => {
    if (repo.has(teamId)) {
      repo.remove(teamId);
      setFavoriteIds((ids) => ids.filter((id) => id !== teamId));
      setFavoriteTeams((teams) => teams.filter((t) => t.id !== teamId));
    } else {
      repo.add(teamId);
      setFavoriteIds((ids) => [...ids, teamId]);
      const team = leagueTeams.find((t) => t.id === teamId);
      if (team) setFavoriteTeams((teams) => [...teams, team]);
    }
  };

  return (
    <div className="space-y-8">
      {/* お気に入りチーム（常時表示） */}
      {favoriteTeams.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-yellow-500 uppercase tracking-wider mb-3">
            お気に入りチーム
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {favoriteTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isFavorite
                onToggle={toggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* リーグ選択 */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          リーグからチームを選択
        </h2>
        <div className="flex flex-wrap gap-2">
          {LEAGUES.map((league) => (
            <button
              key={league.id}
              onClick={() =>
                setSelectedLeagueId(
                  selectedLeagueId === league.id ? null : league.id
                )
              }
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedLeagueId === league.id
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {league.name}
            </button>
          ))}
        </div>
      </section>

      {/* チーム一覧 */}
      {selectedLeagueId !== null && (
        <section>
          {loading ? (
            <p className="text-zinc-500 text-sm">読み込み中...</p>
          ) : leagueTeams.length === 0 ? (
            <p className="text-zinc-500 text-sm">チームデータがありません</p>
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
        <p className="text-zinc-600 text-sm">
          上のリーグを選択してチームを探し、★ でお気に入り登録できます
        </p>
      )}
    </div>
  );
}
