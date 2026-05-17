import Image from "next/image";
import Link from "next/link";
import { getFixtureDetail, getFixtureLineups } from "@/lib/apiClient";
import type { FixtureTeamStats } from "@/types/fixture";

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

function LineupTable({ team }: { team: FixtureTeamStats }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
        {team.team.logo && (
          <Image
            src={team.team.logo}
            alt={team.team.name}
            width={20}
            height={20}
            className="object-contain"
          />
        )}
        <span className="font-semibold text-zinc-200 text-sm">
          {team.team.name}
        </span>
        {team.formation && (
          <span className="ml-auto text-xs text-zinc-500">{team.formation}</span>
        )}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-zinc-500 border-b border-zinc-800">
            <th className="text-left px-4 py-2 font-normal">選手</th>
            <th className="text-right px-2 py-2 font-normal">評価</th>
            <th className="text-right px-2 py-2 font-normal">G</th>
            <th className="text-right px-2 py-2 font-normal">A</th>
            <th className="text-right px-4 py-2 font-normal">分</th>
          </tr>
        </thead>
        <tbody>
          {team.players.map(({ player, stats }) => (
            <tr
              key={player.id}
              className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
            >
              <td className="px-4 py-2">
                <Link
                  href={`/players/${player.id}`}
                  className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                >
                  {player.number != null && (
                    <span className="text-xs text-zinc-500 w-5 text-right">
                      {player.number}
                    </span>
                  )}
                  <span className="text-zinc-200">{player.name}</span>
                  {stats.yellowCards > 0 && (
                    <span className="text-xs bg-yellow-500 text-black px-1 rounded">
                      Y
                    </span>
                  )}
                  {stats.redCards > 0 && (
                    <span className="text-xs bg-red-600 text-white px-1 rounded">
                      R
                    </span>
                  )}
                </Link>
              </td>
              <td className="text-right px-2 py-2 text-zinc-300">
                {stats.rating ?? "-"}
              </td>
              <td className="text-right px-2 py-2 text-zinc-400">
                {stats.goals ?? "-"}
              </td>
              <td className="text-right px-2 py-2 text-zinc-400">
                {stats.assists ?? "-"}
              </td>
              <td className="text-right px-4 py-2 text-zinc-500">
                {stats.minutesPlayed ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function FixturePage({
  params,
}: {
  params: Promise<{ fixtureId: string }>;
}) {
  const { fixtureId } = await params;

  const [fixture, lineups] = await Promise.all([
    getFixtureDetail(fixtureId).catch(() => null),
    getFixtureLineups(fixtureId).catch(() => [] as FixtureTeamStats[]),
  ]);

  if (!fixture) {
    return (
      <div>
        <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 mb-4 inline-block">
          ← トップに戻る
        </Link>
        <p className="text-zinc-400 text-sm">試合データが見つかりませんでした</p>
      </div>
    );
  }

  const date = new Date(fixture.date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-xs text-zinc-500 hover:text-zinc-300 mb-4 inline-block"
        >
          ← トップに戻る
        </Link>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            {fixture.league.logo && (
              <Image
                src={fixture.league.logo}
                alt={fixture.league.name}
                width={16}
                height={16}
                className="object-contain"
              />
            )}
            <span className="text-xs text-zinc-500">{fixture.league.name}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${STATUS_CLASS[fixture.status]}`}
            >
              {STATUS_LABEL[fixture.status]}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mb-4">{date}</p>
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2 w-28">
              {fixture.homeTeam.logo && (
                <Image
                  src={fixture.homeTeam.logo}
                  alt={fixture.homeTeam.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              )}
              <span className="text-sm font-medium text-zinc-200 text-center">
                {fixture.homeTeam.name}
              </span>
            </div>
            <div className="text-3xl font-bold text-zinc-100 font-mono">
              {fixture.status === "scheduled"
                ? "vs"
                : `${fixture.score.home ?? "?"} - ${fixture.score.away ?? "?"}`}
            </div>
            <div className="flex flex-col items-center gap-2 w-28">
              {fixture.awayTeam.logo && (
                <Image
                  src={fixture.awayTeam.logo}
                  alt={fixture.awayTeam.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              )}
              <span className="text-sm font-medium text-zinc-200 text-center">
                {fixture.awayTeam.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {lineups.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            出場選手
          </h2>
          {lineups.map((team) => (
            <LineupTable key={team.team.id} team={team} />
          ))}
        </section>
      )}
    </div>
  );
}
