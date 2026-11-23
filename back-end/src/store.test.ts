import { beforeEach, describe, expect, it } from "vitest";
import { createTaskStore, type TaskStore } from "./store";

/** Collects every task by following the cursor, as the infinite scroll does. */
function readAllPages(store: TaskStore, limit: number) {
  const titles: string[] = [];
  let cursor: number | null | undefined;
  do {
    const page = store.list({ limit, cursor });
    titles.push(...page.items.map((task) => task.title));
    cursor = page.nextCursor;
  } while (cursor != null);
  return titles;
}

describe("taskStore", () => {
  let store: TaskStore;

  beforeEach(() => {
    store = createTaskStore();
  });

  describe("create", () => {
    it("generates the id and creation date on the server", () => {
      const before = Date.now();
      const task = store.create({ title: "Write tests", status: "not_started" });

      expect(task.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(task.createdAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(task).toMatchObject({ title: "Write tests", status: "not_started", description: undefined });
      expect(store.getById(task.id)).toEqual(task);
    });

    it("gives every task a unique id", () => {
      const ids = new Set(Array.from({ length: 50 }, (_, i) => store.create({ title: `T${i}`, status: "done" }).id));
      expect(ids.size).toBe(50);
    });
  });

  describe("list", () => {
    it("returns the newest tasks first, with the total count", () => {
      ["A", "B", "C"].forEach((title) => store.create({ title, status: "not_started" }));
      const page = store.list({ limit: 10 });

      expect(page.items.map((task) => task.title)).toEqual(["C", "B", "A"]);
      expect(page.total).toBe(3);
      expect(page.nextCursor).toBeNull();
    });

    it("paginates with a cursor without skipping or repeating tasks", () => {
      for (let i = 1; i <= 7; i++) store.create({ title: `Task ${i}`, status: "not_started" });

      expect(readAllPages(store, 3)).toEqual(["Task 7", "Task 6", "Task 5", "Task 4", "Task 3", "Task 2", "Task 1"]);
    });

    it("stays consistent when a task is deleted between two pages", () => {
      const tasks = Array.from({ length: 6 }, (_, i) => store.create({ title: `Task ${i + 1}`, status: "not_started" }));

      const first = store.list({ limit: 3 }); // Task 6, 5, 4
      store.delete(tasks[5].id); // delete "Task 6", already shown
      const second = store.list({ limit: 3, cursor: first.nextCursor });

      // With offset pagination, "Task 3" would be skipped here.
      expect(second.items.map((task) => task.title)).toEqual(["Task 3", "Task 2", "Task 1"]);
    });
  });

  describe("update", () => {
    it("changes title and description but keeps id, createdAt and status", () => {
      const task = store.create({ title: "Old", description: "Old description", status: "in_progress" });
      const updated = store.update(task.id, { title: "New", description: undefined });

      expect(updated).toEqual({ ...task, title: "New", description: undefined });
    });

    it("changes the status when provided", () => {
      const task = store.create({ title: "Task", status: "not_started" });
      expect(store.update(task.id, { title: "Task", status: "done" })?.status).toBe("done");
    });

    it("returns undefined for a missing task", () => {
      expect(store.update("missing", { title: "x" })).toBeUndefined();
    });
  });

  describe("changeStatus", () => {
    it("changes only the status", () => {
      const task = store.create({ title: "Task", description: "Details", status: "not_started" });
      expect(store.changeStatus(task.id, "in_progress")).toEqual({ ...task, status: "in_progress" });
    });

    it("returns undefined for a missing task", () => {
      expect(store.changeStatus("missing", "done")).toBeUndefined();
    });
  });

  describe("delete", () => {
    it("removes the task and returns it", () => {
      const task = store.create({ title: "Task", status: "not_started" });

      expect(store.delete(task.id)).toEqual(task);
      expect(store.getById(task.id)).toBeUndefined();
      expect(store.list({ limit: 10 }).total).toBe(0);
    });

    it("returns undefined when the task does not exist (or was already deleted)", () => {
      const task = store.create({ title: "Task", status: "not_started" });
      store.delete(task.id);
      expect(store.delete(task.id)).toBeUndefined();
    });
  });
});
