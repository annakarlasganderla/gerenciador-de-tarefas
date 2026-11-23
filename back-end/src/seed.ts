import { randomUUID } from "node:crypto";
import { TASK_STATUSES, type Task } from "./schemas";

/**
 * Sample tasks so the list and the infinite scroll can be seen as soon as the
 * app starts. They are regenerated on every server start (the store is in memory).
 */
export function generateSampleTasks(now = Date.now()): Task[] {
  const TOTAL = 25;
  return Array.from({ length: TOTAL }, (_, index) => {
    const n = index + 1;
    return {
      id: randomUUID(),
      title: `Sample task #${n}`,
      description: n % 3 === 0 ? undefined : `Description of sample task number ${n}.`,
      status: TASK_STATUSES[n % TASK_STATUSES.length],
      // One minute apart, oldest first (insertion order = creation order).
      createdAt: new Date(now - (TOTAL - n) * 60_000),
    };
  });
}
