import { describe, expect, it } from "vitest";
import {
  createTaskSchema,
  DESCRIPTION_MAX_LENGTH,
  descriptionSchema,
  idSchema,
  statusSchema,
  TITLE_MAX_LENGTH,
  titleSchema,
} from "./schemas";

describe("titleSchema", () => {
  it("trims surrounding whitespace", () => {
    expect(titleSchema.parse("  Review PR  ")).toBe("Review PR");
  });

  it.each(["", "   ", "\n\t"])("rejects an empty or blank title (%j)", (value) => {
    const result = titleSchema.safeParse(value);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Title is required.");
  });

  it("rejects a missing title", () => {
    expect(titleSchema.safeParse(undefined).success).toBe(false);
  });

  it(`accepts exactly ${TITLE_MAX_LENGTH} characters and rejects one more`, () => {
    expect(titleSchema.safeParse("a".repeat(TITLE_MAX_LENGTH)).success).toBe(true);
    const tooLong = titleSchema.safeParse("a".repeat(TITLE_MAX_LENGTH + 1));
    expect(tooLong.success).toBe(false);
    expect(tooLong.error?.issues[0]?.message).toBe(`Title must be at most ${TITLE_MAX_LENGTH} characters.`);
  });
});

describe("descriptionSchema", () => {
  it("is optional", () => {
    expect(descriptionSchema.parse(undefined)).toBeUndefined();
  });

  it("turns an empty or blank description into undefined", () => {
    expect(descriptionSchema.parse("")).toBeUndefined();
    expect(descriptionSchema.parse("   ")).toBeUndefined();
  });

  it(`rejects more than ${DESCRIPTION_MAX_LENGTH} characters`, () => {
    expect(descriptionSchema.safeParse("a".repeat(DESCRIPTION_MAX_LENGTH)).success).toBe(true);
    expect(descriptionSchema.safeParse("a".repeat(DESCRIPTION_MAX_LENGTH + 1)).success).toBe(false);
  });
});

describe("createTaskSchema", () => {
  it('defaults the status to "not_started"', () => {
    expect(createTaskSchema.parse({ title: "Task" })).toEqual({ title: "Task", status: "not_started" });
  });

  it("reports errors per field", () => {
    const result = createTaskSchema.safeParse({ title: " ", description: "a".repeat(DESCRIPTION_MAX_LENGTH + 1) });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(["title", "description"]);
  });
});

describe("statusSchema and idSchema", () => {
  it("accepts only the known statuses", () => {
    expect(statusSchema.safeParse("in_progress").success).toBe(true);
    expect(statusSchema.safeParse("archived").success).toBe(false);
  });

  it("accepts only UUIDs as ids", () => {
    expect(idSchema.safeParse("6f1c2a4e-8b7d-4c1e-9f3a-2b5d7e9c1a3f").success).toBe(true);
    expect(idSchema.safeParse("not-a-uuid").success).toBe(false);
  });
});
