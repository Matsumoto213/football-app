import type { APIGatewayProxyHandler } from "aws-lambda";
import { fetchApiFootball, ApiError } from "../services/apiFootball";
import { transformFixture, type ApiFixtureEntry } from "../transformers/fixtureTransformer";
import { ok, badRequest, serviceUnavailable, internalError } from "../utils/response";
import type { Fixture } from "../types/fixture";

const VALID_TYPES = ["past", "upcoming", "recent", "all"] as const;
type FixtureType = (typeof VALID_TYPES)[number];

// 無料プランで利用可能な最新シーズン（2022〜2024）
const FREE_PLAN_LATEST_SEASON = 2024;

async function fetchSeasonFixtures(teamId: number, season: number): Promise<ApiFixtureEntry[]> {
  return fetchApiFootball<ApiFixtureEntry[]>(`/fixtures?team=${teamId}&season=${season}`);
}

function filterAndSort(fixtures: Fixture[], type: FixtureType): Fixture[] {
  const now = Date.now();

  switch (type) {
    case "past":
      return fixtures
        .filter((f) => f.status === "finished" || new Date(f.date).getTime() < now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

    case "upcoming":
      return fixtures
        .filter((f) => f.status === "scheduled" || f.status === "live" || new Date(f.date).getTime() >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 10);

    case "recent":
      // 今日に近い順にソートして前後を取り、最終的に日付降順（最新が先頭）で返す
      return fixtures
        .sort((a, b) => Math.abs(new Date(a.date).getTime() - now) - Math.abs(new Date(b.date).getTime() - now))
        .slice(0, 10)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    case "all":
      return fixtures.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    // 無料プランの利用可能な最新シーズンから取得（必要なら前シーズンにフォールバック）
    let entries = await fetchSeasonFixtures(teamId, FREE_PLAN_LATEST_SEASON);
    if (entries.length === 0) {
      entries = await fetchSeasonFixtures(teamId, FREE_PLAN_LATEST_SEASON - 1);
    }

    const fixtures = entries.map(transformFixture);
    return ok(filterAndSort(fixtures, type));
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 503) return serviceUnavailable(err.message);
      return internalError(err.code, err.message);
    }
    return internalError("UNKNOWN_ERROR", "予期しないエラーが発生しました");
  }
};
