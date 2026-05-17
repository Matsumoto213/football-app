"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { searchTeams, getTeam } from "@/lib/apiClient";
import { LocalStorageTeamFavoriteRepository } from "@/lib/favorites/LocalStorageTeamFavoriteRepository";
import type { Team } from "@/types/team";

const repo = new LocalStorageTeamFavoriteRepository();

function TeamCard({ team }: { team: Team }) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-emerald-700 transition-colors"
    >
      {team.logo && (
        <Image
          src={team.logo}
          alt={team.name}
          width={36}
          height={36}
          className="object-contain flex-shrink-0"
        />
      )}
      <div className="min-w-0">
        <p className="font-medium text-zinc-50 truncate">{team.name}</p>
        <p className="text-xs text-zinc-500">{team.country}</p>
      </div>
    </Link>
  );
}

export default function TopPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Team[]>([]);
  const [searching, setSearching] = useState(false);
  const [favoriteTeams, setFavoriteTeams] = useState<Team[]>([]);

  useEffect(() => {
    const ids = repo.getAll();
    if (ids.length === 0) return;
    Promise.all(ids.map((id) => getTeam(id).catch(() => null)))
      .then((teams) => setFavoriteTeams(teams.filter(Boolean) as Team[]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchTeams(query);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-8">
      <section>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="チーム名を入力（3文字以上）"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-50 placeholder-zinc-500 focus:outline-none focus:border-emerald-600"
        />
      </section>

      {query.length >= 3 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            検索結果
          </h2>
          {searching ? (
            <p className="text-zinc-500 text-sm">検索中...</p>
          ) : results.length === 0 ? (
            <p className="text-zinc-500 text-sm">チームが見つかりませんでした</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {results.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          お気に入りチーム
        </h2>
        {favoriteTeams.length === 0 ? (
          <p className="text-zinc-500 text-sm">
            チームページでお気に入り登録するとここに表示されます
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {favoriteTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
