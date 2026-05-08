"use client";

import { Client as LangGraphClient } from "@langchain/langgraph-sdk/client";

import { getLangGraphBaseURL } from "../config";

import { isStateChangingMethod, readCsrfCookie } from "./fetcher";
import { sanitizeRunStreamOptions } from "./stream-mode";
import { getToken } from "@/core/auth/token-handler";

/**
 * SDK ``onRequest`` hook that injects both:
 * 1. ``Authorization: Bearer <token>`` from localStorage (supports IAM redirect)
 * 2. ``X-CSRF-Token`` from cookie for state-changing methods
 *
 * Reading cookies per-request handles login / logout / password
 * change cookie rotation transparently. Both the ``/api/langgraph/*`` SDK
 * path and the direct REST endpoints in ``fetcher.ts`` share the same
 * contract so behavior stays in lockstep.
 */
function injectAuthAndCsrfHeaders(_url: URL, init: RequestInit): RequestInit {
  const headers = new Headers(init.headers);

  // 1. Inject Authorization Bearer Token
  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 2. Inject CSRF Token for state-changing methods
  if (isStateChangingMethod(init.method ?? "GET")) {
    const csrfToken = readCsrfCookie();
    if (csrfToken && !headers.has("X-CSRF-Token")) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  return { ...init, headers };
}

function createCompatibleClient(isMock?: boolean): LangGraphClient {
  const apiUrl = getLangGraphBaseURL(isMock);
  const client = new LangGraphClient({
    apiUrl,
    onRequest: injectAuthAndCsrfHeaders,
  });

  const originalRunStream = client.runs.stream.bind(client.runs);
  client.runs.stream = ((threadId, assistantId, payload) =>
    originalRunStream(
      threadId,
      assistantId,
      sanitizeRunStreamOptions(payload),
    )) as typeof client.runs.stream;

  const originalJoinStream = client.runs.joinStream.bind(client.runs);
  client.runs.joinStream = ((threadId, runId, options) =>
    originalJoinStream(
      threadId,
      runId,
      sanitizeRunStreamOptions(options),
    )) as typeof client.runs.joinStream;

  return client;
}

const _clients = new Map<string, LangGraphClient>();
export function getAPIClient(isMock?: boolean): LangGraphClient {
  const cacheKey = isMock ? "mock" : "default";
  let client = _clients.get(cacheKey);

  if (!client) {
    client = createCompatibleClient(isMock);
    _clients.set(cacheKey, client);
  }

  return client;
}
