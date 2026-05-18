import type { APIGatewayProxyHandler } from "aws-lambda";
import { fetchApiFootball, ApiError } from "../services/apiFootball";
import { transformTeam, type ApiTeamEntry } from "../transformers/teamTransformer";
import { ok, badRequest, serviceUnavailable, internalError } from "../utils/response";

function defaultSeason(): number {
  const now = new Date();
  return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const leagueId = Number(event.pathParameters?.leagueId);
  if (isNaN(leagueId) || leagueId <= 0) return badRequest("有効な leagueId を指定してください");

  const explicitSeason = event.queryStringParameters?.season;
  const season = Number(explicitSeason ?? defaultSeason());
  if (isNaN(season)) return badRequest("season は数値で指定してください");

  try {
    let entries = await fetchApiFootball<ApiTeamEntry[]>(
      `/teams?league=${leagueId}&season=${season}`
    );
    if (entries.length === 0 && !explicitSeason) {
      entries = await fetchApiFootball<ApiTeamEntry[]>(
        `/teams?league=${leagueId}&season=${season - 1}`
      );
    }
    return ok(entries.map((e) => transformTeam(e)));
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 503) return serviceUnavailable(err.message);
      return internalError(err.code, err.message);
    }
    return internalError("UNKNOWN_ERROR", "予期しないエラーが発生しました");
  }
};
