import type { TaskStatus } from "@task-manager/back-end/schemas";

/** Display label of each task status. */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
};

/**
 * Color of each status (CSS variables defined in globals.css, with dark-mode
 * variants). The palette was checked for color-vision deficiencies, and the
 * color is always shown together with the label — never on its own.
 */
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  not_started: "var(--status-not-started)",
  in_progress: "var(--status-in-progress)",
  done: "var(--status-done)",
};
