import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./routers";
import { createTRPCContext } from "./trpc";

/** Path where the API is mounted on the web server. */
export const TRPC_ENDPOINT = "/api/trpc";

/**
 * tRPC HTTP adapter based on the Fetch API (Request -> Response).
 *
 * Design decision: the back-end ships a ready, framework-agnostic handler.
 * The front-end (Next.js) only "mounts" it on a route; to run the back-end on
 * another server (Node, Bun, Deno, edge) this function could be reused as is.
 */
export function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: TRPC_ENDPOINT,
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError({ path, error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`[tRPC] error on ${path ?? "<no path>"}:`, error);
      }
    },
  });
}
