import { describe, expect, it } from "vitest";
import { formatDate, SUMMARY_MAX_LENGTH, truncate } from "./format";

describe("truncate", () => {
  it("keeps short texts untouched", () => {
    expect(truncate("Short description")).toEqual({ text: "Short description", truncated: false });
  });

  it(`keeps a text of exactly ${SUMMARY_MAX_LENGTH} characters`, () => {
    const text = "a".repeat(SUMMARY_MAX_LENGTH);
    expect(truncate(text)).toEqual({ text, truncated: false });
  });

  it("cuts at the last space so words are not split, and appends an ellipsis", () => {
    expect(truncate("The quick brown fox jumps", 18)).toEqual({ text: "The quick brown…", truncated: true });
  });

  it("cuts hard when there is no space close to the end (one huge word)", () => {
    expect(truncate("a".repeat(30), 10)).toEqual({ text: `${"a".repeat(10)}…`, truncated: true });
  });

  it("never returns more than the limit plus the ellipsis", () => {
    const { text } = truncate("word ".repeat(100));
    expect(text.length).toBeLessThanOrEqual(SUMMARY_MAX_LENGTH + 1);
    expect(text.endsWith("…")).toBe(true);
  });
});

describe("formatDate", () => {
  it("uses a fixed locale and time zone, so SSR and the browser render the same text", () => {
    // 2026-11-23 15:05 UTC = 12:05 in São Paulo (UTC-3).
    expect(formatDate(new Date("2026-11-23T15:05:00Z"))).toBe("Nov 23, 2026, 12:05 PM");
  });

  it("formats in the user's language", () => {
    expect(formatDate(new Date("2026-11-23T15:05:00Z"), "pt-BR")).toBe("23 de nov. de 2026, 12:05");
  });
});
