import type { APIGatewayProxyHandler } from "aws-lambda";
import { fetchApiFootball, ApiError } from "../services/apiFootball";
import { transformTeam, type ApiTeamEntry } from "../transformers/teamTransformer";
import { ok, badRequest, notFound, serviceUnavailable, internalError } from "../utils/response";

export const handler: APIGatewayProxyHandler = async (event) => {
  const teamId = Number(event.pathParameters?.teamId);
  if (isNaN(teamId) || teamId <= 0) return badRequest("有効な teamId を指定してください");

  try {
    const entries = await fetchApiFootball<ApiTeamEntry[]>(`/teams?id=${teamId}`);
    if (entries.length === 0) return notFound("チームが見つかりません");
    return ok(transformTeam(entries[0]));
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 503) return serviceUnavailable(err.message);
      return internalError(err.code, err.message);
    }
    return internalError("UNKNOWN_ERROR", "予期しないエラーが発生しました");
  }
};
