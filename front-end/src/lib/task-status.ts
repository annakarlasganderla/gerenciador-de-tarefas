import type { TaskStatus } from "@task-manager/back-end/schemas";

/*
 * The display label of each status is translated: see the `status` section of
 * the messages in src/i18n/messages/ (e.g. `t("status.in_progress")`).
 */

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
