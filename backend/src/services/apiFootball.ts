import fetch from "node-fetch";
import { InMemoryCache } from "./cache";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const BASE_URL = "https://v3.football.api-sports.io";
const cache = new InMemoryCache(300_000);

function getApiKey(): string {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new ApiError(500, "CONFIG_ERROR", "API_FOOTBALL_KEY が設定されていません");
  return key;
}

export async function fetchApiFootball<T>(path: string): Promise<T> {
  const cached = cache.get<T>(path);
  if (cached !== null) return cached;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { "x-apisports-key": getApiKey() },
    });
  } catch {
    throw new ApiError(504, "UPSTREAM_TIMEOUT", "API-FOOTBALL への接続がタイムアウトしました");
  }

  if (response.status === 429) {
    throw new ApiError(503, "RATE_LIMIT", "API のリクエスト上限に達しました（100回/日）");
  }
  if (response.status >= 500) {
    throw new ApiError(502, "UPSTREAM_ERROR", "API-FOOTBALL サーバーエラー");
  }
  if (!response.ok) {
    throw new ApiError(response.status, "API_ERROR", `API-FOOTBALL エラー: ${response.status}`);
  }

  const json = (await response.json()) as { response: T };
  cache.set(path, json.response);
  return json.response;
}
