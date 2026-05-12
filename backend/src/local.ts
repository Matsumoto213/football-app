import * as dotenv from "dotenv";
dotenv.config();

import { createServer, IncomingMessage, ServerResponse } from "http";
import { URL } from "url";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { handler as searchTeams } from "./handlers/searchTeams";
import { handler as getTeam } from "./handlers/getTeam";
import { handler as getFixtures } from "./handlers/getFixtures";
import { handler as getTeamPlayers } from "./handlers/getTeamPlayers";

type Handler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult | void>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
}

function route(method: string, path: string, handler: Handler): Route {
  const paramNames: string[] = [];
  const pattern = new RegExp(
    "^" + path.replace(/\{(\w+)\}/g, (_, name) => { paramNames.push(name); return "([^/]+)"; }) + "$"
  );
  return { method, pattern, paramNames, handler };
}

const routes: Route[] = [
  route("GET", "/teams/search", searchTeams as Handler),
  route("GET", "/teams/{teamId}/fixtures", getFixtures as Handler),
  route("GET", "/teams/{teamId}/players", getTeamPlayers as Handler),
  route("GET", "/teams/{teamId}", getTeam as Handler),
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
};

function mockEvent(
  req: IncomingMessage,
  url: URL,
  pathParameters: Record<string, string>,
  queryStringParameters: Record<string, string>
): APIGatewayProxyEvent {
  return {
    httpMethod: req.method ?? "GET",
    path: url.pathname,
    pathParameters: Object.keys(pathParameters).length ? pathParameters : null,
    queryStringParameters: Object.keys(queryStringParameters).length ? queryStringParameters : null,
    headers: req.headers as Record<string, string>,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    body: null,
    isBase64Encoded: false,
    resource: "",
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
  };
}

const PORT = parseInt(process.env.PORT ?? "3001", 10);

createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  for (const r of routes) {
    if (req.method !== r.method) continue;
    const match = url.pathname.match(r.pattern);
    if (!match) continue;

    const pathParameters: Record<string, string> = {};
    r.paramNames.forEach((name, i) => { pathParameters[name] = match[i + 1]; });

    const queryStringParameters: Record<string, string> = {};
    url.searchParams.forEach((v, k) => { queryStringParameters[k] = v; });

    const event = mockEvent(req, url, pathParameters, queryStringParameters);

    try {
      const result = (await r.handler(event)) as APIGatewayProxyResult;
      res.writeHead(result.statusCode, { ...result.headers, ...CORS });
      res.end(result.body);
    } catch (e) {
      console.error("[ERROR]", e);
      res.writeHead(500, { "Content-Type": "application/json", ...CORS });
      res.end(JSON.stringify({ success: false, data: null, error: { code: "INTERNAL_ERROR", message: "Unexpected error" } }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json", ...CORS });
  res.end(JSON.stringify({ success: false, data: null, error: { code: "NOT_FOUND", message: "Route not found" } }));
}).listen(PORT, () => {
  console.log(`\nFootball App Backend: http://localhost:${PORT}\n`);
  console.log("  GET /teams/search?q={チーム名}");
  console.log("  GET /teams/{teamId}");
  console.log("  GET /teams/{teamId}/fixtures?type=past|upcoming|recent");
  console.log("  GET /teams/{teamId}/players\n");
});
