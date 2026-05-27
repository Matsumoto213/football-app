import Image from "next/image";
import Link from "next/link";
import { getFixtureDetail, getFixtureLineups, getFixtureStats, getFixtureFormation } from "@/lib/apiClient";
import type { Fixture, FixtureStatus, FixtureTeamStats, FixtureStats, FixtureStatItem } from "@/types/fixture";
import { PitchView } from "./PitchView";

const STATUS_CONFIG: Record<FixtureStatus, { label: string; cls: string }> = {
  finished:  { label: "終了",  cls: "bg-stone-100 text-stone-500" },
  live:      { label: "LIVE", cls: "bg-red-50 text-red-600 font-semibold" },
  scheduled: { label: "予定", cls: "bg-stone-100 text-stone-400" },
  postponed: { label: "延期", cls: "bg-amber-50 text-amber-600" },
};

function StatBar({ item }: { item: FixtureStatItem }) {
  const parse = (v: string | number) =>
    typeof v === "number" ? v : parseFloat(String(v).replace("%", "")) || 0;
  const h = parse(item.home);
  const a = parse(item.away);
  const total = h + a || 1;
  const homePct = (h / total) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center">
        <span className="w-12 text-sm font-semibold text-stone-800 text-left">{item.home}</span>
        <span className="flex-1 text-center text-xs text-stone-400">{item.label}</span>
        <span className="w-12 text-sm font-semibold text-stone-800 text-right">{item.away}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px bg-stone-100">
        <div className="bg-green-500 rounded-l-full transition-all duration-700" style={{ width: `${homePct}%` }} />
        <div className="bg-blue-500 flex-1 rounded-r-full" />
      </div>
    </div>
  );
}

function LineupSection({ team }: { team: FixtureTeamStats }) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-100 bg-stone-50">
        {team.team.logo && (
          <Image src={team.team.logo} alt={team.team.name} width={20} height={20} className="object-contain" />
        )}
        <span className="font-semibold text-sm text-stone-700">{team.team.name}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-stone-400 border-b border-stone-100">
            <th className="text-left px-4 py-2 font-normal">選手</th>
            <th className="text-right px-2 py-2 font-normal w-10">評価</th>
            <th className="text-right px-2 py-2 font-normal w-8">G</th>
            <th className="text-right px-2 py-2 font-normal w-8">A</th>
            <th className="text-right px-4 py-2 font-normal w-10">分</th>
          </tr>
        </thead>
        <tbody>
          {team.players.map(({ player, stats }) => {
            const ratingNum = parseFloat(stats.rating ?? "");
            const ratingCls = isNaN(ratingNum) ? "text-stone-400"
              : ratingNum >= 8 ? "text-green-600 font-bold"
              : ratingNum >= 7 ? "text-stone-800"
              : "text-stone-400";

            return (
              <tr key={player.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                <td className="px-4 py-2">
                  <Link href={`/players/${player.id}`} className="flex items-center gap-2 hover:text-green-700 transition-colors">
                    {player.number != null && (
                      <span className="text-xs text-stone-400 font-mono w-5 text-right flex-shrink-0">
                        {player.number}
                      </span>
                    )}
                    <span className="text-stone-700">{player.name}</span>
                    {stats.yellowCards > 0 && (
                      <span className="w-2.5 h-3.5 bg-yellow-400 rounded-sm inline-block flex-shrink-0" />
                    )}
                    {stats.redCards > 0 && (
                      <span className="w-2.5 h-3.5 bg-red-600 rounded-sm inline-block flex-shrink-0" />
                    )}
                  </Link>
                </td>
                <td className={`text-right px-2 py-2 ${ratingCls}`}>{stats.rating ?? "—"}</td>
                <td className="text-right px-2 py-2 text-stone-400">
                  {stats.goals ? <span className="text-green-600 font-semibold">{stats.goals}</span> : "—"}
                </td>
                <td className="text-right px-2 py-2 text-stone-400">
                  {stats.assists ? <span className="text-blue-600 font-semibold">{stats.assists}</span> : "—"}
                </td>
                <td className="text-right px-4 py-2 text-stone-400">{stats.minutesPlayed ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function FixturePage({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = await params;

  const [fixture, lineups, statsResult, formations] = await Promise.all([
    getFixtureDetail(fixtureId).catch((): null => null),
    getFixtureLineups(fixtureId).catch((): FixtureTeamStats[] => []),
    getFixtureStats(fixtureId).catch((): [] => []),
    getFixtureFormation(fixtureId).catch((): [] => []),
  ]);

  const fixtureStats: FixtureStats | null = Array.isArray(statsResult) ? null : statsResult;

  if (!fixture) {
    return (
      <div className="space-y-4">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600">← トップ</Link>
        <p className="text-stone-400 text-sm">試合データが見つかりませんでした</p>
      </div>
    );
  }

  const { label, cls } = STATUS_CONFIG[fixture.status];
  const date = new Date(fixture.date).toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const homeScore = fixture.score.home;
  const awayScore = fixture.score.away;
  const showScore = fixture.status !== "scheduled";

  return (
    <div className="space-y-5">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
        ← トップ
      </Link>

      {/* Score card */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center gap-2 mb-6">
          {fixture.league.logo && (
            <Image src={fixture.league.logo} alt="" width={16} height={16} className="object-contain opacity-60" />
          )}
          <span className="text-xs text-stone-400">{fixture.league.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${cls}`}>{label}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 flex flex-col items-center gap-2">
            {fixture.homeTeam.logo && (
              <span className="bg-stone-50 border border-stone-100 rounded-lg p-2 inline-flex">
                <Image src={fixture.homeTeam.logo} alt={fixture.homeTeam.name} width={52} height={52} className="object-contain" />
              </span>
            )}
            <span className="text-sm font-semibold text-stone-800 text-center leading-snug">
              {fixture.homeTeam.name}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 min-w-[80px]">
            <div className="text-4xl font-black tabular-nums text-stone-900 tracking-tight">
              {showScore
                ? `${homeScore ?? "?"} – ${awayScore ?? "?"}`
                : <span className="text-2xl text-stone-300">vs</span>}
            </div>
            <span className="text-xs text-stone-400">{date}</span>
          </div>

          <div className="flex-1 flex flex-col items-center gap-2">
            {fixture.awayTeam.logo && (
              <span className="bg-stone-50 border border-stone-100 rounded-lg p-2 inline-flex">
                <Image src={fixture.awayTeam.logo} alt={fixture.awayTeam.name} width={52} height={52} className="object-contain" />
              </span>
            )}
            <span className="text-sm font-semibold text-stone-800 text-center leading-snug">
              {fixture.awayTeam.name}
            </span>
          </div>
        </div>

        {showScore && (
          <div className="flex justify-between mt-4 px-2">
            <span className="flex items-center gap-1.5 text-xs text-stone-400">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />ホーム
            </span>
            <span className="flex items-center gap-1.5 text-xs text-stone-400">
              アウェイ<span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            </span>
          </div>
        )}
      </div>

      {/* Match stats */}
      {fixtureStats && fixtureStats.stats.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-5">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-4">
            試合スタッツ
          </h2>
          <div className="space-y-4">
            {fixtureStats.stats.map((item) => (
              <StatBar key={item.label} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Lineups */}
      {formations.length >= 2 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
            出場選手
          </h2>
          <PitchView
            fixtureId={fixtureId}
            homeTeamId={fixture.homeTeam.id}
            formations={formations}
            lineups={lineups}
          />
        </section>
      ) : lineups.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
            出場選手
          </h2>
          {lineups.map((team) => <LineupSection key={team.team.id} team={team} />)}
        </section>
      ) : null}
    </div>
  );
}
