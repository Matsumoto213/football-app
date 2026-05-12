import type { APIGatewayProxyResult } from "aws-lambda";

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function ok(data: unknown): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ success: true, data, error: null }),
  };
}

export function badRequest(message: string): APIGatewayProxyResult {
  return {
    statusCode: 400,
    headers: HEADERS,
    body: JSON.stringify({ success: false, data: null, error: { code: "BAD_REQUEST", message } }),
  };
}

export function notFound(message: string): APIGatewayProxyResult {
  return {
    statusCode: 404,
    headers: HEADERS,
    body: JSON.stringify({ success: false, data: null, error: { code: "NOT_FOUND", message } }),
  };
}

export function serviceUnavailable(message: string): APIGatewayProxyResult {
  return {
    statusCode: 503,
    headers: HEADERS,
    body: JSON.stringify({ success: false, data: null, error: { code: "SERVICE_UNAVAILABLE", message } }),
  };
}

export function internalError(code: string, message: string): APIGatewayProxyResult {
  return {
    statusCode: 500,
    headers: HEADERS,
    body: JSON.stringify({ success: false, data: null, error: { code, message } }),
  };
}
