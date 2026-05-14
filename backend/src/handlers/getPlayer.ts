import type { APIGatewayProxyHandler } from "aws-lambda";
import { fetchApiFootball, ApiError } from "../services/apiFootball";
import {
  transformPlayerProfile,
  type ApiPlayerEntry,
} from "../transformers/playerTransformer";
import { ok, badRequest, notFound, serviceUnavailable, internalError } from "../utils/response";

function defaultSeason(): number {
  const now = new Date();
  // 8月以降なら現在年、それ以前なら前年（欧州サッカーシーズンに合わせる）
  return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const playerId = Number(event.pathParameters?.playerId);
  if (isNaN(playerId) || playerId <= 0) return badRequest("有効な playerId を指定してください");

  const season = Number(event.queryStringParameters?.season ?? defaultSeason());
  if (isNaN(season)) return badRequest("season は数値で指定してください");

  try {
    const entries = await fetchApiFootball<ApiPlayerEntry[]>(
      `/players?id=${playerId}&season=${season}`
    );
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
