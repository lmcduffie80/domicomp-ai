import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { Clerk } from "@clerk/clerk-js";
import { Preferences } from "@capacitor/preferences";
import App from "./App";
import { clerkFrontendApiHost, routeClerkThroughNativeHttp } from "@/lib/clerkNativeFetch";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
if (!PUBLISHABLE_KEY) throw new Error("VITE_CLERK_PUBLISHABLE_KEY is not set");

routeClerkThroughNativeHttp(clerkFrontendApiHost(PUBLISHABLE_KEY));

// WKWebView drops Clerk's cookies on relaunch, so the client token is kept in native storage instead.
const CLIENT_TOKEN_KEY = "clerk_client_jwt";
const clerk = new Clerk(PUBLISHABLE_KEY);

clerk.__internal_onBeforeRequest(async (req) => {
  req.credentials = "omit";
  req.url?.searchParams.append("_is_native", "1");
  const { value } = await Preferences.get({ key: CLIENT_TOKEN_KEY });
  (req.headers as Headers).set("authorization", value ?? "");
});

clerk.__internal_onAfterResponse(async (_req, res) => {
  const token = res?.headers.get("authorization");
  if (token) await Preferences.set({ key: CLIENT_TOKEN_KEY, value: token });
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider Clerk={clerk} publishableKey={PUBLISHABLE_KEY} standardBrowser={false} afterSignOutUrl="/sign-in">
      <App />
    </ClerkProvider>
  </StrictMode>
);
