import type { APIGatewayProxyHandler } from "aws-lambda";
import { fetchApiFootball, ApiError } from "../services/apiFootball";
import { transformFixture, type ApiFixtureEntry } from "../transformers/fixtureTransformer";
import { ok, badRequest, serviceUnavailable, internalError } from "../utils/response";

const FREE_PLAN_LATEST_SEASON = 2024;

export const handler: APIGatewayProxyHandler = async (event) => {
  const playerId = Number(event.pathParameters?.playerId);
  if (isNaN(playerId) || playerId <= 0) return badRequest("有効な playerId を指定してください");

  const teamId = Number(event.queryStringParameters?.teamId);
  if (isNaN(teamId) || teamId <= 0) return badRequest("有効な teamId を指定してください");

  const season = Number(event.queryStringParameters?.season ?? FREE_PLAN_LATEST_SEASON);
  if (isNaN(season)) return badRequest("season は数値で指定してください");

  try {
    const entries = await fetchApiFootball<ApiFixtureEntry[]>(
      `/fixtures?team=${teamId}&season=${season}&status=FT`
    );
    const fixtures = (Array.isArray(entries) ? entries : [])
      .map(transformFixture)
      .filter((f) => f.status === "finished")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);
    return ok(fixtures);
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 503) return serviceUnavailable(err.message);
      return internalError(err.code, err.message);
    }
    return internalError("UNKNOWN_ERROR", "予期しないエラーが発生しました");
  }
};
