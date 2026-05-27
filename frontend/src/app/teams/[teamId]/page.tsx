"use client";

import { use, useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getTeam, getFixtures, getTeamPlayers } from "@/lib/apiClient";
import { LocalStorageTeamFavoriteRepository } from "@/lib/favorites/LocalStorageTeamFavoriteRepository";
import type { Team } from "@/types/team";
import type { Fixture, FixtureStatus } from "@/types/fixture";
import type { Player } from "@/types/player";
import type { League } from "@/types/team";

const repo = new LocalStorageTeamFavoriteRepository();

const STATUS_CONFIG: Record<FixtureStatus, { label: string; cls: string }> = {
  finished:  { label: "FT",   cls: "bg-stone-100 text-stone-500" },
  live:      { label: "LIVE", cls: "bg-red-50 text-red-600 font-semibold" },
  scheduled: { label: "予定", cls: "bg-stone-100 text-stone-400" },
  postponed: { label: "延期", cls: "bg-amber-50 text-amber-600" },
};

const positionCls = (pos?: string) => {
  if (!pos) return "bg-stone-100 text-stone-500";
  if (pos.includes("Goalkeeper")) return "bg-amber-50 text-amber-700";
  if (pos.includes("Defender"))   return "bg-blue-50 text-blue-700";
  if (pos.includes("Midfielder")) return "bg-green-50 text-green-700";
  if (pos.includes("Attacker"))   return "bg-red-50 text-red-700";
  return "bg-stone-100 text-stone-500";
};

function HeaderSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-stone-200 rounded flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-5 bg-stone-200 rounded w-36" />
          <div className="h-4 bg-stone-200 rounded w-24" />
          <div className="h-3 bg-stone-200 rounded w-40" />
        </div>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-md p-3 animate-pulse">
      <div className="w-8 h-8 bg-stone-200 rounded flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-stone-200 rounded w-40" />
        <div className="h-3 bg-stone-200 rounded w-20" />
      </div>
      <div className="w-12 h-5 bg-stone-200 rounded" />
    </div>
  );
}

function FixtureCard({ fixture, teamId }: { fixture: Fixture; teamId: number }) {
  const { label, cls } = STATUS_CONFIG[fixture.status];
  const date = new Date(fixture.date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
  const isHome = fixture.homeTeam.id === teamId;
  const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
  const myScore = isHome ? fixture.score.home : fixture.score.away;
  const opScore = isHome ? fixture.score.away : fixture.score.home;

  const resultCls =
    fixture.status !== "finished" ? "text-stone-500"
    : myScore != null && opScore != null && myScore > opScore ? "text-green-700"
    : myScore != null && opScore != null && myScore < opScore ? "text-red-600"
    : "text-stone-500";

  return (
    <Link
      href={`/fixtures/${fixture.id}`}
      className="flex items-center gap-2 bg-white border border-stone-200 rounded-md px-3 py-2.5 hover:border-stone-300 hover:shadow-sm transition-all"
    >
      <span className="text-xs text-stone-400 w-10 flex-shrink-0">{date}</span>

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {opponent.logo && (
          <span className="flex-shrink-0 bg-stone-50 border border-stone-100 rounded p-0.5 inline-flex">
            <Image src={opponent.logo} alt={opponent.name} width={18} height={18} className="object-contain" />
          </span>
        )}
        <span className="text-sm text-stone-700 truncate">vs {opponent.name}</span>
      </div>

      {fixture.status === "finished" && myScore != null && opScore != null && (
        <span className={`text-sm font-bold tabular-nums flex-shrink-0 ${resultCls}`}>
          {myScore} – {opScore}
        </span>
      )}

      <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${cls}`}>{label}</span>
    </Link>
  );
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="flex items-center gap-3 bg-white border border-stone-200 rounded-md p-3 hover:border-stone-300 hover:shadow-sm transition-all"
    >
      {player.photo ? (
        <Image src={player.photo} alt={player.name} width={36} height={36} className="rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-stone-100 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 truncate">{player.name}</p>
        {player.position && (
          <span className={`inline-block text-xs px-1.5 py-0.5 rounded mt-0.5 ${positionCls(player.position)}`}>
            {player.position}
          </span>
        )}
      </div>
      {player.number != null && (
        <span className="text-xs text-stone-400 font-mono flex-shrink-0">#{player.number}</span>
      )}
    </Link>
  );
}

type Tab = "fixtures" | "players";
type LeagueGroup = { league: League; fixtures: Fixture[] };

export default function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params);
  const id = Number(teamId);

  const [team, setTeam] = useState<Team | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [tab, setTab] = useState<Tab>("fixtures");
  const [allFixtures, setAllFixtures] = useState<Fixture[]>([]);
  const [loadingFixtures, setLoadingFixtures] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const leagueGroups = useMemo<LeagueGroup[]>(() => {
    const map = new Map<number, LeagueGroup>();
    for (const f of allFixtures) {
      if (!map.has(f.league.id)) {
        map.set(f.league.id, { league: f.league, fixtures: [] });
      }
      map.get(f.league.id)!.fixtures.push(f);
    }
    return Array.from(map.values());
  }, [allFixtures]);

  const displayedFixtures = useMemo<Fixture[]>(() => {
    if (selectedLeagueId === null) return [];
    return leagueGroups.find((g) => g.league.id === selectedLeagueId)?.fixtures ?? [];
  }, [leagueGroups, selectedLeagueId]);

  useEffect(() => {
    setIsFavorite(repo.has(id));
    getTeam(id)
      .then(setTeam)
      .catch(() => {})
      .finally(() => setLoadingTeam(false));
  }, [id]);

  const loadFixtures = useCallback(async () => {
    setLoadingFixtures(true);
    setAllFixtures([]);
    setSelectedLeagueId(null);
    try {
      const data = await getFixtures(id, "all");
      setAllFixtures(data);
      if (data.length > 0) setSelectedLeagueId(data[0].league.id);
    } catch {}
    finally { setLoadingFixtures(false); }
  }, [id]);

  const loadPlayers = useCallback(async () => {
    if (players.length > 0) return;
    setLoadingPlayers(true);
    try { setPlayers(await getTeamPlayers(id)); } catch {}
    finally { setLoadingPlayers(false); }
  }, [id, players.length]);

  useEffect(() => {
    if (tab === "fixtures") loadFixtures();
    else loadPlayers();
  }, [tab, loadFixtures, loadPlayers]);

  const toggleFavorite = () => {
    if (repo.has(id)) { repo.remove(id); setIsFavorite(false); }
    else { repo.add(id); setIsFavorite(true); }
  };

  return (
    <div className="space-y-5">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
        ← トップ
      </Link>

      {loadingTeam ? (
        <HeaderSkeleton />
      ) : !team ? (
        <p className="text-stone-500 text-sm">チームが見つかりませんでした</p>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-5">
          <div className="flex items-start gap-4">
            {team.logo ? (
              <span className="flex-shrink-0 bg-stone-50 border border-stone-100 rounded p-2 inline-flex">
                <Image src={team.logo} alt={team.name} width={56} height={56} className="object-contain" />
              </span>
            ) : (
              <div className="w-16 h-16 bg-stone-100 rounded flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-xl font-bold text-stone-900 leading-tight">{team.name}</h1>
                <button
                  onClick={toggleFavorite}
                  className={`text-2xl flex-shrink-0 leading-none transition-colors ${
                    isFavorite ? "text-yellow-500" : "text-stone-200 hover:text-yellow-400"
                  }`}
                  aria-label={isFavorite ? "お気に入り解除" : "お気に入り登録"}
                >
                  {isFavorite ? "★" : "☆"}
                </button>
              </div>
              <p className="text-sm text-stone-500 mt-1">
                {team.country}{team.founded && <span className="text-stone-400"> · {team.founded}</span>}
              </p>
              {team.venue && (
                <p className="text-xs text-stone-400 mt-1">
                  {team.venue.name}
                  {team.venue.capacity && ` · ${team.venue.capacity.toLocaleString()}席`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-stone-100 border border-stone-200 rounded-md p-1">
        {(["fixtures", "players"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
              tab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {t === "fixtures" ? "試合" : "選手"}
          </button>
        ))}
      </div>

      {tab === "fixtures" && (
        <div className="space-y-3">
          {loadingFixtures ? (
            <>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-7 w-28 bg-stone-200 rounded animate-pulse" />
                ))}
              </div>
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
              </div>
            </>
          ) : leagueGroups.length === 0 ? (
            <p className="text-stone-400 text-sm py-4 text-center">試合データがありません</p>
          ) : (
            <>
              <div className="flex gap-1.5 flex-wrap">
                {leagueGroups.map(({ league }) => (
                  <button
                    key={league.id}
                    onClick={() => setSelectedLeagueId(league.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded border transition-colors ${
                      selectedLeagueId === league.id
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-stone-500 border-stone-200 hover:border-stone-300 hover:text-stone-700"
                    }`}
                  >
                    {league.logo && (
                      <Image src={league.logo} alt="" width={12} height={12} className="object-contain flex-shrink-0" />
                    )}
                    {league.name}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {displayedFixtures.map((f) => (
                  <FixtureCard key={f.id} fixture={f} teamId={id} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "players" && (
        loadingPlayers ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : players.length === 0 ? (
          <p className="text-stone-400 text-sm py-4 text-center">選手データがありません</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {players.map((p) => <PlayerCard key={p.id} player={p} />)}
          </div>
        )
      )}
    </div>
  );
}
