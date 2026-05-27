import Image from "next/image";
import Link from "next/link";
import { getFixtureDetail, getFixtureLineups } from "@/lib/apiClient";
import type { FixtureTeamStats } from "@/types/fixture";

function StatItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-stone-50 border border-stone-100 rounded-md p-3 text-center">
      <p className={`text-2xl font-black tabular-nums ${highlight ? "text-green-700" : "text-stone-800"}`}>
        {value}
      </p>
      <p className="text-xs text-stone-400 mt-0.5">{label}</p>
    </div>
  );
}

export default async function FixturePlayerPage({
  params,
}: {
  params: Promise<{ fixtureId: string; playerId: string }>;
}) {
  const { fixtureId, playerId } = await params;
  const playerIdNum = Number(playerId);

  const [fixture, lineups] = await Promise.all([
    getFixtureDetail(fixtureId).catch((): null => null),
    getFixtureLineups(fixtureId).catch((): FixtureTeamStats[] => []),
  ]);

  let found: (FixtureTeamStats["players"][number] & { teamName: string; teamLogo?: string }) | null = null;
  for (const lineup of lineups) {
    const entry = lineup.players.find((p) => p.player.id === playerIdNum);
    if (entry) {
      found = { ...entry, teamName: lineup.team.name, teamLogo: lineup.team.logo };
      break;
    }
  }

  if (!fixture || !found) {
    return (
      <div className="space-y-4">
        <Link href={`/fixtures/${fixtureId}`} className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
          ← 試合詳細
        </Link>
        <p className="text-stone-400 text-sm">選手データが見つかりませんでした</p>
      </div>
    );
  }

  const { player, stats } = found;
  const ratingNum = parseFloat(stats.rating ?? "");
  const ratingCls = isNaN(ratingNum)
    ? "text-stone-400"
    : ratingNum >= 8 ? "text-green-600"
    : ratingNum >= 7 ? "text-stone-700"
    : "text-stone-400";

  const date = new Date(fixture.date).toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric",
  });

  const homeScore = fixture.score.home;
  const awayScore = fixture.score.away;
  const showScore = fixture.status !== "scheduled";

  return (
    <div className="space-y-5">
      <Link href={`/fixtures/${fixtureId}`} className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors">
        ← 試合詳細
      </Link>

      {/* Match context */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          {fixture.league.logo && (
            <Image src={fixture.league.logo} alt="" width={14} height={14} className="object-contain opacity-60" />
          )}
          <span className="text-xs text-stone-400">{fixture.league.name} · {date}</span>
        </div>
        <p className="text-sm font-medium text-stone-700">
          {fixture.homeTeam.name}
          {showScore && homeScore != null && awayScore != null
            ? <span className="mx-2 tabular-nums font-black text-stone-900">{homeScore} – {awayScore}</span>
            : <span className="mx-2 text-stone-400">vs</span>
          }
          {fixture.awayTeam.name}
        </p>
      </div>

      {/* Player header */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-5">
        <div className="flex items-center gap-4">
          {player.photo ? (
            <Image src={player.photo} alt={player.name} width={64} height={64} className="rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-stone-100 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-stone-900 leading-tight">{player.name}</h1>
            <p className="text-sm text-stone-500 mt-0.5">{found.teamName}</p>
            {player.number != null && (
              <p className="text-xs text-stone-400 mt-0.5">#{player.number}</p>
            )}
          </div>
          {!isNaN(ratingNum) && (
            <div className="flex-shrink-0 text-center">
              <p className={`text-4xl font-black tabular-nums ${ratingCls}`}>{ratingNum.toFixed(1)}</p>
              <p className="text-xs text-stone-400 mt-0.5">評価</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-5">
        <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-4">
          この試合のスタッツ
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <StatItem label="出場時間" value={stats.minutesPlayed != null ? `${stats.minutesPlayed}'` : "—"} />
          <StatItem label="ゴール" value={stats.goals != null ? String(stats.goals) : "—"} highlight={stats.goals != null && stats.goals > 0} />
          <StatItem label="アシスト" value={stats.assists != null ? String(stats.assists) : "—"} highlight={stats.assists != null && stats.assists > 0} />
          <StatItem label="シュート" value={stats.shots != null ? String(stats.shots) : "—"} />
          <StatItem label="パス" value={stats.passes != null ? String(stats.passes) : "—"} />
          <div className="bg-stone-50 border border-stone-100 rounded-md p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mt-1">
              {stats.yellowCards > 0
                ? <span className="w-4 h-6 bg-yellow-400 rounded-sm inline-block" />
                : null}
              {stats.redCards > 0
                ? <span className="w-4 h-6 bg-red-600 rounded-sm inline-block" />
                : null}
              {stats.yellowCards === 0 && stats.redCards === 0 && (
                <span className="text-2xl font-black text-stone-300">—</span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">カード</p>
          </div>
        </div>
      </div>

      {/* Link to career stats */}
      <Link
        href={`/players/${player.id}`}
        className="flex items-center justify-between bg-white border border-stone-200 rounded-lg shadow-sm p-4 hover:border-green-300 hover:shadow-md transition-all group"
      >
        <div>
          <p className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
            過去スタッツを見る
          </p>
          <p className="text-xs text-stone-400 mt-0.5">選手の通算成績・シーズン別データ</p>
        </div>
        <span className="text-stone-300 group-hover:text-green-600 transition-colors">→</span>
      </Link>
    </div>
  );
}
