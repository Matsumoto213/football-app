"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPlayerFixtures } from "@/lib/apiClient";
import type { PlayerSeasonStats } from "@/types/player";
import type { Fixture, FixtureStatus } from "@/types/fixture";

type Tab = "season" | "fixtures";

const STATUS_CONFIG: Record<FixtureStatus, { label: string; cls: string }> = {
  finished:  { label: "FT",   cls: "bg-stone-100 text-stone-500" },
  live:      { label: "LIVE", cls: "bg-red-50 text-red-600 font-semibold" },
  scheduled: { label: "予定", cls: "bg-stone-100 text-stone-400" },
  postponed: { label: "延期", cls: "bg-amber-50 text-amber-600" },
};

function FixtureCard({ fixture, playerId, teamId }: { fixture: Fixture; playerId: number; teamId?: number }) {
  const { label, cls } = STATUS_CONFIG[fixture.status];
  const date = new Date(fixture.date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });

  const isHome = fixture.homeTeam.id === teamId;
  const myScore = isHome ? fixture.score.home : fixture.score.away;
  const opScore = isHome ? fixture.score.away : fixture.score.home;
  const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;

  const resultCls =
    myScore != null && opScore != null && myScore > opScore ? "text-green-700"
    : myScore != null && opScore != null && myScore < opScore ? "text-red-600"
    : "text-stone-500";

  return (
    <Link
      href={`/fixtures/${fixture.id}/players/${playerId}`}
      className="flex items-center gap-2 bg-white border border-stone-200 rounded-md px-3 py-2.5 hover:border-stone-300 hover:shadow-sm transition-all"
    >
      <span className="text-xs text-stone-400 w-10 flex-shrink-0">{date}</span>

      {fixture.league.logo && (
        <Image src={fixture.league.logo} alt="" width={13} height={13} className="object-contain flex-shrink-0 opacity-60" />
      )}

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {opponent.logo && (
          <span className="flex-shrink-0 bg-stone-50 border border-stone-100 rounded p-0.5 inline-flex">
            <Image src={opponent.logo} alt={opponent.name} width={16} height={16} className="object-contain" />
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

function RowSkeleton() {
  return (
    <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-md px-3 py-2.5 animate-pulse">
      <div className="w-10 h-3 bg-stone-200 rounded flex-shrink-0" />
      <div className="flex-1 h-3 bg-stone-200 rounded" />
      <div className="w-12 h-3 bg-stone-200 rounded flex-shrink-0" />
    </div>
  );
}

export default function PlayerTabsSection({
  playerId,
  teamId,
  stats,
}: {
  playerId: number;
  teamId?: number;
  stats: PlayerSeasonStats[];
}) {
  const [tab, setTab] = useState<Tab>("season");
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFixturesTab = useCallback(async () => {
    setTab("fixtures");
    if (fixtures !== null) return;
    if (!teamId) { setFixtures([]); return; }
    setLoading(true);
    try {
      setFixtures(await getPlayerFixtures(playerId, teamId));
    } catch {
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  }, [playerId, teamId, fixtures]);

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-stone-100 border border-stone-200 rounded-md p-1">
        <button
          onClick={() => setTab("season")}
          className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
            tab === "season" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
          }`}
        >
          シーズンスタッツ
        </button>
        <button
          onClick={handleFixturesTab}
          className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
            tab === "fixtures" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
          }`}
        >
          直近の試合
        </button>
      </div>

      {tab === "season" && (
        stats.length === 0 ? (
          <p className="text-stone-400 text-sm py-4 text-center">スタッツデータがありません</p>
        ) : (
          <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-stone-400 border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-2 font-normal">チーム / リーグ</th>
                  <th className="text-right px-2 py-2 font-normal">出場</th>
                  <th className="text-right px-2 py-2 font-normal">G</th>
                  <th className="text-right px-2 py-2 font-normal">A</th>
                  <th className="text-right px-4 py-2 font-normal">評価</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat, i) => (
                  <tr key={i} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {stat.team.logo && (
                          <span className="bg-stone-50 border border-stone-100 rounded p-0.5 inline-flex flex-shrink-0">
                            <Image src={stat.team.logo} alt={stat.team.name} width={14} height={14} className="object-contain" />
                          </span>
                        )}
                        <span className="text-stone-700 text-sm">{stat.team.name}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {stat.league.logo && (
                          <Image src={stat.league.logo} alt={stat.league.name} width={12} height={12} className="object-contain" />
                        )}
                        <span className="text-xs text-stone-400">{stat.league.name} · {stat.season}</span>
                      </div>
                    </td>
                    <td className="text-right px-2 py-2 text-stone-600">{stat.appearances}</td>
                    <td className="text-right px-2 py-2 text-stone-600">{stat.goals}</td>
                    <td className="text-right px-2 py-2 text-stone-600">{stat.assists}</td>
                    <td className="text-right px-4 py-2 text-stone-400">{stat.rating ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === "fixtures" && (
        loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : !fixtures || fixtures.length === 0 ? (
          <p className="text-stone-400 text-sm py-4 text-center">試合データがありません</p>
        ) : (
          <div className="space-y-2">
            {fixtures.map((f) => (
              <FixtureCard key={f.id} fixture={f} playerId={playerId} teamId={teamId} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
