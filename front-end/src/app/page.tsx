import { PAGE_SIZE } from "@task-manager/back-end/schemas";
import Typography from "@mui/material/Typography";
import { getTranslations } from "next-intl/server";
import { HydrateClient, getQueryClient, trpc } from "@/trpc/server";
import { TaskListView } from "@/views/task-list/task-list-view";

/**
 * Data changes on every operation (in-memory store), so this page cannot be
 * generated statically at build time: it is rendered on every request (SSR).
 */
export const dynamic = "force-dynamic";

export default async function TaskListPage() {
  const t = await getTranslations("taskList");

  // SSR: the first page of tasks is fetched on the server and sent already
  // hydrated into the React Query cache. The HTML arrives with the list ready,
  // and the client component takes over from there (infinite scroll, deletion…).
  await getQueryClient().prefetchInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(
      { limit: PAGE_SIZE },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <HydrateClient>
      <Typography variant="h1">{t("title")}</Typography>
      <TaskListView />
    </HydrateClient>
  );
}
