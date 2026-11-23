import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { handler } from "../http";
import { createCaller } from "../index";

/**
 * Router tests through `createCaller`: the same direct-call path used by the
 * Server Components, including Zod input validation.
 */
const caller = createCaller({});
const MISSING_ID = "00000000-0000-4000-8000-000000000000";

/** Runs a call that should fail and returns the tRPC error code. */
async function errorCode(call: Promise<unknown>) {
  try {
    await call;
  } catch (error) {
    if (error instanceof TRPCError) return error.code;
    throw error;
  }
  throw new Error("Expected the call to fail");
}

describe("task router", () => {
  it("runs the full CRUD flow", async () => {
    const created = await caller.task.create({ title: "  Router test  ", description: "Details" });
    expect(created).toMatchObject({ title: "Router test", description: "Details", status: "not_started" });

    expect(await caller.task.getById({ id: created.id })).toEqual(created);

    const updated = await caller.task.update({ id: created.id, title: "Renamed", description: "" });
    expect(updated).toMatchObject({ id: created.id, title: "Renamed", description: undefined });

    const changed = await caller.task.changeStatus({ id: created.id, status: "done" });
    expect(changed.status).toBe("done");

    const firstPage = await caller.task.list({ limit: 5 });
    expect(firstPage.items[0]?.id).toBe(created.id); // newest first
    expect(firstPage.items).toHaveLength(5);

    expect(await caller.task.delete({ id: created.id })).toMatchObject({ id: created.id });
    expect(await errorCode(caller.task.getById({ id: created.id }))).toBe("NOT_FOUND");
  });

  it("rejects a task without a title (BAD_REQUEST)", async () => {
    expect(await errorCode(caller.task.create({ title: "   " }))).toBe("BAD_REQUEST");
  });

  it("rejects an invalid id or status (BAD_REQUEST)", async () => {
    expect(await errorCode(caller.task.getById({ id: "not-a-uuid" }))).toBe("BAD_REQUEST");
    // @ts-expect-error — an unknown status is a type error, and the runtime validation rejects it too.
    expect(await errorCode(caller.task.changeStatus({ id: MISSING_ID, status: "archived" }))).toBe("BAD_REQUEST");
  });

  it.each([
    ["update", () => caller.task.update({ id: MISSING_ID, title: "x" })],
    ["changeStatus", () => caller.task.changeStatus({ id: MISSING_ID, status: "done" })],
    ["delete", () => caller.task.delete({ id: MISSING_ID })],
  ])("returns NOT_FOUND when %s targets a missing task", async (_name, call) => {
    expect(await errorCode(call())).toBe("NOT_FOUND");
  });
});

/** Shape of a tRPC error response (superjson wraps it in `json`). */
type ErrorBody = {
  error: {
    json: {
      message: string;
      data: { zodError: { fieldErrors: Record<string, string[]> } | null };
    };
  };
};

describe("HTTP error format", () => {
  /** Calls the real HTTP handler, as the browser does (body serialized by superjson). */
  async function post(path: string, json: unknown) {
    const response = await handler(
      new Request(`http://localhost/api/trpc/${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ json }),
      }),
    );
    return { status: response.status, body: (await response.json()) as ErrorBody };
  }

  it("returns a readable message and per-field errors for validation failures", async () => {
    const { status, body } = await post("task.create", { title: " " });

    expect(status).toBe(400);
    expect(body.error.json.message).toBe("Title is required.");
    expect(body.error.json.data.zodError?.fieldErrors).toEqual({ title: ["Title is required."] });
  });

  it("returns 404 with a meaningful message for a missing task", async () => {
    const { status, body } = await post("task.update", { id: MISSING_ID, title: "x" });

    expect(status).toBe(404);
    expect(body.error.json.message).toContain("was not found");
    expect(body.error.json.data.zodError).toBeNull();
  });
});
