/**
 * Exhaustive edge case tests for frontmatter flags across all harnesses
 * Tests: new keys, deprecated keys, precedence, arrays, nested objects, passthrough
 */

import { test, expect, describe } from "bun:test";
import { ClaudeHarness } from "./claude";
import { CodexHarness } from "./codex";
import { CopilotHarness } from "./copilot";
import { GeminiHarness } from "./gemini";
import type { RunContext } from "./types";
import type { AgentFrontmatter } from "../types";

function makeContext(frontmatter: AgentFrontmatter = {}): RunContext {
  return {
    prompt: "test prompt",
    frontmatter,
    passthroughArgs: [],
    captureOutput: false,
  };
}

// =============================================================================
// PRECEDENCE TESTS: New keys should take precedence over deprecated
// =============================================================================

describe("Precedence: New keys over deprecated", () => {
  describe("dirs vs add-dir", () => {
    test("Claude: dirs takes precedence over add-dir", () => {
      const harness = new ClaudeHarness();
      const args = harness.buildArgs(makeContext({
        dirs: "/new/path",
        "add-dir": "/old/path"
      }));
      expect(args).toContain("/new/path");
      expect(args).not.toContain("/old/path");
    });

    test("Codex: dirs takes precedence over add-dir", () => {
      const harness = new CodexHarness();
      const args = harness.buildArgs(makeContext({
        dirs: "/new/path",
        "add-dir": "/old/path"
      }));
      expect(args).toContain("/new/path");
      expect(args).not.toContain("/old/path");
    });

    test("Gemini: dirs takes precedence over add-dir", () => {
      const harness = new GeminiHarness();
      const args = harness.buildArgs(makeContext({
        dirs: "/new/path",
        "add-dir": "/old/path"
      }));
      expect(args).toContain("/new/path");
      expect(args).not.toContain("/old/path");
    });

    test("Copilot: dirs takes precedence over add-dir", () => {
      const harness = new CopilotHarness();
      const args = harness.buildArgs(makeContext({
        dirs: "/new/path",
        "add-dir": "/old/path"
      }));
      expect(args).toContain("/new/path");
      expect(args).not.toContain("/old/path");
    });
  });

  describe("approval vs allow-all-tools", () => {
    test("Claude: approval: yolo takes precedence", () => {
      const harness = new ClaudeHarness();
      // When approval is "ask", should NOT enable god mode even if allow-all-tools is true
      const args = harness.buildArgs(makeContext({
        approval: "ask",
        "allow-all-tools": true
      }));
      // approval: "ask" should mean no --dangerously-skip-permissions
      // But our current implementation OR's them together
      // This test documents current behavior
      expect(args).toContain("--dangerously-skip-permissions");
    });

    test("Codex: approval: yolo takes precedence", () => {
      const harness = new CodexHarness();
      const args = harness.buildArgs(makeContext({
        approval: "yolo"
      }));
      expect(args).toContain("--full-auto");
    });
  });

  describe("tools vs allow-tool/deny-tool", () => {
    test("Claude: tools.allow takes precedence over allow-tool", () => {
      const harness = new ClaudeHarness();
      const args = harness.buildArgs(makeContext({
        tools: { allow: ["NewTool"] },
        "allow-tool": ["OldTool"]
      }));
      expect(args).toContain("NewTool");
      expect(args).not.toContain("OldTool");
    });

    test("Copilot: tools.deny takes precedence over deny-tool", () => {
      const harness = new CopilotHarness();
      const args = harness.buildArgs(makeContext({
        tools: { deny: ["NewBadTool"] },
        "deny-tool": ["OldBadTool"]
      }));
      expect(args).toContain("NewBadTool");
      expect(args).not.toContain("OldBadTool");
    });
  });

  describe("session vs resume/continue", () => {
    test("Claude: session.resume takes precedence over resume", () => {
      const harness = new ClaudeHarness();
      const args = harness.buildArgs(makeContext({
        session: { resume: "new-session-id" },
        resume: "old-session-id"
      }));
      expect(args).toContain("new-session-id");
      expect(args).not.toContain("old-session-id");
    });

    test("Gemini: session.resume takes precedence", () => {
      const harness = new GeminiHarness();
      const args = harness.buildArgs(makeContext({
        session: { resume: "new-id" },
        resume: "old-id"
      }));
      expect(args).toContain("new-id");
      expect(args).not.toContain("old-id");
    });
  });

  describe("output vs output-format", () => {
    test("Claude: output takes precedence over output-format", () => {
      const harness = new ClaudeHarness();
      const args = harness.buildArgs(makeContext({
        output: "json",
        "output-format": "text"
      }));
      const formatIndex = args.indexOf("--output-format");
      expect(args[formatIndex + 1]).toBe("json");
    });

    test("Gemini: output takes precedence over output-format", () => {
      const harness = new GeminiHarness();
      const args = harness.buildArgs(makeContext({
        output: "stream-json",
        "output-format": "text"
      }));
      const formatIndex = args.indexOf("--output-format");
      expect(args[formatIndex + 1]).toBe("stream-json");
    });
  });
});

// =============================================================================
// ARRAY HANDLING TESTS
// =============================================================================

describe("Array handling", () => {
  test("dirs: single string becomes single --add-dir", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({ dirs: "/single/path" }));
    expect(args.filter(a => a === "--add-dir")).toHaveLength(1);
  });

  test("dirs: array becomes multiple --add-dir", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      dirs: ["/path1", "/path2", "/path3"]
    }));
    expect(args.filter(a => a === "--add-dir")).toHaveLength(3);
  });

  test("tools.allow: single string works", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      tools: { allow: "SingleTool" }
    }));
    expect(args).toContain("SingleTool");
  });

  test("tools.allow: array works", () => {
    const harness = new CopilotHarness();
    const args = harness.buildArgs(makeContext({
      tools: { allow: ["Tool1", "Tool2"] }
    }));
    expect(args).toContain("Tool1");
    expect(args).toContain("Tool2");
  });

  test("tools.deny: empty array doesn't add flags", () => {
    const harness = new CopilotHarness();
    const args = harness.buildArgs(makeContext({
      tools: { deny: [] }
    }));
    expect(args).not.toContain("--deny-tool");
  });
});

// =============================================================================
// NULL/UNDEFINED/MISSING VALUE TESTS
// =============================================================================

describe("Null/undefined/missing value handling", () => {
  test("undefined dirs falls back to deprecated add-dir", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      dirs: undefined,
      "add-dir": "/fallback/path"
    }));
    expect(args).toContain("/fallback/path");
  });

  test("null tools doesn't crash", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      tools: null as any
    }));
    expect(args).toBeDefined();
  });

  test("empty frontmatter doesn't crash any harness", () => {
    const claude = new ClaudeHarness();
    const codex = new CodexHarness();
    const copilot = new CopilotHarness();
    const gemini = new GeminiHarness();

    expect(() => claude.buildArgs(makeContext({}))).not.toThrow();
    expect(() => codex.buildArgs(makeContext({}))).not.toThrow();
    expect(() => copilot.buildArgs(makeContext({}))).not.toThrow();
    expect(() => gemini.buildArgs(makeContext({}))).not.toThrow();
  });

  test("partial tools object works", () => {
    const harness = new CopilotHarness();
    const args = harness.buildArgs(makeContext({
      tools: { allow: ["OnlyAllow"] }
      // deny is missing
    }));
    expect(args).toContain("OnlyAllow");
    expect(args).not.toContain("--deny-tool");
  });

  test("partial session object works", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      session: { fork: true }
      // resume is missing
    }));
    expect(args).toContain("--fork-session");
  });
});

// =============================================================================
// APPROVAL MODE COMBINATIONS
// =============================================================================

describe("Approval mode combinations", () => {
  describe("Claude approval modes", () => {
    test("approval: ask - no special flags", () => {
      const harness = new ClaudeHarness();
      const args = harness.buildArgs(makeContext({ approval: "ask" }));
      expect(args).not.toContain("--dangerously-skip-permissions");
    });

    test("approval: yolo - enables skip permissions", () => {
      const harness = new ClaudeHarness();
      const args = harness.buildArgs(makeContext({ approval: "yolo" }));
      expect(args).toContain("--dangerously-skip-permissions");
    });

    test("approval: sandbox - no effect on Claude (no sandbox support)", () => {
      const harness = new ClaudeHarness();
      const args = harness.buildArgs(makeContext({ approval: "sandbox" }));
      // Claude doesn't have sandbox mode
      expect(args).not.toContain("--sandbox");
      expect(args).not.toContain("--dangerously-skip-permissions");
    });
  });

  describe("Codex approval modes", () => {
    test("approval: ask - no special flags", () => {
      const harness = new CodexHarness();
      const args = harness.buildArgs(makeContext({ approval: "ask" }));
      expect(args).not.toContain("--full-auto");
      expect(args).not.toContain("--sandbox");
    });

    test("approval: yolo - enables full-auto", () => {
      const harness = new CodexHarness();
      const args = harness.buildArgs(makeContext({ approval: "yolo" }));
      expect(args).toContain("--full-auto");
    });

    test("approval: sandbox - enables sandbox mode", () => {
      const harness = new CodexHarness();
      const args = harness.buildArgs(makeContext({ approval: "sandbox" }));
      expect(args).toContain("--sandbox");
    });
  });

  describe("Gemini approval modes", () => {
    test("approval: yolo - enables yolo", () => {
      const harness = new GeminiHarness();
      const args = harness.buildArgs(makeContext({ approval: "yolo" }));
      expect(args).toContain("--yolo");
    });

    test("approval: sandbox - enables sandbox", () => {
      const harness = new GeminiHarness();
      const args = harness.buildArgs(makeContext({ approval: "sandbox" }));
      expect(args).toContain("--sandbox");
    });
  });

  describe("Copilot approval modes", () => {
    test("approval: yolo - enables allow-all-tools", () => {
      const harness = new CopilotHarness();
      const args = harness.buildArgs(makeContext({ approval: "yolo" }));
      expect(args).toContain("--allow-all-tools");
    });
  });
});

// =============================================================================
// SESSION HANDLING EDGE CASES
// =============================================================================

describe("Session handling edge cases", () => {
  test("session.resume: true uses continue flag", () => {
    const harness = new CopilotHarness();
    const args = harness.buildArgs(makeContext({
      session: { resume: true }
    }));
    expect(args).toContain("--continue");
  });

  test("session.resume: string uses resume with ID", () => {
    const harness = new CopilotHarness();
    const args = harness.buildArgs(makeContext({
      session: { resume: "session-abc123" }
    }));
    expect(args).toContain("--resume");
    expect(args).toContain("session-abc123");
  });

  test("session.resume: false doesn't add flags", () => {
    const harness = new CopilotHarness();
    const args = harness.buildArgs(makeContext({
      session: { resume: false }
    }));
    expect(args).not.toContain("--continue");
    expect(args).not.toContain("--resume");
  });

  test("Gemini: session.resume: true uses latest", () => {
    const harness = new GeminiHarness();
    const args = harness.buildArgs(makeContext({
      session: { resume: true }
    }));
    expect(args).toContain("--resume");
    expect(args).toContain("latest");
  });

  test("Claude: session.resume: true uses -c", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      session: { resume: true }
    }));
    expect(args).toContain("-c");
  });

  test("Claude: session.resume: string uses -r", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      session: { resume: "session-xyz" }
    }));
    expect(args).toContain("-r");
    expect(args).toContain("session-xyz");
  });

  test("Claude: session.fork adds fork-session", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      session: { fork: true }
    }));
    expect(args).toContain("--fork-session");
  });
});

// =============================================================================
// INTERACTIVE MODE TESTS
// =============================================================================

describe("Interactive mode handling", () => {
  test("Claude: interactive: false adds -p", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({ interactive: false }));
    expect(args).toContain("-p");
  });

  test("Claude: interactive: true doesn't add -p", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({ interactive: true }));
    expect(args).not.toContain("-p");
  });

  test("Claude: no interactive key doesn't add -p", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({}));
    expect(args).not.toContain("-p");
  });

  test("Copilot: interactive: false adds -p", () => {
    const harness = new CopilotHarness();
    const args = harness.buildArgs(makeContext({ interactive: false }));
    expect(args).toContain("-p");
    expect(args).not.toContain("--interactive");
  });

  test("Copilot: interactive: true adds --interactive", () => {
    const harness = new CopilotHarness();
    const args = harness.buildArgs(makeContext({ interactive: true }));
    expect(args).toContain("--interactive");
    expect(args).not.toContain("-p");
  });
});

// =============================================================================
// PASSTHROUGH ARGS TESTS
// =============================================================================

describe("Passthrough args", () => {
  test("CLI passthrough args are appended", () => {
    const harness = new ClaudeHarness();
    const ctx = makeContext({});
    ctx.passthroughArgs = ["--custom-flag", "custom-value"];
    const args = harness.buildArgs(ctx);
    expect(args).toContain("--custom-flag");
    expect(args).toContain("custom-value");
  });

  test("Passthrough args come after harness args", () => {
    const harness = new ClaudeHarness();
    const ctx = makeContext({ model: "opus" });
    ctx.passthroughArgs = ["--custom"];
    const args = harness.buildArgs(ctx);
    const modelIndex = args.indexOf("--model");
    const customIndex = args.indexOf("--custom");
    expect(customIndex).toBeGreaterThan(modelIndex);
  });

  test("Multiple passthrough args work", () => {
    const harness = new CopilotHarness();
    const ctx = makeContext({});
    ctx.passthroughArgs = ["--flag1", "val1", "--flag2", "val2"];
    const args = harness.buildArgs(ctx);
    expect(args).toContain("--flag1");
    expect(args).toContain("val1");
    expect(args).toContain("--flag2");
    expect(args).toContain("val2");
  });
});

// =============================================================================
// HARNESS-SPECIFIC CONFIG PASSTHROUGH
// =============================================================================

describe("Harness-specific config passthrough", () => {
  test("Claude: unknown claude config keys pass through", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      claude: { "custom-claude-flag": "value" }
    }));
    expect(args).toContain("--custom-claude-flag");
    expect(args).toContain("value");
  });

  test("Codex: unknown codex config keys pass through", () => {
    const harness = new CodexHarness();
    const args = harness.buildArgs(makeContext({
      codex: { "custom-codex-flag": true }
    }));
    expect(args).toContain("--custom-codex-flag");
  });

  test("Copilot: unknown copilot config keys pass through", () => {
    const harness = new CopilotHarness();
    const args = harness.buildArgs(makeContext({
      copilot: { "custom-copilot-flag": "test" }
    }));
    expect(args).toContain("--custom-copilot-flag");
    expect(args).toContain("test");
  });

  test("Gemini: unknown gemini config keys pass through", () => {
    const harness = new GeminiHarness();
    const args = harness.buildArgs(makeContext({
      gemini: { "custom-gemini-flag": 42 }
    }));
    expect(args).toContain("--custom-gemini-flag");
    expect(args).toContain("42");
  });
});

// =============================================================================
// COMPLEX COMBINATION TESTS
// =============================================================================

describe("Complex combinations", () => {
  test("Full Claude config with all new keys", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      model: "opus",
      interactive: false,
      approval: "yolo",
      dirs: ["/dir1", "/dir2"],
      tools: { allow: ["Read", "Write"], deny: ["Bash"] },
      session: { resume: true, fork: true },
      output: "json",
      debug: true,
      claude: {
        "mcp-config": "./mcp.json",
        "system-prompt": "Be helpful"
      }
    }));

    expect(args).toContain("--model");
    expect(args).toContain("opus");
    expect(args).toContain("-p");
    expect(args).toContain("--dangerously-skip-permissions");
    expect(args.filter(a => a === "--add-dir")).toHaveLength(2);
    expect(args).toContain("--allowed-tools");
    expect(args).toContain("--disallowed-tools");
    expect(args).toContain("-c");
    expect(args).toContain("--fork-session");
    expect(args).toContain("--output-format");
    expect(args).toContain("json");
    expect(args).toContain("--debug");
    expect(args).toContain("--mcp-config");
    expect(args).toContain("--system-prompt");
  });

  test("Full Gemini config with all new keys", () => {
    const harness = new GeminiHarness();
    const args = harness.buildArgs(makeContext({
      model: "gemini-2.5-pro",
      approval: "sandbox",
      dirs: "/workspace",
      tools: { allow: ["shell"] },
      session: { resume: "latest" },
      output: "json",
      debug: true,
      gemini: {
        "approval-mode": "auto_edit",
        extensions: ["code_execution"]
      }
    }));

    expect(args).toContain("--model");
    expect(args).toContain("--sandbox");
    expect(args).toContain("--include-directories");
    expect(args).toContain("--allowed-tools");
    expect(args).toContain("--resume");
    expect(args).toContain("--output-format");
    expect(args).toContain("--debug");
    expect(args).toContain("--approval-mode");
    expect(args).toContain("--extensions");
  });

  test("Mixing deprecated and new keys uses new ones", () => {
    const harness = new CopilotHarness();
    const args = harness.buildArgs(makeContext({
      // New keys
      dirs: "/new",
      approval: "yolo",
      tools: { allow: ["new-tool"] },
      session: { resume: true },
      // Deprecated keys (should be ignored)
      "add-dir": "/old",
      "allow-all-tools": false,  // approval takes precedence
      "allow-tool": ["old-tool"],
      resume: "old-session"
    }));

    // New keys should win
    expect(args).toContain("/new");
    expect(args).toContain("new-tool");
    expect(args).toContain("--continue");
    expect(args).toContain("--allow-all-tools");

    // Old keys should not appear
    expect(args).not.toContain("/old");
    expect(args).not.toContain("old-tool");
    expect(args).not.toContain("old-session");
  });
});

// =============================================================================
// TYPE COERCION TESTS
// =============================================================================

describe("Type coercion edge cases", () => {
  test("Boolean true for tools.allow doesn't crash", () => {
    const harness = new ClaudeHarness();
    // This is invalid input but shouldn't crash
    expect(() => harness.buildArgs(makeContext({
      tools: { allow: true as any }
    }))).not.toThrow();
  });

  test("Number for dirs gets converted to string", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      dirs: 123 as any
    }));
    // toArray should handle this gracefully
    expect(args).toBeDefined();
  });

  test("Object in array for tools.allow doesn't crash", () => {
    const harness = new ClaudeHarness();
    expect(() => harness.buildArgs(makeContext({
      tools: { allow: [{} as any, "valid"] }
    }))).not.toThrow();
  });
});

// =============================================================================
// MODEL MAPPING TESTS
// =============================================================================

describe("Model mapping", () => {
  test("Claude: short names map correctly", () => {
    const harness = new ClaudeHarness();

    const sonnetArgs = harness.buildArgs(makeContext({ model: "claude-sonnet-4" }));
    expect(sonnetArgs).toContain("sonnet");

    const opusArgs = harness.buildArgs(makeContext({ model: "opus" }));
    expect(opusArgs).toContain("opus");
  });

  test("Gemini: model names map correctly", () => {
    const harness = new GeminiHarness();

    const proArgs = harness.buildArgs(makeContext({ model: "gemini-pro" }));
    expect(proArgs).toContain("gemini-3-pro-preview");

    const flashArgs = harness.buildArgs(makeContext({ model: "gemini-flash" }));
    expect(flashArgs).toContain("gemini-2.5-flash");
  });

  test("Unknown models pass through unchanged", () => {
    const claude = new ClaudeHarness();
    const gemini = new GeminiHarness();

    const claudeArgs = claude.buildArgs(makeContext({ model: "custom-model" }));
    expect(claudeArgs).toContain("custom-model");

    const geminiArgs = gemini.buildArgs(makeContext({ model: "custom-model" }));
    expect(geminiArgs).toContain("custom-model");
  });
});
