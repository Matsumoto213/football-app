import Image from "next/image";
import Link from "next/link";
import { getPlayer, getPlayerStats } from "@/lib/apiClient";
import type { PlayerSeasonStats } from "@/types/player";
import PlayerFavoriteButton from "./PlayerFavoriteButton";

function StatsRow({ stat }: { stat: PlayerSeasonStats }) {
  return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          {stat.team.logo && (
            <Image
              src={stat.team.logo}
              alt={stat.team.name}
              width={16}
              height={16}
              className="object-contain"
            />
          )}
          <span className="text-zinc-200 text-sm">{stat.team.name}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          {stat.league.logo && (
            <Image
              src={stat.league.logo}
              alt={stat.league.name}
              width={12}
              height={12}
              className="object-contain"
            />
          )}
          <span className="text-xs text-zinc-500">
            {stat.league.name} · {stat.season}
          </span>
        </div>
      </td>
      <td className="text-right px-2 py-2 text-zinc-300">{stat.appearances}</td>
      <td className="text-right px-2 py-2 text-zinc-300">{stat.goals}</td>
      <td className="text-right px-2 py-2 text-zinc-300">{stat.assists}</td>
      <td className="text-right px-4 py-2 text-zinc-500">
        {stat.rating ?? "-"}
      </td>
    </tr>
  );
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;

  const [player, stats] = await Promise.all([
    getPlayer(playerId).catch(() => null),
    getPlayerStats(playerId).catch(() => [] as PlayerSeasonStats[]),
  ]);

  if (!player) {
    return (
      <div>
        <Link
          href="/"
          className="text-xs text-zinc-500 hover:text-zinc-300 mb-4 inline-block"
        >
          ← トップに戻る
        </Link>
        <p className="text-zinc-400 text-sm">選手が見つかりませんでした</p>
      </div>
    );
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-start gap-4">
            {player.photo && (
              <Image
                src={player.photo}
                alt={player.name}
                width={72}
                height={72}
                className="rounded-full object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-xl font-bold text-zinc-50 truncate">
                  {player.name}
                </h1>
                <PlayerFavoriteButton playerId={player.id} />
              </div>
              <div className="mt-1 space-y-0.5">
                {player.position && (
                  <p className="text-sm text-zinc-400">{player.position}</p>
                )}
                {player.nationality && (
                  <p className="text-sm text-zinc-400">{player.nationality}</p>
                )}
                {player.age && (
                  <p className="text-xs text-zinc-500">{player.age}歳</p>
                )}
                {player.team && (
                  <div className="flex items-center gap-1 mt-1">
                    {player.team.logo && (
                      <Image
                        src={player.team.logo}
                        alt={player.team.name}
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                    )}
                    <Link
                      href={`/teams/${player.team.id}`}
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      {player.team.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {stats.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            シーズンスタッツ
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 border-b border-zinc-800">
                  <th className="text-left px-4 py-2 font-normal">チーム / リーグ</th>
                  <th className="text-right px-2 py-2 font-normal">出場</th>
                  <th className="text-right px-2 py-2 font-normal">G</th>
                  <th className="text-right px-2 py-2 font-normal">A</th>
                  <th className="text-right px-4 py-2 font-normal">評価</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat, i) => (
                  <StatsRow key={i} stat={stat} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
