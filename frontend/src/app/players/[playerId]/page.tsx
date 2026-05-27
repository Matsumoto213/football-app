import Image from "next/image";
import Link from "next/link";
import { getPlayer, getPlayerStats } from "@/lib/apiClient";
import type { PlayerSeasonStats } from "@/types/player";
import PlayerFavoriteButton from "./PlayerFavoriteButton";
import PlayerTabsSection from "./PlayerTabsSection";

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
        <Link href="/" className="text-xs text-stone-400 hover:text-stone-600 mb-4 inline-block">
          ← トップに戻る
        </Link>
        <p className="text-stone-400 text-sm">選手が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/" className="text-xs text-stone-400 hover:text-stone-600 inline-block transition-colors">
        ← トップに戻る
      </Link>

      <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-5">
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
              <h1 className="text-xl font-bold text-stone-900 truncate">{player.name}</h1>
              <PlayerFavoriteButton playerId={player.id} />
            </div>
            <div className="mt-1 space-y-0.5">
              {player.position && (
                <p className="text-sm text-stone-500">{player.position}</p>
              )}
              {player.nationality && (
                <p className="text-sm text-stone-500">{player.nationality}</p>
              )}
              {player.age && (
                <p className="text-xs text-stone-400">{player.age}歳</p>
              )}
              {player.team && (
                <div className="flex items-center gap-1.5 mt-1">
                  {player.team.logo && (
                    <span className="bg-stone-50 border border-stone-100 rounded p-0.5 inline-flex">
                      <Image src={player.team.logo} alt={player.team.name} width={14} height={14} className="object-contain" />
                    </span>
                  )}
                  <Link href={`/teams/${player.team.id}`} className="text-xs text-green-700 hover:text-green-600 transition-colors">
                    {player.team.name}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PlayerTabsSection
        playerId={player.id}
        teamId={player.team?.id}
        stats={stats}
      />
    </div>
  );
}
