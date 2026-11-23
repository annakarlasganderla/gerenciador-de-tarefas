import { z } from "zod";

/**
 * Validation schemas shared by the back-end and the front-end.
 *
 * Design decision: a SINGLE source of truth for validation rules. The tRPC
 * procedures use these schemas as `input`, and the front-end form validates
 * with the very same schemas before submitting — so rules, limits and error
 * messages can never drift apart.
 */

export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

export const titleSchema = z
  .string({ error: "Title is required." })
  .trim()
  .min(1, { error: "Title is required." })
  .max(TITLE_MAX_LENGTH, { error: `Title must be at most ${TITLE_MAX_LENGTH} characters.` });

export const descriptionSchema = z
  .string()
  .trim()
  .max(DESCRIPTION_MAX_LENGTH, { error: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.` })
  .optional()
  // An empty string becomes `undefined`, so "no description" has a single representation.
  .transform((value) => (value ? value : undefined));

export const idSchema = z.uuid({ error: "Invalid task id." });

/** Possible task statuses (stable identifiers; display labels live in the front-end). */
export const TASK_STATUSES = ["not_started", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const statusSchema = z.enum(TASK_STATUSES, { error: "Invalid status." });

export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  /** Optional on creation: new tasks start as "not started". */
  status: statusSchema.default("not_started"),
});

export const updateTaskSchema = z.object({
  id: idSchema,
  title: titleSchema,
  description: descriptionSchema,
  /** Optional: when omitted, the current status is kept. */
  status: statusSchema.optional(),
});

/** Quick status-only change (used by the status menu on the task list). */
export const changeStatusSchema = z.object({
  id: idSchema,
  status: statusSchema,
});

export const listTasksSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  /** Opaque pagination cursor (used by the infinite scroll). */
  cursor: z.number().int().nullish(),
});

export type CreateTaskInput = z.input<typeof createTaskSchema>;

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
};

/** Size of each infinite-scroll "page" (used by both the SSR prefetch and the client). */
export const PAGE_SIZE = 10;
