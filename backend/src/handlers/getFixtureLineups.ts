import type { APIGatewayProxyHandler } from "aws-lambda";
import { fetchApiFootball, ApiError } from "../services/apiFootball";
import {
  transformFixtureTeamStats,
  type ApiFixturePlayerEntry,
} from "../transformers/playerTransformer";
import { ok, badRequest, serviceUnavailable, internalError } from "../utils/response";

export const handler: APIGatewayProxyHandler = async (event) => {
  const fixtureId = Number(event.pathParameters?.fixtureId);
  if (isNaN(fixtureId) || fixtureId <= 0) return badRequest("有効な fixtureId を指定してください");

  try {
    const entries = await fetchApiFootball<ApiFixturePlayerEntry[]>(
      `/fixtures/players?fixture=${fixtureId}`
    );
    return ok(entries.map(transformFixtureTeamStats));
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 503) return serviceUnavailable(err.message);
      return internalError(err.code, err.message);
    }
    return internalError("UNKNOWN_ERROR", "予期しないエラーが発生しました");
  }
};
