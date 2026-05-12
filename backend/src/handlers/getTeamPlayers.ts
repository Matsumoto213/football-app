import type { APIGatewayProxyHandler } from "aws-lambda";
import { fetchApiFootball, ApiError } from "../services/apiFootball";
import { transformSquadPlayers, type ApiSquadEntry } from "../transformers/playerTransformer";
import { ok, badRequest, serviceUnavailable, internalError } from "../utils/response";

export const handler: APIGatewayProxyHandler = async (event) => {
  const teamId = Number(event.pathParameters?.teamId);
  if (isNaN(teamId) || teamId <= 0) return badRequest("有効な teamId を指定してください");

  try {
    const entries = await fetchApiFootball<ApiSquadEntry[]>(
      `/players/squads?team=${teamId}`
    );
    return ok(entries.flatMap(transformSquadPlayers));
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 503) return serviceUnavailable(err.message);
      return internalError(err.code, err.message);
    }
    return internalError("UNKNOWN_ERROR", "予期しないエラーが発生しました");
  }
};
