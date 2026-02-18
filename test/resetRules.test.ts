import { describe, expect, it } from "vitest";
import { getNextResetAt } from "@/domain/resetRules";

describe("getNextResetAt", () => {
  it("returns next day for daily", () => {
    const next = getNextResetAt("DAILY", new Date(2026, 1, 18, 10, 30));
    expect(next.getDate()).toBe(19);
  });

  it("returns Monday for weekly", () => {
    const next = getNextResetAt("WEEKLY", new Date(2026, 1, 18, 10, 30));
    expect(next.getDay()).toBe(1);
  });
});
