"use client";

import { use, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getTeam, getFixtures, getTeamPlayers } from "@/lib/apiClient";
import { LocalStorageTeamFavoriteRepository } from "@/lib/favorites/LocalStorageTeamFavoriteRepository";
import type { Team } from "@/types/team";
import type { Fixture } from "@/types/fixture";
import type { Player } from "@/types/player";

const repo = new LocalStorageTeamFavoriteRepository();

const STATUS_LABEL: Record<string, string> = {
  finished: "終了",
  live: "LIVE",
  scheduled: "予定",
  postponed: "延期",
};

const STATUS_CLASS: Record<string, string> = {
  finished: "text-zinc-400 bg-zinc-800",
  live: "text-red-400 bg-red-950",
  scheduled: "text-emerald-400 bg-emerald-950",
  postponed: "text-yellow-400 bg-yellow-950",
};

function FixtureCard({ fixture, teamId }: { fixture: Fixture; teamId: number }) {
  const isHome = fixture.homeTeam.id === teamId;
  const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;
  const date = new Date(fixture.date).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });

  return (
    <Link
      href={`/fixtures/${fixture.id}`}
      className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-emerald-700 transition-colors"
    >
      <span className="text-xs text-zinc-500 w-10 flex-shrink-0">{date}</span>
      {opponent.logo && (
        <Image
          src={opponent.logo}
          alt={opponent.name}
          width={24}
          height={24}
          className="object-contain flex-shrink-0"
        />
      )}
      <span className="text-sm text-zinc-200 flex-1 truncate">
        {isHome ? "vs" : "@"} {opponent.name}
      </span>
      {fixture.status === "finished" && (
        <span className="text-sm font-mono text-zinc-300">
          {fixture.score.home} - {fixture.score.away}
        </span>
      )}
      <span
        className={`text-xs px-1.5 py-0.5 rounded ${STATUS_CLASS[fixture.status]}`}
      >
        {STATUS_LABEL[fixture.status]}
      </span>
    </Link>
  );
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-emerald-700 transition-colors"
    >
      {player.photo && (
        <Image
          src={player.photo}
          alt={player.name}
          width={32}
          height={32}
          className="rounded-full object-cover flex-shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-200 truncate">{player.name}</p>
        {player.position && (
          <p className="text-xs text-zinc-500">{player.position}</p>
        )}
      </div>
      {player.number != null && (
        <span className="text-xs text-zinc-500">#{player.number}</span>
      )}
    </Link>
  );
}

type FixtureType = "past" | "upcoming" | "recent";

export default function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = use(params);
  const id = Number(teamId);

  const [team, setTeam] = useState<Team | null>(null);
  const [tab, setTab] = useState<"fixtures" | "players">("fixtures");
  const [fixtureType, setFixtureType] = useState<FixtureType>("recent");
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(repo.has(id));
    getTeam(id)
      .then((t) => {
        setTeam(t);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const loadFixtures = useCallback(
    async (type: FixtureType) => {
      setFixtures([]);
      try {
        const data = await getFixtures(id, type);
        setFixtures(data);
      } catch {}
    },
    [id]
  );

  const loadPlayers = useCallback(async () => {
    if (players.length > 0) return;
    try {
      const data = await getTeamPlayers(id);
      setPlayers(data);
    } catch {}
  }, [id, players.length]);

  useEffect(() => {
    if (tab === "fixtures") {
      loadFixtures(fixtureType);
    } else {
      loadPlayers();
    }
  }, [tab, fixtureType, loadFixtures, loadPlayers]);

  const toggleFavorite = () => {
    if (repo.has(id)) {
      repo.remove(id);
      setIsFavorite(false);
    } else {
      repo.add(id);
      setIsFavorite(true);
    }
  };

  if (loading) {
    return <p className="text-zinc-500 text-sm">読み込み中...</p>;
  }
  if (!team) {
    return <p className="text-zinc-400 text-sm">チームが見つかりませんでした</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-xs text-zinc-500 hover:text-zinc-300 mb-4 inline-block"
        >
          ← トップに戻る
        </Link>
        <div className="flex items-start gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          {team.logo && (
            <Image
              src={team.logo}
              alt={team.name}
              width={56}
              height={56}
              className="object-contain flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-bold text-zinc-50 truncate">
                {team.name}
              </h1>
              <button
                onClick={toggleFavorite}
                className={`text-xl flex-shrink-0 ${
                  isFavorite ? "text-yellow-400" : "text-zinc-600 hover:text-yellow-400"
                } transition-colors`}
                aria-label={isFavorite ? "お気に入り解除" : "お気に入り登録"}
              >
                {isFavorite ? "★" : "☆"}
              </button>
            </div>
            <p className="text-sm text-zinc-400">
              {team.country}
              {team.founded && ` · 創設 ${team.founded}年`}
            </p>
            {team.venue && (
              <p className="text-xs text-zinc-500 mt-1">
                {team.venue.name}
                {team.venue.city && ` (${team.venue.city})`}
                {team.venue.capacity &&
                  ` · ${team.venue.capacity.toLocaleString()}席`}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-1">
        {(["fixtures", "players"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              tab === t
                ? "bg-emerald-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t === "fixtures" ? "試合" : "選手"}
          </button>
        ))}
      </div>

      {tab === "fixtures" && (
        <div className="space-y-3">
          <div className="flex gap-1">
            {(["recent", "past", "upcoming"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFixtureType(type)}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  fixtureType === type
                    ? "bg-zinc-700 text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {type === "recent" ? "直近" : type === "past" ? "過去" : "今後"}
              </button>
            ))}
          </div>
          {fixtures.length === 0 ? (
            <p className="text-zinc-500 text-sm">試合データなし</p>
          ) : (
            <div className="space-y-2">
              {fixtures.map((f) => (
                <FixtureCard key={f.id} fixture={f} teamId={id} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "players" && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {players.length === 0 ? (
            <p className="text-zinc-500 text-sm col-span-2">選手データなし</p>
          ) : (
            players.map((p) => <PlayerCard key={p.id} player={p} />)
          )}
        </div>
      )}
    </div>
  );
}
