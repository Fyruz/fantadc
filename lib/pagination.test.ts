import { describe, expect, it } from "vitest";
import {
  buildPageHref,
  getPaginationState,
  resolvePageParam,
} from "./pagination";

describe("resolvePageParam", () => {
  it("defaults to page 1 for invalid values", () => {
    expect(resolvePageParam(undefined)).toBe(1);
    expect(resolvePageParam("0")).toBe(1);
    expect(resolvePageParam("-3")).toBe(1);
    expect(resolvePageParam("abc")).toBe(1);
  });

  it("uses the first value when the page param is an array", () => {
    expect(resolvePageParam(["4", "5"])).toBe(4);
  });
});

describe("getPaginationState", () => {
  it("clamps the page inside the available bounds", () => {
    expect(getPaginationState("99", 42, 10)).toMatchObject({
      currentPage: 5,
      totalPages: 5,
      skip: 40,
      take: 10,
      from: 41,
      to: 42,
    });
  });

  it("returns a stable empty state", () => {
    expect(getPaginationState(undefined, 0, 25)).toMatchObject({
      currentPage: 1,
      totalPages: 1,
      skip: 0,
      take: 25,
      from: 0,
      to: 0,
    });
  });
});

describe("buildPageHref", () => {
  it("omits the query string for the first page", () => {
    expect(buildPageHref("/admin/utenti", 1)).toBe("/admin/utenti");
  });

  it("adds the page query string for other pages", () => {
    expect(buildPageHref("/admin/audit", 3)).toBe("/admin/audit?page=3");
  });
});
