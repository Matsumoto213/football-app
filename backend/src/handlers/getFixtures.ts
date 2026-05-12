import type { APIGatewayProxyHandler } from "aws-lambda";
import { fetchApiFootball, ApiError } from "../services/apiFootball";
import { transformFixture, type ApiFixtureEntry } from "../transformers/fixtureTransformer";
import { ok, badRequest, serviceUnavailable, internalError } from "../utils/response";

const VALID_TYPES = ["past", "upcoming", "recent"] as const;
type FixtureType = (typeof VALID_TYPES)[number];

function buildPath(teamId: number, type: FixtureType): string {
  switch (type) {
    case "past":     return `/fixtures?team=${teamId}&last=10`;
    case "upcoming": return `/fixtures?team=${teamId}&next=10`;
    case "recent":   return `/fixtures?team=${teamId}&last=5`;
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const teamId = Number(event.pathParameters?.teamId);
  if (isNaN(teamId) || teamId <= 0) return badRequest("有効な teamId を指定してください");

  const rawType = event.queryStringParameters?.type ?? "recent";
  if (!(VALID_TYPES as readonly string[]).includes(rawType)) {
    return badRequest(`type は ${VALID_TYPES.join(" | ")} のいずれかです`);
  }
  const type = rawType as FixtureType;

  try {
    const entries = await fetchApiFootball<ApiFixtureEntry[]>(buildPath(teamId, type));
    return ok(entries.map(transformFixture));
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 503) return serviceUnavailable(err.message);
      return internalError(err.code, err.message);
    }
    return internalError("UNKNOWN_ERROR", "予期しないエラーが発生しました");
  }
};
