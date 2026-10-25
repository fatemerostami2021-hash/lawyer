import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { startLogin } from "./const";
import "./index.css";
import "./upgrade.css";
import "./upgrade2.css";
import "./upgrade3.css";
import "./upgrade4.css";
import "./upgrade5.css";
import SceneBackdrop from "./components/SceneBackdrop";

// ---- Browser-tab icon: uses /logo.png if you add one, otherwise the generated gold-scales icon ----
const setIcons = (png: string, svg?: string) => {
  document.querySelectorAll("link[rel~='icon'], link[rel='apple-touch-icon'], link[rel='shortcut icon']").forEach(el => el.remove());
  const add = (rel: string, href: string, type?: string, sizes?: string) => { const l = document.createElement("link"); l.rel = rel; l.href = href; if (type) l.type = type; if (sizes) l.setAttribute("sizes", sizes); document.head.appendChild(l); };
  if (svg) add("icon", svg, "image/svg+xml");
  add("icon", png, "image/png", "any"); add("apple-touch-icon", png);
};
setIcons("/favicon-192.png?v=3", "/favicon.svg?v=3");
fetch("/logo.png", { method: "HEAD" }).then(r => { if (r.ok && (r.headers.get("content-type") || "").startsWith("image")) setIcons("/logo.png?v=3"); }).catch(() => {});

// ---- One page-wide canvas for the 3D scales (shared by every page) ----
const sceneRoot = document.createElement("div"); sceneRoot.id = "scene-root"; sceneRoot.setAttribute("aria-hidden", "true"); document.body.appendChild(sceneRoot);
createRoot(sceneRoot).render(<SceneBackdrop />);

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  startLogin();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        // Preview auto-login fallback: when the browser blocks iframe cookies
        // (Safari ITP / private browsing / WebView), the runtime mirrors the
        // session into sessionStorage so we can forward it as a Bearer token.
        // The regular OAuth cookie flow keeps working and takes priority server-side.
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
          // sessionStorage unavailable
        }
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
