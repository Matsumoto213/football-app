import type { APIGatewayProxyHandler } from "aws-lambda";
import { fetchApiFootball, ApiError } from "../services/apiFootball";
import {
  transformPlayerProfile,
  type ApiPlayerEntry,
} from "../transformers/playerTransformer";
import { ok, badRequest, notFound, serviceUnavailable, internalError } from "../utils/response";

function defaultSeason(): number {
  const now = new Date();
  return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}

async function fetchEntries(playerId: number, season: number): Promise<ApiPlayerEntry[]> {
  return fetchApiFootball<ApiPlayerEntry[]>(`/players?id=${playerId}&season=${season}`);
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const playerId = Number(event.pathParameters?.playerId);
  if (isNaN(playerId) || playerId <= 0) return badRequest("有効な playerId を指定してください");

  const explicitSeason = event.queryStringParameters?.season;
  const season = Number(explicitSeason ?? defaultSeason());
  if (isNaN(season)) return badRequest("season は数値で指定してください");

  try {
    let entries = await fetchEntries(playerId, season);
    // 指定シーズンにデータがなく、かつシーズンが自動計算の場合は前シーズンで再試行
    if (entries.length === 0 && !explicitSeason) {
      entries = await fetchEntries(playerId, season - 1);
    }
    if (entries.length === 0) return notFound("選手が見つかりません");
    return ok(transformPlayerProfile(entries[0]));
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 503) return serviceUnavailable(err.message);
      return internalError(err.code, err.message);
    }
    return internalError("UNKNOWN_ERROR", "予期しないエラーが発生しました");
  }
};
