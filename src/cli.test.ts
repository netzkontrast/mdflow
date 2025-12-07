import { expect, test, describe } from "bun:test";
import { parseCliArgs, mergeFrontmatter } from "./cli";
import type { AgentFrontmatter } from "./types";

describe("parseCliArgs", () => {
  test("extracts file path", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md"]);
    expect(result.filePath).toBe("DEMO.md");
    expect(result.overrides).toEqual({});
    expect(result.appendText).toBe("");
    expect(result.templateVars).toEqual({});
    expect(result.noCache).toBe(false);
    expect(result.dryRun).toBe(false);
    expect(result.check).toBe(false);
    expect(result.json).toBe(false);
  });

  test("extracts positional text after file path", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md", "focus on errors"]);
    expect(result.filePath).toBe("DEMO.md");
    expect(result.appendText).toBe("focus on errors");
  });

  test("joins multiple positional args", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md", "be", "concise"]);
    expect(result.appendText).toBe("be concise");
  });

  test("parses --command flag", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md", "--command", "claude"]);
    expect(result.filePath).toBe("DEMO.md");
    expect(result.command).toBe("claude");
  });

  test("parses -c short flag", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md", "-c", "gemini"]);
    expect(result.command).toBe("gemini");
  });

  test("passes unknown flags through to command", () => {
    const result = parseCliArgs([
      "node", "script", "DEMO.md",
      "--target", "src/utils.ts",
      "--reference", "src/main.ts"
    ]);
    expect(result.passthroughArgs).toEqual([
      "--target", "src/utils.ts",
      "--reference", "src/main.ts"
    ]);
    expect(result.templateVars).toEqual({});
  });

  test("parses --no-cache flag", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md", "--no-cache"]);
    expect(result.noCache).toBe(true);
  });

  test("parses --dry-run flag", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md", "--dry-run"]);
    expect(result.dryRun).toBe(true);
  });

  test("command defaults to undefined", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md"]);
    expect(result.command).toBeUndefined();
  });

  test("unknown flags pass through without needing --", () => {
    const result = parseCliArgs([
      "node", "script", "DEMO.md",
      "--command", "claude",
      "--model", "opus"
    ]);
    expect(result.filePath).toBe("DEMO.md");
    expect(result.command).toBe("claude");
    expect(result.passthroughArgs).toEqual(["--model", "opus"]);
  });

  test("passthrough args default to empty array", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md"]);
    expect(result.passthroughArgs).toEqual([]);
  });

  test("single-dash flags pass through to command", () => {
    const result = parseCliArgs([
      "node", "script", "DEMO.md",
      "-p", "print mode"
    ]);
    expect(result.passthroughArgs).toEqual(["-p", "print mode"]);
  });

  test("parses --verbose flag", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md", "--verbose"]);
    expect(result.verbose).toBe(true);
  });

  test("passes -v through to command (not ma's verbose)", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md", "-v"]);
    expect(result.verbose).toBe(false);
    expect(result.passthroughArgs).toEqual(["-v"]);
  });

  test("verbose defaults to false", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md"]);
    expect(result.verbose).toBe(false);
  });

  test("parses --check flag", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md", "--check"]);
    expect(result.check).toBe(true);
  });

  test("parses --json flag", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md", "--json"]);
    expect(result.json).toBe(true);
  });

  test("parses --check and --json together", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md", "--check", "--json"]);
    expect(result.check).toBe(true);
    expect(result.json).toBe(true);
  });

  test("check and json default to false", () => {
    const result = parseCliArgs(["node", "script", "DEMO.md"]);
    expect(result.check).toBe(false);
    expect(result.json).toBe(false);
  });

});

describe("mergeFrontmatter", () => {
  test("merges frontmatter with empty overrides", () => {
    const frontmatter: AgentFrontmatter = { command: "claude" };
    const result = mergeFrontmatter(frontmatter, {});
    expect(result.command).toBe("claude");
  });

  test("overrides command", () => {
    const frontmatter: AgentFrontmatter = { command: "claude" };
    const result = mergeFrontmatter(frontmatter, { command: "gemini" });
    expect(result.command).toBe("gemini");
  });

  test("adds new fields from overrides", () => {
    const frontmatter: AgentFrontmatter = { command: "claude" };
    const result = mergeFrontmatter(frontmatter, { model: "opus" } as any);
    expect(result.command).toBe("claude");
    expect((result as any).model).toBe("opus");
  });

  test("preserves all frontmatter keys", () => {
    const frontmatter: AgentFrontmatter = {
      command: "claude",
      model: "opus",
      "dangerously-skip-permissions": true
    } as any;
    const result = mergeFrontmatter(frontmatter, {});
    expect(result.command).toBe("claude");
    expect((result as any).model).toBe("opus");
    expect((result as any)["dangerously-skip-permissions"]).toBe(true);
  });
});
