import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing(.*)",
  "/privacy(.*)",
  "/support(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/create-organization(.*)",
  "/api/webhooks(.*)",
]);

// Allow requests from the Capacitor iOS/Android native apps
const MOBILE_ORIGINS = ["capacitor://localhost", "ionic://localhost", "http://localhost"];

function mobileCorsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !MOBILE_ORIGINS.some((o) => origin.startsWith(o))) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const origin = req.headers.get("origin");
  const cors = mobileCorsHeaders(origin);

  // Handle CORS preflight from the mobile app
  if (req.method === "OPTIONS" && Object.keys(cors).length > 0) {
    return new NextResponse(null, { status: 204, headers: cors });
  }

  if (!isPublicRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL("/sign-in", req.url).toString(),
    });
  }

  const res = NextResponse.next();
  Object.entries(cors).forEach(([k, v]) => res.headers.set(k, v));
  return res;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
