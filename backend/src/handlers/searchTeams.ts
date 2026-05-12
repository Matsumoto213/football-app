import type { APIGatewayProxyHandler } from "aws-lambda";
import { fetchApiFootball, ApiError } from "../services/apiFootball";
import { transformTeam, type ApiTeamEntry } from "../transformers/teamTransformer";
import { ok, badRequest, serviceUnavailable, internalError } from "../utils/response";

export const handler: APIGatewayProxyHandler = async (event) => {
  const q = event.queryStringParameters?.q?.trim();
  if (!q) return badRequest("クエリパラメータ 'q' は必須です");
  if (q.length < 3) return badRequest("検索クエリは3文字以上必要です");

  try {
    const entries = await fetchApiFootball<ApiTeamEntry[]>(
      `/teams?search=${encodeURIComponent(q)}`
    );
    return ok(entries.map((e) => transformTeam(e)));
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 503) return serviceUnavailable(err.message);
      return internalError(err.code, err.message);
    }
    return internalError("UNKNOWN_ERROR", "予期しないエラーが発生しました");
  }
};
