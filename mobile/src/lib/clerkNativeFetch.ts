import { Capacitor, CapacitorHttp } from "@capacitor/core";

/** Frontend API host encoded in a Clerk publishable key (pk_test_<base64 host$>). */
export function clerkFrontendApiHost(publishableKey: string): string {
  return atob(publishableKey.split("_")[2] ?? "").replace(/\$$/, "");
}

function bodyToData(body: BodyInit | null | undefined, contentType: string): unknown {
  if (body == null) return undefined;
  if (contentType.includes("application/json") && typeof body === "string") return JSON.parse(body);
  if (typeof body === "string" || body instanceof URLSearchParams || body instanceof FormData) {
    return Object.fromEntries(new URLSearchParams(body as string | URLSearchParams));
  }
  return body;
}

/**
 * Clerk's Frontend API rejects requests that carry both an Origin and an Authorization header,
 * and a WebView always sends Origin. Routing only Clerk's calls through native HTTP drops Origin;
 * every other request (including streamed chat responses) keeps using the WebView's fetch.
 */
export function routeClerkThroughNativeHttp(frontendApiHost: string) {
  if (!Capacitor.isNativePlatform()) return;
  const webFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    if (url.host !== frontendApiHost) return webFetch(input, init);

    const headers = Object.fromEntries(new Headers(init?.headers ?? request.headers).entries());
    const contentType = headers["content-type"] ?? "application/x-www-form-urlencoded";
    if (init?.body != null) headers["content-type"] = contentType;

    const res = await CapacitorHttp.request({
      url: url.href,
      method: request.method,
      headers,
      data: bodyToData(init?.body, contentType),
    });

    const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data ?? null);
    return new Response(text, { status: res.status, headers: res.headers });
  };
}
