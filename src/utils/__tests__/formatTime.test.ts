import { describe, expect, it } from "vitest";
import { formatTime } from "../formatTime";

describe("formatTime", () => {
  it("should format zero seconds", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("should format single digit seconds", () => {
    expect(formatTime(5)).toBe("00:05");
  });

  it("should format two digit seconds", () => {
    expect(formatTime(45)).toBe("00:45");
  });

  it("should format one minute", () => {
    expect(formatTime(60)).toBe("01:00");
  });

  it("should format minutes and seconds", () => {
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(125)).toBe("02:05");
    expect(formatTime(459)).toBe("07:39");
  });

  it("should format ten minutes", () => {
    expect(formatTime(600)).toBe("10:00");
  });

  it("should format large durations (hours)", () => {
    expect(formatTime(3661)).toBe("61:01"); // 1 hour 1 minute 1 second
  });

  it("should format seconds with padding", () => {
    expect(formatTime(61)).toBe("01:01");
    expect(formatTime(62)).toBe("01:02");
    expect(formatTime(69)).toBe("01:09");
  });

  it("should handle typical workout times", () => {
    expect(formatTime(30)).toBe("00:30"); // 30 seconds
    expect(formatTime(90)).toBe("01:30"); // 1:30
    expect(formatTime(300)).toBe("05:00"); // 5 minutes
    expect(formatTime(1800)).toBe("30:00"); // 30 minutes
  });

  it("should pad minutes when over 9", () => {
    expect(formatTime(600)).toBe("10:00");
    expect(formatTime(605)).toBe("10:05");
    expect(formatTime(999)).toBe("16:39");
  });

  it("should correctly calculate remainder for seconds", () => {
    // 65 = 1 minute + 5 seconds
    expect(formatTime(65)).toBe("01:05");
    // 125 = 2 minutes + 5 seconds
    expect(formatTime(125)).toBe("02:05");
    // 119 = 1 minute + 59 seconds
    expect(formatTime(119)).toBe("01:59");
  });
});
