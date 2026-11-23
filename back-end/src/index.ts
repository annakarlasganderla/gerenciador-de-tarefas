/**
 * Public API of the back-end (server-only).
 *
 * The front-end imports the router from here (so SSR can call procedures
 * directly, without HTTP) and the `AppRouter` TYPE (so the tRPC client gets
 * end-to-end type safety). Nothing in this file should reach the browser.
 */
import { appRouter } from "./routers";
import { createCallerFactory, createTRPCContext } from "./trpc";

export { appRouter, createTRPCContext };
export type { AppRouter } from "./routers";

/** Direct caller of the router, for Server Components. */
export const createCaller = createCallerFactory(appRouter);
