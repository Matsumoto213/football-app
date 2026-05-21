import type { APIGatewayProxyHandler } from "aws-lambda";
import { fetchApiFootball, ApiError } from "../services/apiFootball";
import { ok, badRequest, serviceUnavailable, internalError } from "../utils/response";

interface ApiLineupPlayer {
  id: number;
  name: string;
  number: number | null;
  pos: string;
  grid: string | null;
}

interface ApiLineupEntry {
  team: { id: number; name: string; logo: string };
  formation: string;
  startXI: Array<{ player: ApiLineupPlayer }>;
  substitutes: Array<{ player: ApiLineupPlayer }>;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const fixtureId = Number(event.pathParameters?.fixtureId);
  if (isNaN(fixtureId) || fixtureId <= 0) return badRequest("有効な fixtureId を指定してください");

  try {
    const entries = await fetchApiFootball<ApiLineupEntry[]>(
      `/fixtures/lineups?fixture=${fixtureId}`
    );
    return ok(
      entries.map((entry) => ({
        team: { id: entry.team.id, name: entry.team.name, logo: entry.team.logo },
        formation: entry.formation,
        startXI: entry.startXI.map(({ player: p }) => ({
          id: p.id,
          name: p.name,
          number: p.number,
          pos: p.pos,
          grid: p.grid,
          isSubstitute: false,
        })),
        substitutes: entry.substitutes.map(({ player: p }) => ({
          id: p.id,
          name: p.name,
          number: p.number,
          pos: p.pos,
          grid: p.grid,
          isSubstitute: true,
        })),
      }))
    );
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.statusCode === 503) return serviceUnavailable(err.message);
      return internalError(err.code, err.message);
    }
    return internalError("UNKNOWN_ERROR", "予期しないエラーが発生しました");
  }
};
