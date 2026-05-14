import type { APIGatewayProxyHandler } from "aws-lambda";
import { fetchApiFootball, ApiError } from "../services/apiFootball";
import { transformFixture, type ApiFixtureEntry } from "../transformers/fixtureTransformer";
import { ok, badRequest, notFound, serviceUnavailable, internalError } from "../utils/response";

export const handler: APIGatewayProxyHandler = async (event) => {
  const fixtureId = Number(event.pathParameters?.fixtureId);
  if (isNaN(fixtureId) || fixtureId <= 0) return badRequest("有効な fixtureId を指定してください");

  try {
    const entries = await fetchApiFootball<ApiFixtureEntry[]>(`/fixtures?id=${fixtureId}`);
    if (entries.length === 0) return notFound("試合が見つかりません");
    return ok(transformFixture(entries[0]));
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 503) return serviceUnavailable(err.message);
      return internalError(err.code, err.message);
    }
    return internalError("UNKNOWN_ERROR", "予期しないエラーが発生しました");
  }
};
