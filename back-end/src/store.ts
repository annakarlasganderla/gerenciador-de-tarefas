import { randomUUID } from "node:crypto";
import type { Task, TaskStatus } from "./schemas";
import { generateSampleTasks } from "./seed";

/**
 * In-memory "database".
 *
 * Design decisions:
 * - Data lives in a `Map` stored on `globalThis`. In development Next.js reloads
 *   modules (HMR); without this, the list would be wiped on every code change.
 * - Each record gets an internal, never-reused sequence number (`seq`). It is the
 *   pagination cursor: unlike a numeric offset, it stays stable even when tasks
 *   are deleted between loading one page and the next.
 * - There is no persistence: data is lost when the server restarts.
 */

type StoredTask = { seq: number; task: Task };

/**
 * Creates an independent store, optionally pre-filled with tasks.
 * Exported as a factory so tests can start from a clean, isolated store.
 */
export function createTaskStore(initialTasks: Task[] = []) {
  const records = new Map<string, StoredTask>();
  let nextSeq = 1;
  for (const task of initialTasks) {
    records.set(task.id, { seq: nextSeq++, task });
  }

  return {
    /**
     * Lists tasks from newest to oldest.
     * `cursor` = seq of the last task already received; returns the ones before it.
     */
    list({ limit, cursor }: { limit: number; cursor?: number | null }) {
      const sorted = [...records.values()]
        .filter((record) => cursor == null || record.seq < cursor)
        .sort((a, b) => b.seq - a.seq);

      const page = sorted.slice(0, limit);
      const hasMore = sorted.length > limit;

      return {
        items: page.map((record) => record.task),
        nextCursor: hasMore ? page[page.length - 1].seq : null,
        total: records.size,
      };
    },

    getById(id: string): Task | undefined {
      return records.get(id)?.task;
    },

    create(data: { title: string; description?: string; status: TaskStatus }): Task {
      const task: Task = {
        id: randomUUID(),
        title: data.title,
        description: data.description,
        status: data.status,
        createdAt: new Date(),
      };
      records.set(task.id, { seq: nextSeq++, task });
      return task;
    },

    /** Returns `undefined` when the task does not exist (the router maps it to NOT_FOUND). */
    update(id: string, data: { title: string; description?: string; status?: TaskStatus }): Task | undefined {
      const record = records.get(id);
      if (!record) return undefined;
      // `id` and `createdAt` are immutable; an omitted status keeps the current one.
      record.task = {
        ...record.task,
        title: data.title,
        description: data.description,
        status: data.status ?? record.task.status,
      };
      return record.task;
    },

    /** Changes only the status. Returns `undefined` when the task does not exist. */
    changeStatus(id: string, status: TaskStatus): Task | undefined {
      const record = records.get(id);
      if (!record) return undefined;
      record.task = { ...record.task, status };
      return record.task;
    },

    /** Returns the removed task, or `undefined` when it did not exist. */
    delete(id: string): Task | undefined {
      const record = records.get(id);
      if (!record) return undefined;
      records.delete(id);
      return record.task;
    },
  };
}

export type TaskStore = ReturnType<typeof createTaskStore>;

// The app-wide instance, seeded with sample tasks. The key is versioned: when the
// data shape changes, hot reload creates a fresh store.
const globalForStore = globalThis as unknown as { __taskStoreV5?: TaskStore };

export const taskStore: TaskStore = (globalForStore.__taskStoreV5 ??= createTaskStore(generateSampleTasks()));
