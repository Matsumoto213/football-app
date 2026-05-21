import type { APIGatewayProxyHandler } from "aws-lambda";
import { fetchApiFootball, ApiError } from "../services/apiFootball";
import { ok, badRequest, serviceUnavailable, internalError } from "../utils/response";

interface ApiStatEntry {
  team: { id: number; name: string; logo: string };
  statistics: Array<{ type: string; value: string | number | null }>;
}

const STAT_LABELS: Record<string, string> = {
  "Ball Possession":  "ボール支配率",
  "Total Shots":      "シュート",
  "Shots on Goal":    "枠内シュート",
  "Corner Kicks":     "コーナーキック",
  "Fouls":            "ファウル",
  "Offsides":         "オフサイド",
  "Yellow Cards":     "イエローカード",
  "Red Cards":        "レッドカード",
  "Goalkeeper Saves": "セーブ",
};

const STAT_ORDER = Object.keys(STAT_LABELS);

export const handler: APIGatewayProxyHandler = async (event) => {
  const fixtureId = Number(event.pathParameters?.fixtureId);
  if (isNaN(fixtureId) || fixtureId <= 0) return badRequest("有効な fixtureId を指定してください");

  try {
    const entries = await fetchApiFootball<ApiStatEntry[]>(
      `/fixtures/statistics?fixture=${fixtureId}`
    );
    if (entries.length < 2) return ok([]);

    const [home, away] = entries;
    const homeMap = new Map(home.statistics.map((s) => [s.type, s.value ?? 0]));
    const awayMap = new Map(away.statistics.map((s) => [s.type, s.value ?? 0]));

    const stats = STAT_ORDER
      .filter((type) => homeMap.has(type) && awayMap.has(type))
      .map((type) => ({
        label: STAT_LABELS[type],
        home: homeMap.get(type)!,
        away: awayMap.get(type)!,
      }));

    return ok({
      homeTeamId: home.team.id,
      awayTeamId: away.team.id,
      stats,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 503) return serviceUnavailable(err.message);
      return internalError(err.code, err.message);
    }
    return internalError("UNKNOWN_ERROR", "予期しないエラーが発生しました");
  }
};
