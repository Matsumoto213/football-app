"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { TeamFormation, FormationPlayer, FixtureTeamStats } from "@/types/fixture";
import type { PlayerMatchStats } from "@/types/fixture";

type PlayerStats = PlayerMatchStats["stats"];
type PlayerData = { stats: PlayerStats; photo?: string };
type MergedPlayer = FormationPlayer & { stats?: PlayerStats; photo?: string };
type SelectedEntry = { player: MergedPlayer; color: "home" | "away" };

export interface PitchViewProps {
  fixtureId: string | number;
  homeTeamId: number;
  formations: TeamFormation[];
  lineups: FixtureTeamStats[];
}

function parseGrid(grid: string | null): { row: number; col: number } {
  if (!grid) return { row: 1, col: 1 };
  const [r, c] = grid.split(":").map(Number);
  return { row: r ?? 1, col: c ?? 1 };
}

function shortName(name: string): string {
  const parts = name.split(" ");
  if (parts.length <= 1) return name;
  const last = parts.slice(1).join(" ");
  return last.length > 10 ? last.slice(0, 10) : last;
}

function groupByRow(players: MergedPlayer[]): Map<number, MergedPlayer[]> {
  const rows = new Map<number, MergedPlayer[]>();
  for (const p of players) {
    const { row } = parseGrid(p.grid);
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row)!.push(p);
  }
  for (const rp of rows.values()) {
    rp.sort((a, b) => parseGrid(a.grid).col - parseGrid(b.grid).col);
  }
  return rows;
}

function PlayerTooltip({ player, dir }: { player: MergedPlayer; dir: "up" | "down" }) {
  const rating = parseFloat(player.stats?.rating ?? "");
  const ratingCls = isNaN(rating)
    ? "text-stone-400"
    : rating >= 8 ? "text-green-400"
    : rating >= 7 ? "text-stone-200"
    : "text-stone-500";

  const positionCls =
    dir === "up"
      ? "bottom-full mb-3 left-1/2 -translate-x-1/2"
      : "top-full mt-3 left-1/2 -translate-x-1/2";

  return (
    <div className={`absolute z-50 w-44 bg-zinc-950/95 border border-zinc-700 rounded-xl shadow-2xl p-3 pointer-events-none ${positionCls}`}>
      <span className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-zinc-950 border-zinc-700 rotate-45 ${
        dir === "up" ? "top-full -translate-y-[7px] border-b border-r" : "bottom-full translate-y-[7px] border-t border-l"
      }`} />
      <div className="flex items-center gap-2 mb-2">
        {player.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 bg-zinc-800" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-zinc-100 truncate leading-tight">{player.name}</p>
          <p className="text-[10px] text-zinc-500">#{player.number ?? "—"} · {player.pos}</p>
        </div>
        {!isNaN(rating) && (
          <span className={`text-lg font-black flex-shrink-0 ${ratingCls}`}>{rating.toFixed(1)}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
        {player.stats?.minutesPlayed != null && <Row label="時間" value={`${player.stats.minutesPlayed}'`} />}
        {player.stats?.goals != null && (
          <Row label="ゴール" value={String(player.stats.goals)} cls={player.stats.goals > 0 ? "text-emerald-400 font-bold" : "text-zinc-300"} />
        )}
        {player.stats?.assists != null && (
          <Row label="アシスト" value={String(player.stats.assists)} cls={player.stats.assists > 0 ? "text-blue-400 font-bold" : "text-zinc-300"} />
        )}
        {player.stats?.shots != null && <Row label="シュート" value={String(player.stats.shots)} />}
        {player.stats?.passes != null && <Row label="パス" value={String(player.stats.passes)} />}
        {(player.stats?.yellowCards ?? 0) > 0 && <Row label="イエロー" value={String(player.stats!.yellowCards)} />}
        {(player.stats?.redCards ?? 0) > 0 && <Row label="レッド" value={String(player.stats!.redCards)} />}
      </div>
      <p className="mt-2 text-[9px] text-zinc-600 text-right">タップで試合スタッツへ →</p>
    </div>
  );
}

function Row({ label, value, cls = "text-zinc-300" }: { label: string; value: string; cls?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className={cls}>{value}</span>
    </div>
  );
}

function PlayerToken({
  player, color, tooltipDir, isSelected, onEnter, onLeave, fixtureId,
}: {
  player: MergedPlayer;
  color: "home" | "away";
  tooltipDir: "up" | "down";
  isSelected: boolean;
  onEnter: () => void;
  onLeave: () => void;
  fixtureId: string | number;
}) {
  const hasGoal = (player.stats?.goals ?? 0) > 0;
  const hasYellow = (player.stats?.yellowCards ?? 0) > 0;
  const hasRed = (player.stats?.redCards ?? 0) > 0;

  const borderCls = color === "home" ? "border-emerald-400" : "border-blue-400";
  const ringCls = isSelected ? "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-110" : "group-hover:scale-105";

  return (
    <Link
      href={`/fixtures/${fixtureId}/players/${player.id}`}
      className="group relative flex flex-col items-center gap-0.5"
      style={{ zIndex: isSelected ? 50 : 1 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {isSelected && <PlayerTooltip player={player} dir={tooltipDir} />}

      <div className="relative">
        {hasGoal && (
          <span className="absolute -top-1 -right-1 text-[7px] leading-none bg-emerald-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center z-10">⚽</span>
        )}
        {!hasGoal && hasRed && (
          <span className="absolute -top-1 -right-1 w-1.5 h-2.5 bg-red-600 rounded-sm z-10" />
        )}
        {!hasGoal && !hasRed && hasYellow && (
          <span className="absolute -top-1 -right-1 w-1.5 h-2.5 bg-yellow-400 rounded-sm z-10" />
        )}
        <div className={`w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all ${borderCls} ${ringCls} ${
          player.photo ? "bg-zinc-800" : color === "home" ? "bg-emerald-700" : "bg-blue-700"
        }`}>
          {player.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.photo}
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const sib = e.currentTarget.nextSibling as HTMLElement | null;
                if (sib) sib.removeAttribute("hidden");
              }}
            />
          ) : null}
          <span className="text-xs font-bold text-white" hidden={!!player.photo}>{player.number ?? "?"}</span>
        </div>
        {player.photo && player.number != null && (
          <span className="absolute -bottom-0.5 -right-0.5 text-[8px] bg-zinc-900/90 text-zinc-200 rounded-full w-4 h-4 flex items-center justify-center border border-zinc-700 font-mono leading-none z-10">
            {player.number}
          </span>
        )}
      </div>
      <span className="text-[9px] text-zinc-300 leading-tight text-center w-14 truncate">{shortName(player.name)}</span>
    </Link>
  );
}

function SubRow({ player, color, fixtureId }: { player: MergedPlayer; color: "home" | "away"; fixtureId: string | number }) {
  const posCls = color === "home" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700";
  return (
    <Link
      href={`/fixtures/${fixtureId}/players/${player.id}`}
      className="flex items-center gap-2 hover:text-green-700 transition-colors"
    >
      <span className="text-xs text-stone-400 font-mono w-4 text-right flex-shrink-0">{player.number}</span>
      <span className={`text-[10px] px-1 py-0.5 rounded font-mono flex-shrink-0 ${posCls}`}>{player.pos}</span>
      <span className="text-xs text-stone-600 truncate">{player.name}</span>
    </Link>
  );
}

function PitchMarkings() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-4 border border-white/10" />
      <div className="absolute top-1/2 left-4 right-4 h-px bg-white/15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-white/15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/25" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-40 h-16 border-x border-b border-white/10" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-16 border-x border-t border-white/10" />
    </div>
  );
}

export function PitchView({ fixtureId, homeTeamId, formations, lineups }: PitchViewProps) {
  const [hovered, setHovered] = useState<SelectedEntry | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const homeFormation = formations.find((f) => f.team.id === homeTeamId);
  const awayFormation = formations.find((f) => f.team.id !== homeTeamId);
  if (!homeFormation || !awayFormation) return null;

  const homeMap = new Map<number, PlayerData>();
  const awayMap = new Map<number, PlayerData>();
  for (const lineup of lineups) {
    const map = lineup.team.id === homeTeamId ? homeMap : awayMap;
    for (const { player, stats } of lineup.players) {
      map.set(player.id, { stats, photo: player.photo });
    }
  }

  const merge = (fp: FormationPlayer, map: Map<number, PlayerData>): MergedPlayer => ({ ...fp, ...map.get(fp.id) });

  const homePlayers = homeFormation.startXI.map((p) => merge(p, homeMap));
  const awayPlayers = awayFormation.startXI.map((p) => merge(p, awayMap));
  const homeSubs = homeFormation.substitutes.map((p) => merge(p, homeMap));
  const awaySubs = awayFormation.substitutes.map((p) => merge(p, awayMap));

  const homeRows = groupByRow(homePlayers);
  const awayRows = groupByRow(awayPlayers);
  const awayOrder = Array.from(awayRows.keys()).sort((a, b) => a - b);
  const homeOrder = Array.from(homeRows.keys()).sort((a, b) => b - a);

  const displayed = hovered;

  const handleEnter = (player: MergedPlayer, color: "home" | "away") => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHovered({ player, color });
  };

  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => setHovered(null), 150);
  };

  const renderRows = (order: number[], rows: Map<number, MergedPlayer[]>, color: "home" | "away", tooltipDir: "up" | "down") =>
    order.map((rowNum) => (
      <div key={rowNum} className="flex justify-evenly items-center w-full">
        {rows.get(rowNum)!.map((player) => (
          <PlayerToken
            key={player.id}
            player={player}
            color={color}
            tooltipDir={tooltipDir}
            isSelected={displayed?.player.id === player.id}
            onEnter={() => handleEnter(player, color)}
            onLeave={handleLeave}
            fixtureId={fixtureId}
          />
        ))}
      </div>
    ));

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-stone-500">{homeFormation.team.name}</span>
          <span className="text-stone-400">{homeFormation.formation}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-stone-400">{awayFormation.formation}</span>
          <span className="text-stone-500">{awayFormation.team.name}</span>
          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
        </div>
      </div>

      <div className="relative" style={{ minHeight: "720px" }} onClick={(e) => e.stopPropagation()}>
        <div
          className="absolute inset-0 rounded-lg overflow-hidden border border-stone-200"
          style={{
            background: "repeating-linear-gradient(to bottom, #0f3d1f 0px, #0f3d1f 44px, #0d3519 44px, #0d3519 88px)",
          }}
        >
          <PitchMarkings />
        </div>

        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-1/2 flex flex-col justify-around px-3 pt-6 pb-3">
            {renderRows(awayOrder, awayRows, "away", "down")}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 flex flex-col justify-around px-3 pt-3 pb-6">
            {renderRows(homeOrder, homeRows, "home", "up")}
          </div>
        </div>
      </div>

      {(homeSubs.length > 0 || awaySubs.length > 0) && (
        <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-4">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">控え選手</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            <div className="space-y-1.5">
              {homeSubs.map((p) => <SubRow key={p.id} player={p} color="home" fixtureId={fixtureId} />)}
            </div>
            <div className="space-y-1.5">
              {awaySubs.map((p) => <SubRow key={p.id} player={p} color="away" fixtureId={fixtureId} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
