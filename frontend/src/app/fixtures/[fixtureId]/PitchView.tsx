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

// ---- Player token on the pitch ----
function PlayerToken({
  player,
  color,
  isSelected,
  onEnter,
  onLeave,
  onClick,
}: {
  player: MergedPlayer;
  color: "home" | "away";
  isSelected: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const hasGoal = (player.stats?.goals ?? 0) > 0;
  const hasYellow = (player.stats?.yellowCards ?? 0) > 0;
  const hasRed = (player.stats?.redCards ?? 0) > 0;
  const rating = parseFloat(player.stats?.rating ?? "");

  const borderCls =
    color === "home" ? "border-emerald-400" : "border-blue-400";
  const ringCls = isSelected
    ? "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-110"
    : "group-hover:scale-105";

  return (
    <button
      className="group flex flex-col items-center gap-0.5 cursor-pointer"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <div className="relative">
        {/* Indicators */}
        {hasGoal && (
          <span className="absolute -top-1 -right-1 text-[7px] leading-none bg-emerald-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center z-10">
            ⚽
          </span>
        )}
        {!hasGoal && hasRed && (
          <span className="absolute -top-1 -right-1 w-1.5 h-2.5 bg-red-600 rounded-sm z-10" />
        )}
        {!hasGoal && !hasRed && hasYellow && (
          <span className="absolute -top-1 -right-1 w-1.5 h-2.5 bg-yellow-400 rounded-sm z-10" />
        )}

        {/* Avatar circle */}
        <div
          className={`w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all ${borderCls} ${ringCls} ${
            player.photo ? "bg-zinc-800" : color === "home" ? "bg-emerald-700" : "bg-blue-700"
          }`}
        >
          {player.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.photo}
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                (e.currentTarget.nextSibling as HTMLElement | null)?.removeAttribute("hidden");
              }}
            />
          ) : null}
          {/* Fallback number (shown when no photo or photo fails) */}
          <span
            className="text-xs font-bold text-white"
            hidden={!!player.photo}
          >
            {player.number ?? "?"}
          </span>
        </div>

        {/* Number badge (shown over photo) */}
        {player.photo && player.number != null && (
          <span className="absolute -bottom-0.5 -right-0.5 text-[8px] bg-zinc-900/90 text-zinc-200 rounded-full w-4 h-4 flex items-center justify-center border border-zinc-700 font-mono leading-none z-10">
            {player.number}
          </span>
        )}
      </div>

      <span className="text-[9px] text-zinc-300 leading-tight text-center w-14 truncate">
        {shortName(player.name)}
      </span>
      {!isNaN(rating) && (
        <span
          className={`text-[8px] font-bold leading-none ${
            rating >= 8 ? "text-emerald-400" : rating >= 7 ? "text-zinc-300" : "text-zinc-500"
          }`}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </button>
  );
}

// ---- Selected player stats panel ----
function PlayerPanel({ player, color }: { player: MergedPlayer; color: "home" | "away" }) {
  const rating = parseFloat(player.stats?.rating ?? "");
  const ratingCls = isNaN(rating)
    ? "text-zinc-500"
    : rating >= 8 ? "text-emerald-400" : rating >= 7 ? "text-zinc-200" : "text-zinc-500";
  const borderCls = color === "home" ? "border-emerald-800/60" : "border-blue-800/60";

  return (
    <div className={`bg-zinc-900 border ${borderCls} rounded-2xl p-4`}>
      <div className="flex items-center gap-3 mb-3">
        {player.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.photo}
            alt={player.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0 bg-zinc-800"
          />
        )}
        <div className="flex-1 min-w-0">
          <Link
            href={`/players/${player.id}`}
            className="text-sm font-semibold text-zinc-100 hover:text-emerald-400 transition-colors truncate block"
          >
            {player.name}
          </Link>
          <p className="text-xs text-zinc-500 mt-0.5">
            #{player.number ?? "—"} · {player.pos}
          </p>
        </div>
        {!isNaN(rating) && (
          <div className={`text-2xl font-black flex-shrink-0 ${ratingCls}`}>
            {rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {player.stats?.minutesPlayed != null && (
          <StatCell label="出場時間" value={`${player.stats.minutesPlayed}'`} />
        )}
        {player.stats?.goals != null && (
          <StatCell label="ゴール" value={String(player.stats.goals)} highlight={player.stats.goals > 0} />
        )}
        {player.stats?.assists != null && (
          <StatCell label="アシスト" value={String(player.stats.assists)} blue={player.stats.assists > 0} />
        )}
        {player.stats?.shots != null && (
          <StatCell label="シュート" value={String(player.stats.shots)} />
        )}
        {player.stats?.passes != null && (
          <StatCell label="パス" value={String(player.stats.passes)} />
        )}
        {(player.stats?.yellowCards ?? 0) > 0 && (
          <StatCell label="イエロー" value={String(player.stats!.yellowCards)} />
        )}
        {(player.stats?.redCards ?? 0) > 0 && (
          <StatCell label="レッド" value={String(player.stats!.redCards)} />
        )}
      </div>
    </div>
  );
}

function StatCell({
  label, value, highlight, blue,
}: {
  label: string; value: string; highlight?: boolean; blue?: boolean;
}) {
  return (
    <div className="bg-zinc-800 rounded-lg p-2 text-center">
      <div className="text-[10px] text-zinc-500 mb-1">{label}</div>
      <div className={`text-sm font-bold ${highlight ? "text-emerald-400" : blue ? "text-blue-400" : "text-zinc-200"}`}>
        {value}
      </div>
    </div>
  );
}

// ---- Sub list row ----
function SubRow({ player, color }: { player: MergedPlayer; color: "home" | "away" }) {
  const posCls = color === "home" ? "bg-emerald-950 text-emerald-600" : "bg-blue-950 text-blue-600";
  return (
    <Link href={`/players/${player.id}`} className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
      <span className="text-xs text-zinc-600 font-mono w-4 text-right flex-shrink-0">{player.number}</span>
      <span className={`text-[10px] px-1 py-0.5 rounded font-mono flex-shrink-0 ${posCls}`}>{player.pos}</span>
      <span className="text-xs text-zinc-400 truncate">{player.name}</span>
    </Link>
  );
}

// ---- Pitch markings overlay ----
function PitchMarkings() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-3 border border-white/10" />
      <div className="absolute top-1/2 left-3 right-3 h-px bg-white/15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/25" />
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-36 h-14 border-x border-b border-white/10" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-36 h-14 border-x border-t border-white/10" />
    </div>
  );
}

// ---- Main export ----
export function PitchView({ homeTeamId, formations, lineups }: PitchViewProps) {
  // hovered: set by mouse enter/leave (desktop hover)
  // pinned: set by click (mobile tap or persistent selection)
  // display priority: hovered > pinned
  const [hovered, setHovered] = useState<SelectedEntry | null>(null);
  const [pinned, setPinned] = useState<SelectedEntry | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const homeFormation = formations.find((f) => f.team.id === homeTeamId);
  const awayFormation = formations.find((f) => f.team.id !== homeTeamId);
  if (!homeFormation || !awayFormation) return null;

  // Build data maps keyed by player id (stats + photo)
  const homeMap = new Map<number, PlayerData>();
  const awayMap = new Map<number, PlayerData>();
  for (const lineup of lineups) {
    const map = lineup.team.id === homeTeamId ? homeMap : awayMap;
    for (const { player, stats } of lineup.players) {
      map.set(player.id, { stats, photo: player.photo });
    }
  }

  const merge = (fp: FormationPlayer, map: Map<number, PlayerData>): MergedPlayer => ({
    ...fp,
    ...map.get(fp.id),
  });

  const homePlayers = homeFormation.startXI.map((p) => merge(p, homeMap));
  const awayPlayers = awayFormation.startXI.map((p) => merge(p, awayMap));
  const homeSubs = homeFormation.substitutes.map((p) => merge(p, homeMap));
  const awaySubs = awayFormation.substitutes.map((p) => merge(p, awayMap));

  const homeRows = groupByRow(homePlayers);
  const awayRows = groupByRow(awayPlayers);

  const awayOrder = Array.from(awayRows.keys()).sort((a, b) => a - b);
  const homeOrder = Array.from(homeRows.keys()).sort((a, b) => b - a);

  const displayed = hovered ?? pinned;

  const handleEnter = (player: MergedPlayer, color: "home" | "away") => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHovered({ player, color });
  };

  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => setHovered(null), 150);
  };

  const handleClick = (player: MergedPlayer, color: "home" | "away") => {
    setPinned((prev) => (prev?.player.id === player.id ? null : { player, color }));
  };

  const renderRows = (
    order: number[],
    rows: Map<number, MergedPlayer[]>,
    color: "home" | "away"
  ) =>
    order.map((rowNum) => (
      <div key={rowNum} className="flex justify-center items-center gap-1 sm:gap-4">
        {rows.get(rowNum)!.map((player) => (
          <PlayerToken
            key={player.id}
            player={player}
            color={color}
            isSelected={displayed?.player.id === player.id}
            onEnter={() => handleEnter(player, color)}
            onLeave={handleLeave}
            onClick={() => handleClick(player, color)}
          />
        ))}
      </div>
    ));

  return (
    <div className="space-y-3" onClick={() => setPinned(null)}>
      {/* Formation labels */}
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-zinc-400">{homeFormation.team.name}</span>
          <span className="text-zinc-600">{homeFormation.formation}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-600">{awayFormation.formation}</span>
          <span className="text-zinc-400">{awayFormation.team.name}</span>
          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
        </div>
      </div>

      {/* Pitch */}
      <div
        className="relative rounded-2xl overflow-hidden border border-zinc-800"
        style={{
          background:
            "repeating-linear-gradient(to bottom, #0f3d1f 0px, #0f3d1f 44px, #0d3519 44px, #0d3519 88px)",
          minHeight: "540px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <PitchMarkings />

        {/* Away half (top) */}
        <div className="absolute top-0 left-0 right-0 h-1/2 flex flex-col justify-around px-4 pt-4 pb-2 gap-2 z-10">
          {renderRows(awayOrder, awayRows, "away")}
        </div>

        {/* Home half (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 flex flex-col justify-around px-4 pt-2 pb-4 gap-2 z-10">
          {renderRows(homeOrder, homeRows, "home")}
        </div>
      </div>

      {/* Stats panel: shown on hover or click */}
      {displayed && (
        <PlayerPanel player={displayed.player} color={displayed.color} />
      )}

      {/* Substitutes */}
      {(homeSubs.length > 0 || awaySubs.length > 0) && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            控え選手
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            <div className="space-y-1.5">
              {homeSubs.map((p) => <SubRow key={p.id} player={p} color="home" />)}
            </div>
            <div className="space-y-1.5">
              {awaySubs.map((p) => <SubRow key={p.id} player={p} color="away" />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
