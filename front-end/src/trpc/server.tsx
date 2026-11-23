import "server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { appRouter, createCaller, createTRPCContext } from "@task-manager/back-end";
import { makeQueryClient } from "./query-client";

/**
 * tRPC access from Server Components (SSR).
 *
 * Design decision: on the server the router is called DIRECTLY (no HTTP request
 * to the app itself). React's `cache` guarantees one QueryClient per request,
 * so data never leaks between users.
 */
export const getQueryClient = cache(makeQueryClient);

/** Proxy used to `prefetch` on the server and then hydrate the client cache. */
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

/** Direct caller, for when a Server Component only needs the data. */
export const caller = createCaller(createTRPCContext);

/** Sends what was prefetched on the server to the client. */
export function HydrateClient({ children }: { children: React.ReactNode }) {
  return <HydrationBoundary state={dehydrate(getQueryClient())}>{children}</HydrationBoundary>;
}
