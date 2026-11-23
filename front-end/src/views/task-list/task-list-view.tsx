"use client";

import { PAGE_SIZE, type Task } from "@task-manager/back-end/schemas";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ErrorState, LoadingState } from "@/components/feedback";
import { StatusMenu } from "@/components/status-menu";
import { TaskDetailsModal } from "@/components/task-details-modal";
import { useToast } from "@/components/toast";
import { formatDate, truncate } from "@/lib/format";
import { TASK_STATUS_LABELS } from "@/lib/task-status";
import { useTRPC } from "@/trpc/client";

/** Task list screen: infinite scroll, status changes and deletion. */
export function TaskListView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const toast = useToast();
  /** Task waiting for delete confirmation (null = dialog closed). */
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);
  /** Task shown in full in the details dialog (null = closed). */
  const [openTask, setOpenTask] = useState<Task | null>(null);

  // Same options as the server prefetch => same query key,
  // so the SSR data is reused without a new request.
  const listOptions = trpc.task.list.infiniteQueryOptions(
    { limit: PAGE_SIZE },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const query = useInfiniteQuery(listOptions);

  /**
   * Status change with an OPTIMISTIC UPDATE: the chip changes immediately,
   * without waiting for the server. If the request fails, the previous value
   * is restored and an error toast is shown.
   */
  const changeStatus = useMutation(
    trpc.task.changeStatus.mutationOptions({
      onMutate: async ({ id, status }) => {
        // Cancel in-flight fetches so they don't overwrite the optimistic value.
        await queryClient.cancelQueries({ queryKey: listOptions.queryKey });
        const previous = queryClient.getQueryData(listOptions.queryKey);
        queryClient.setQueryData(listOptions.queryKey, (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items.map((task) => (task.id === id ? { ...task, status } : task)),
            })),
          },
        );
        return { previous };
      },
      onSuccess: (task) => {
        toast.success(`"${task.title}" marked as ${TASK_STATUS_LABELS[task.status].toLowerCase()}.`);
      },
      onError: (error, _variables, context) => {
        if (context?.previous) queryClient.setQueryData(listOptions.queryKey, context.previous);
        toast.error(`Couldn't change the status: ${error.message}`);
      },
      onSettled: () => queryClient.invalidateQueries(trpc.task.pathFilter()),
    }),
  );

  const deleteTask = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: (task) => {
        toast.success(`Task "${task.title}" deleted.`);
      },
      onError: (error) => {
        toast.error(`Couldn't delete the task: ${error.message}`);
      },
      // On success OR error (e.g. already deleted in another tab), close the dialog and resync the list.
      onSettled: () => {
        setTaskToDelete(null);
        return queryClient.invalidateQueries(trpc.task.pathFilter());
      },
    }),
  );

  // ---- Infinite scroll -------------------------------------------------------
  // A "sentinel" element at the end of the list; when it enters the viewport,
  // the next page is loaded. IntersectionObserver avoids listening to scroll events.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "200px" }, // start loading a little before reaching the end
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (query.isPending) return <LoadingState label="Loading tasks…" />;

  if (query.isError) {
    return <ErrorState message={`Error loading tasks: ${query.error.message}`} onRetry={() => query.refetch()} />;
  }

  const tasks = query.data.pages.flatMap((page) => page.items);
  const total = query.data.pages[0]?.total ?? 0;

  if (tasks.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          No tasks yet.
        </Typography>
        <Button component={Link} href="/tasks/new" variant="contained" startIcon={<AddIcon />}>
          Create your first task
        </Button>
      </Paper>
    );
  }

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Showing {tasks.length} of {total} {total === 1 ? "task" : "tasks"}
        {query.isRefetching && !isFetchingNextPage && " · refreshing…"}
      </Typography>

      <Stack component="ul" spacing={1.5} sx={{ listStyle: "none", m: 0, p: 0 }}>
        {tasks.map((task) => {
          const isDeleting = deleteTask.isPending && deleteTask.variables?.id === task.id;
          const isDone = task.status === "done";
          // Long descriptions are summarized on the list; the full text is in the details dialog.
          const summary = task.description ? truncate(task.description) : null;
          return (
            <Card
              component="li"
              key={task.id}
              sx={{ display: "flex", flexDirection: "column", opacity: isDeleting ? 0.5 : 1, transition: "opacity 0.2s" }}
            >
              <CardContent sx={{ pb: 1.5 }}>
                {/* Header: title and status side by side (the status wraps below when space is short). */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    columnGap: 2,
                    rowGap: 1,
                    mb: 0.75,
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      flex: "1 1 220px",
                      minWidth: 0,
                      pt: 0.25,
                      overflowWrap: "anywhere",
                      textDecoration: isDone ? "line-through" : "none",
                      color: isDone ? "text.secondary" : "text.primary",
                    }}
                  >
                    {task.title}
                  </Typography>
                  <StatusMenu
                    value={task.status}
                    taskTitle={task.title}
                    disabled={isDeleting || (changeStatus.isPending && changeStatus.variables?.id === task.id)}
                    onChange={(status) => changeStatus.mutate({ id: task.id, status })}
                  />
                </Box>

                {summary ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {summary.text}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>
                    No description
                  </Typography>
                )}
                {summary?.truncated && (
                  <Button
                    size="small"
                    onClick={() => setOpenTask(task)}
                    aria-label={`View full task: ${task.title}`}
                    sx={{ px: 0.5, mt: 0.5, ml: -0.5 }}
                  >
                    View full task
                  </Button>
                )}
              </CardContent>

              {/* Footer: date on the left, actions on the right — separated from the content. */}
              <Divider />
              <CardActions sx={{ px: 2, py: 0.75, justifyContent: "space-between" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="time"
                  dateTime={task.createdAt.toISOString()}
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <ScheduleIcon sx={{ fontSize: 16 }} aria-hidden />
                  Created {formatDate(task.createdAt)}
                </Typography>

                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {/*
                    Icon-only actions, made accessible:
                    - aria-label with the full name ("Edit task: X") for screen readers;
                      the tooltip text ("Edit") is contained in it, which helps voice control;
                    - MUI Tooltip: shown on hover AND keyboard focus, closes with Esc
                      and stays visible while the pointer is over it.
                  */}
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      component={Link}
                      href={`/tasks/${task.id}/edit`}
                      aria-label={`Edit task: ${task.title}`}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={isDeleting ? "Deleting…" : "Delete"}>
                    {/* aria-disabled (not disabled) keeps the button focusable and the tooltip working. */}
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={isDeleting ? `Deleting task: ${task.title}` : `Delete task: ${task.title}`}
                      aria-disabled={isDeleting}
                      aria-busy={isDeleting}
                      onClick={() => {
                        if (!isDeleting) setTaskToDelete({ id: task.id, title: task.title });
                      }}
                    >
                      {isDeleting ? (
                        <CircularProgress size={18} color="inherit" aria-hidden />
                      ) : (
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardActions>
            </Card>
          );
        })}
      </Stack>

      <Box ref={sentinelRef} sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        {isFetchingNextPage ? (
          <LoadingState label="Loading more tasks…" />
        ) : hasNextPage ? (
          // Accessible fallback in case the IntersectionObserver does not fire.
          <Button variant="outlined" onClick={() => fetchNextPage()}>
            Load more
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            You&apos;ve reached the end of the list.
          </Typography>
        )}
      </Box>

      <ConfirmDialog
        open={taskToDelete !== null}
        title="Delete task?"
        message={
          <>
            The task{" "}
            <Box component="strong" sx={{ color: "text.primary" }}>
              &ldquo;{taskToDelete?.title}&rdquo;
            </Box>{" "}
            will be permanently removed. This action can&apos;t be undone.
          </>
        }
        confirmLabel="Delete"
        danger
        loading={deleteTask.isPending}
        onConfirm={() => taskToDelete && deleteTask.mutate({ id: taskToDelete.id })}
        onCancel={() => setTaskToDelete(null)}
      />

      <TaskDetailsModal task={openTask} onClose={() => setOpenTask(null)} />
    </>
  );
}
