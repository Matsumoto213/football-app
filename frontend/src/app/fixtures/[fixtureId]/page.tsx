import Image from "next/image";
import Link from "next/link";
import { getFixtureDetail, getFixtureLineups, getFixtureStats, getFixtureFormation } from "@/lib/apiClient";
import type { Fixture, FixtureStatus, FixtureTeamStats, FixtureStats, FixtureStatItem } from "@/types/fixture";
import { PitchView } from "./PitchView";

// ---- Status badge ----
const STATUS_CONFIG: Record<FixtureStatus, { label: string; cls: string }> = {
  finished:  { label: "終了",  cls: "bg-zinc-800 text-zinc-400" },
  live:      { label: "LIVE", cls: "bg-red-950 text-red-400" },
  scheduled: { label: "予定", cls: "bg-zinc-800 text-zinc-500" },
  postponed: { label: "延期", cls: "bg-yellow-950 text-yellow-400" },
};

// ---- Stat gauge bar ----
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
        <span className="w-12 text-sm font-semibold text-zinc-100 text-left">{item.home}</span>
        <span className="flex-1 text-center text-xs text-zinc-500">{item.label}</span>
        <span className="w-12 text-sm font-semibold text-zinc-100 text-right">{item.away}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px bg-zinc-950">
        <div
          className="bg-emerald-500 rounded-l-full transition-all duration-700"
          style={{ width: `${homePct}%` }}
        />
        <div className="bg-blue-500 flex-1 rounded-r-full" />
      </div>
    </div>
  );
}

// ---- Lineup table ----
function LineupSection({ team }: { team: FixtureTeamStats }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60">
        {team.team.logo && (
          <Image src={team.team.logo} alt={team.team.name} width={20} height={20} className="object-contain" />
        )}
        <span className="font-semibold text-sm text-zinc-200">{team.team.name}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-zinc-600 border-b border-zinc-800/60">
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
            const ratingCls = isNaN(ratingNum) ? "text-zinc-600"
              : ratingNum >= 8 ? "text-emerald-400 font-bold"
              : ratingNum >= 7 ? "text-zinc-200"
              : "text-zinc-500";

            return (
              <tr key={player.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-2">
                  <Link
                    href={`/players/${player.id}`}
                    className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                  >
                    {player.number != null && (
                      <span className="text-xs text-zinc-600 font-mono w-5 text-right flex-shrink-0">
                        {player.number}
                      </span>
                    )}
                    <span className="text-zinc-200">{player.name}</span>
                    {stats.yellowCards > 0 && (
                      <span className="w-2.5 h-3.5 bg-yellow-400 rounded-sm inline-block flex-shrink-0" />
                    )}
                    {stats.redCards > 0 && (
                      <span className="w-2.5 h-3.5 bg-red-600 rounded-sm inline-block flex-shrink-0" />
                    )}
                  </Link>
                </td>
                <td className={`text-right px-2 py-2 ${ratingCls}`}>
                  {stats.rating ?? "—"}
                </td>
                <td className="text-right px-2 py-2 text-zinc-500">
                  {stats.goals ? <span className="text-emerald-400 font-semibold">{stats.goals}</span> : "—"}
                </td>
                <td className="text-right px-2 py-2 text-zinc-500">
                  {stats.assists ? <span className="text-blue-400 font-semibold">{stats.assists}</span> : "—"}
                </td>
                <td className="text-right px-4 py-2 text-zinc-600">{stats.minutesPlayed ?? "—"}</td>
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
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400">← トップ</Link>
        <p className="text-zinc-500 text-sm">試合データが見つかりませんでした</p>
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
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
        ← トップ
      </Link>

      {/* Score card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        {/* League + status */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {fixture.league.logo && (
            <Image src={fixture.league.logo} alt="" width={16} height={16} className="object-contain opacity-70" />
          )}
          <span className="text-xs text-zinc-500">{fixture.league.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-4">
          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-2">
            {fixture.homeTeam.logo && (
              <Image src={fixture.homeTeam.logo} alt={fixture.homeTeam.name} width={56} height={56} className="object-contain" />
            )}
            <span className="text-sm font-semibold text-zinc-200 text-center leading-snug">
              {fixture.homeTeam.name}
            </span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1 min-w-[80px]">
            <div className="text-4xl font-black font-mono text-zinc-50 tracking-tight">
              {showScore
                ? `${homeScore ?? "?"}–${awayScore ?? "?"}`
                : <span className="text-2xl text-zinc-500">vs</span>}
            </div>
            <span className="text-xs text-zinc-600">{date}</span>
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-2">
            {fixture.awayTeam.logo && (
              <Image src={fixture.awayTeam.logo} alt={fixture.awayTeam.name} width={56} height={56} className="object-contain" />
            )}
            <span className="text-sm font-semibold text-zinc-200 text-center leading-snug">
              {fixture.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Home / Away label */}
        {showScore && (
          <div className="flex justify-between mt-4 px-2">
            <span className="flex items-center gap-1.5 text-xs text-zinc-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />ホーム
            </span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-600">
              アウェイ<span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            </span>
          </div>
        )}
      </div>

      {/* Match stats */}
      {fixtureStats && fixtureStats.stats.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
            試合スタッツ
          </h2>
          <div className="space-y-4">
            {fixtureStats.stats.map((item) => (
              <StatBar key={item.label} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Lineups: pitch view if formation data available, table fallback otherwise */}
      {formations.length >= 2 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            出場選手
          </h2>
          <PitchView
            homeTeamId={fixture.homeTeam.id}
            formations={formations}
            lineups={lineups}
          />
        </section>
      ) : lineups.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            出場選手
          </h2>
          {lineups.map((team) => <LineupSection key={team.team.id} team={team} />)}
        </section>
      ) : null}
    </div>
  );
}
