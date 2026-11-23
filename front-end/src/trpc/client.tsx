"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import type { AppRouter } from "@task-manager/back-end";
import { makeQueryClient } from "./query-client";

/**
 * tRPC + TanStack Query integration for Client Components.
 * Components call `useTRPC()` to get the typed `queryOptions`/`mutationOptions`
 * of each procedure.
 */
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient | undefined;
function getQueryClient() {
  // On the server: always a new client per request (avoids leaking data between users).
  if (typeof window === "undefined") return makeQueryClient();
  // In the browser: a single client for the whole session.
  return (browserQueryClient ??= makeQueryClient());
}

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchLink({ url: `${getBaseUrl()}/api/trpc`, transformer: superjson }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
