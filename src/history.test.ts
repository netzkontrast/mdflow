import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import {
  loadHistory,
  getFrecencyScore,
  recordUsage,
  getHistoryData,
  resetHistory,
} from "./history";
import { join } from "path";
import { homedir } from "os";
import { rm } from "fs/promises";

const HISTORY_PATH = join(homedir(), ".mdflow", "history.json");

describe("history", () => {
  beforeEach(() => {
    resetHistory();
  });

  describe("getFrecencyScore", () => {
    it("returns 0 for unknown paths", async () => {
      await loadHistory();
      expect(getFrecencyScore("/unknown/path.md")).toBe(0);
    });

    it("calculates higher score for recent usage", async () => {
      await loadHistory();

      // Manually set history data for testing
      const data = getHistoryData()!;
      const now = Date.now();

      // Recent usage (< 4 hours)
      data["/recent.md"] = { count: 10, lastUsed: now - 1000 * 60 * 60 }; // 1 hour ago

      // Old usage (> 1 week)
      data["/old.md"] = { count: 10, lastUsed: now - 1000 * 60 * 60 * 24 * 10 }; // 10 days ago

      const recentScore = getFrecencyScore("/recent.md");
      const oldScore = getFrecencyScore("/old.md");

      // Recent should have 4x multiplier, old should have 0.25x
      expect(recentScore).toBeGreaterThan(oldScore);
      expect(recentScore / oldScore).toBeGreaterThan(10); // 4/0.25 = 16x theoretical
    });

    it("calculates higher score for higher usage count", async () => {
      await loadHistory();

      const data = getHistoryData()!;
      const now = Date.now();

      // Same recency, different counts
      data["/high-use.md"] = { count: 100, lastUsed: now };
      data["/low-use.md"] = { count: 1, lastUsed: now };

      const highScore = getFrecencyScore("/high-use.md");
      const lowScore = getFrecencyScore("/low-use.md");

      expect(highScore).toBeGreaterThan(lowScore);
    });

    it("uses logarithmic frequency scaling", async () => {
      await loadHistory();

      const data = getHistoryData()!;
      const now = Date.now();

      // 1 use vs 10 uses vs 100 uses
      data["/use-1.md"] = { count: 1, lastUsed: now };
      data["/use-10.md"] = { count: 10, lastUsed: now };
      data["/use-100.md"] = { count: 100, lastUsed: now };

      const score1 = getFrecencyScore("/use-1.md");
      const score10 = getFrecencyScore("/use-10.md");
      const score100 = getFrecencyScore("/use-100.md");

      // Logarithmic: score10 should NOT be 10x score1
      // With log10, 10 uses = 20 * 4 = 80, 1 use = log10(2) * 20 * 4 ≈ 24
      expect(score10 / score1).toBeLessThan(5);
      expect(score100 / score10).toBeLessThan(5);
    });

    it("applies correct recency buckets", async () => {
      await loadHistory();

      const data = getHistoryData()!;
      const now = Date.now();
      const hour = 1000 * 60 * 60;

      // Same count, different recencies
      data["/1h.md"] = { count: 10, lastUsed: now - 1 * hour }; // 4x
      data["/12h.md"] = { count: 10, lastUsed: now - 12 * hour }; // 2x
      data["/3d.md"] = { count: 10, lastUsed: now - 72 * hour }; // 0.5x
      data["/10d.md"] = { count: 10, lastUsed: now - 240 * hour }; // 0.25x

      const s1h = getFrecencyScore("/1h.md");
      const s12h = getFrecencyScore("/12h.md");
      const s3d = getFrecencyScore("/3d.md");
      const s10d = getFrecencyScore("/10d.md");

      expect(s1h).toBeGreaterThan(s12h);
      expect(s12h).toBeGreaterThan(s3d);
      expect(s3d).toBeGreaterThan(s10d);

      // Verify ratios match expected multipliers
      expect(s1h / s12h).toBeCloseTo(2, 1); // 4x / 2x = 2
      expect(s12h / s3d).toBeCloseTo(4, 1); // 2x / 0.5x = 4
      expect(s3d / s10d).toBeCloseTo(2, 1); // 0.5x / 0.25x = 2
    });
  });

  describe("recordUsage", () => {
    it("increments count and updates lastUsed", async () => {
      await loadHistory();
      // Use unique path to avoid interference from previous runs
      const testPath = `/test/record-${Date.now()}-${Math.random()}.md`;

      expect(getHistoryData()![testPath]).toBeUndefined();

      await recordUsage(testPath);

      const entry = getHistoryData()![testPath];
      expect(entry).toBeDefined();
      expect(entry!.count).toBe(1);
      expect(entry!.lastUsed).toBeGreaterThan(0);
    });

    it("increments existing count", async () => {
      await loadHistory();
      // Use unique path to avoid interference from previous runs
      const testPath = `/test/increment-${Date.now()}-${Math.random()}.md`;

      const initialCount = getHistoryData()![testPath]?.count ?? 0;

      await recordUsage(testPath);
      await recordUsage(testPath);
      await recordUsage(testPath);

      const entry = getHistoryData()![testPath];
      expect(entry!.count).toBe(initialCount + 3);
    });
  });
});
