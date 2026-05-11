import { describe, expect, it } from "vitest";
import { swapItems } from "../reorder";

describe("swapItems", () => {
  it("should swap two items in an array", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = swapItems(arr, 0, 4);
    expect(result).toEqual([5, 2, 3, 4, 1]);
  });

  it("should not mutate the original array", () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    swapItems(arr, 0, 2);
    expect(arr).toEqual(original);
  });

  it("should swap adjacent items", () => {
    const arr = ["a", "b", "c"];
    const result = swapItems(arr, 0, 1);
    expect(result).toEqual(["b", "a", "c"]);
  });

  it("should swap non-adjacent items", () => {
    const arr = [10, 20, 30, 40, 50];
    const result = swapItems(arr, 1, 3);
    expect(result).toEqual([10, 40, 30, 20, 50]);
  });

  it("should handle swapping with same index (no change)", () => {
    const arr = [1, 2, 3];
    const result = swapItems(arr, 1, 1);
    expect(result).toEqual([1, 2, 3]);
  });

  it("should work with objects", () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = swapItems(arr, 0, 2);
    expect(result[0].id).toBe(3);
    expect(result[2].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it("should work with single element array", () => {
    const arr = [1];
    const result = swapItems(arr, 0, 0);
    expect(result).toEqual([1]);
  });

  it("should work with two element array", () => {
    const arr = ["first", "second"];
    const result = swapItems(arr, 0, 1);
    expect(result).toEqual(["second", "first"]);
  });

  it("should work with mixed types in array", () => {
    const arr: (string | number | boolean)[] = ["text", 42, true, "other"];
    const result = swapItems(arr, 0, 3);
    expect(result).toEqual(["other", 42, true, "text"]);
  });

  it("should handle negative-like indices (truthy behavior)", () => {
    const arr = [1, 2, 3, 4, 5];
    // Note: JavaScript array access with negative numbers gets undefined
    // This tests that the function works with valid indices
    const result = swapItems(arr, 1, 3);
    expect(result).toEqual([1, 4, 3, 2, 5]);
  });

  it("should create new array reference", () => {
    const arr = [1, 2, 3];
    const result = swapItems(arr, 0, 1);
    expect(result).not.toBe(arr);
    expect(arr[0]).toBe(1); // Original unchanged
    expect(result[0]).toBe(2); // New array swapped
  });

  it("should work with large arrays", () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const result = swapItems(arr, 0, 999);
    expect(result[0]).toBe(999);
    expect(result[999]).toBe(0);
    expect(result.length).toBe(1000);
  });

  it("should work with empty-like values", () => {
    const arr = [null, undefined, 0, "", false];
    const result = swapItems(arr, 0, 4);
    expect(result[0]).toBe(false);
    expect(result[4]).toBe(null);
  });
});
