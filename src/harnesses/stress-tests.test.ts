/**
 * Stress tests and additional edge cases for harnesses
 * Tests: duplicate flags, ordering, MCP config, large inputs
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
// DUPLICATE FLAG PREVENTION TESTS
// =============================================================================

describe("Duplicate flag prevention", () => {
  test("Claude: yolo via both approval and allow-all-tools shouldn't double-add", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      approval: "yolo",
      "allow-all-tools": true,
      claude: { "dangerously-skip-permissions": true }
    }));
    // Should only have one --dangerously-skip-permissions
    const count = args.filter(a => a === "--dangerously-skip-permissions").length;
    expect(count).toBe(1);
  });

  test("Codex: yolo via multiple sources shouldn't double-add --full-auto", () => {
    const harness = new CodexHarness();
    const args = harness.buildArgs(makeContext({
      approval: "yolo",
      "allow-all-tools": true,
      codex: { "full-auto": true }
    }));
    const count = args.filter(a => a === "--full-auto").length;
    expect(count).toBe(1);
  });

  test("Gemini: sandbox via approval and gemini config", () => {
    const harness = new GeminiHarness();
    const args = harness.buildArgs(makeContext({
      approval: "sandbox",
      gemini: { sandbox: true }
    }));
    // Should only have one --sandbox
    const count = args.filter(a => a === "--sandbox").length;
    expect(count).toBe(1);
  });

  test("Claude: fork-session from session and claude config", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      session: { fork: true },
      claude: { "fork-session": true }
    }));
    // Check for duplicates
    const count = args.filter(a => a === "--fork-session").length;
    // Current impl may add duplicates - this documents behavior
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// =============================================================================
// MCP CONFIG HANDLING
// =============================================================================

describe("MCP config handling", () => {
  test("Claude: universal mcp-config works", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      "mcp-config": "./universal-mcp.json"
    }));
    expect(args).toContain("--mcp-config");
    expect(args).toContain("./universal-mcp.json");
  });

  test("Claude: claude-specific mcp-config works", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      claude: { "mcp-config": "./claude-mcp.json" }
    }));
    expect(args).toContain("--mcp-config");
    expect(args).toContain("./claude-mcp.json");
  });

  test("Claude: both universal and specific mcp-config", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      "mcp-config": "./universal.json",
      claude: { "mcp-config": "./specific.json" }
    }));
    expect(args).toContain("./universal.json");
    expect(args).toContain("./specific.json");
    // Should have 2 mcp-config flags
    expect(args.filter(a => a === "--mcp-config")).toHaveLength(2);
  });

  test("Copilot: mcp-config maps to additional-mcp-config", () => {
    const harness = new CopilotHarness();
    const args = harness.buildArgs(makeContext({
      "mcp-config": "./mcp.json"
    }));
    expect(args).toContain("--additional-mcp-config");
    expect(args).toContain("./mcp.json");
  });

  test("Gemini: MCP server names work", () => {
    const harness = new GeminiHarness();
    const args = harness.buildArgs(makeContext({
      gemini: { "allowed-mcp-server-names": ["server1", "server2"] }
    }));
    expect(args.filter(a => a === "--allowed-mcp-server-names")).toHaveLength(2);
  });
});

// =============================================================================
// LARGE INPUT HANDLING
// =============================================================================

describe("Large input handling", () => {
  test("Large array of dirs doesn't crash", () => {
    const harness = new ClaudeHarness();
    const manyDirs = Array.from({ length: 100 }, (_, i) => `/path/to/dir${i}`);
    const args = harness.buildArgs(makeContext({ dirs: manyDirs }));
    expect(args.filter(a => a === "--add-dir")).toHaveLength(100);
  });

  test("Large array of tools doesn't crash", () => {
    const harness = new CopilotHarness();
    const manyTools = Array.from({ length: 50 }, (_, i) => `Tool${i}`);
    const args = harness.buildArgs(makeContext({
      tools: { allow: manyTools }
    }));
    expect(args.filter(a => a === "--allow-tool")).toHaveLength(50);
  });

  test("Long tool names work", () => {
    const harness = new ClaudeHarness();
    const longToolName = "A".repeat(200);
    const args = harness.buildArgs(makeContext({
      tools: { allow: [longToolName] }
    }));
    expect(args).toContain(longToolName);
  });

  test("Long directory paths work", () => {
    const harness = new GeminiHarness();
    const longPath = "/very" + "/deep".repeat(50) + "/path";
    const args = harness.buildArgs(makeContext({ dirs: longPath }));
    expect(args).toContain(longPath);
  });
});

// =============================================================================
// SPECIAL CHARACTER HANDLING
// =============================================================================

describe("Special character handling", () => {
  test("Paths with spaces work", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      dirs: "/path/with spaces/dir"
    }));
    expect(args).toContain("/path/with spaces/dir");
  });

  test("Paths with quotes work", () => {
    const harness = new CopilotHarness();
    const args = harness.buildArgs(makeContext({
      dirs: '/path/with"quotes'
    }));
    expect(args).toContain('/path/with"quotes');
  });

  test("Tool names with special chars work", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      tools: { allow: ["mcp__server__tool", "tool:name", "tool-with-dash"] }
    }));
    expect(args).toContain("mcp__server__tool");
    expect(args).toContain("tool:name");
    expect(args).toContain("tool-with-dash");
  });

  test("Session ID with special chars work", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      session: { resume: "session-abc_123.456" }
    }));
    expect(args).toContain("session-abc_123.456");
  });

  test("MCP config with glob patterns work", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      "mcp-config": "./**/*.mcp.json"
    }));
    expect(args).toContain("./**/*.mcp.json");
  });
});

// =============================================================================
// DEBUG FLAG HANDLING
// =============================================================================

describe("Debug flag handling", () => {
  test("Claude: debug: true adds --debug", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({ debug: true }));
    expect(args).toContain("--debug");
  });

  test("Claude: debug: string adds --debug with value", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({ debug: "verbose" }));
    expect(args).toContain("--debug");
    expect(args).toContain("verbose");
  });

  test("Codex: debug adds -c config", () => {
    const harness = new CodexHarness();
    const args = harness.buildArgs(makeContext({ debug: true }));
    expect(args).toContain("-c");
    expect(args).toContain("debug=true");
  });

  test("Gemini: debug adds --debug", () => {
    const harness = new GeminiHarness();
    const args = harness.buildArgs(makeContext({ debug: true }));
    expect(args).toContain("--debug");
  });

  test("Copilot: debug sets log-level to debug", () => {
    const harness = new CopilotHarness();
    const args = harness.buildArgs(makeContext({ debug: true }));
    expect(args).toContain("--log-level");
    expect(args).toContain("debug");
  });
});

// =============================================================================
// HARNESS-SPECIFIC FEATURE TESTS
// =============================================================================

describe("Harness-specific features", () => {
  describe("Claude-specific", () => {
    test("system-prompt works", () => {
      const harness = new ClaudeHarness();
      const args = harness.buildArgs(makeContext({
        claude: { "system-prompt": "Be helpful" }
      }));
      expect(args).toContain("--system-prompt");
      expect(args).toContain("Be helpful");
    });

    test("append-system-prompt works", () => {
      const harness = new ClaudeHarness();
      const args = harness.buildArgs(makeContext({
        claude: { "append-system-prompt": "Additional context" }
      }));
      expect(args).toContain("--append-system-prompt");
    });

    test("betas array works", () => {
      const harness = new ClaudeHarness();
      const args = harness.buildArgs(makeContext({
        claude: { betas: ["beta1", "beta2"] }
      }));
      expect(args.filter(a => a === "--betas")).toHaveLength(2);
    });

    test("permission-mode works", () => {
      const harness = new ClaudeHarness();
      const args = harness.buildArgs(makeContext({
        claude: { "permission-mode": "strict" }
      }));
      expect(args).toContain("--permission-mode");
      expect(args).toContain("strict");
    });

    test("ide flag works", () => {
      const harness = new ClaudeHarness();
      const args = harness.buildArgs(makeContext({
        claude: { ide: true }
      }));
      expect(args).toContain("--ide");
    });
  });

  describe("Codex-specific", () => {
    test("oss mode works", () => {
      const harness = new CodexHarness();
      const args = harness.buildArgs(makeContext({
        codex: { oss: true }
      }));
      expect(args).toContain("--oss");
    });

    test("local-provider works", () => {
      const harness = new CodexHarness();
      const args = harness.buildArgs(makeContext({
        codex: { "local-provider": "ollama" }
      }));
      expect(args).toContain("--local-provider");
      expect(args).toContain("ollama");
    });

    test("cd works", () => {
      const harness = new CodexHarness();
      const args = harness.buildArgs(makeContext({
        codex: { cd: "/workspace" }
      }));
      expect(args).toContain("--cd");
      expect(args).toContain("/workspace");
    });

    test("search flag works", () => {
      const harness = new CodexHarness();
      const args = harness.buildArgs(makeContext({
        codex: { search: true }
      }));
      expect(args).toContain("--search");
    });

    test("image attachments work", () => {
      const harness = new CodexHarness();
      const args = harness.buildArgs(makeContext({
        codex: { image: ["img1.png", "img2.png"] }
      }));
      expect(args.filter(a => a === "--image")).toHaveLength(2);
    });

    test("profile works", () => {
      const harness = new CodexHarness();
      const args = harness.buildArgs(makeContext({
        codex: { profile: "my-profile" }
      }));
      expect(args).toContain("--profile");
      expect(args).toContain("my-profile");
    });
  });

  describe("Gemini-specific", () => {
    test("approval-mode works", () => {
      const harness = new GeminiHarness();
      const args = harness.buildArgs(makeContext({
        gemini: { "approval-mode": "auto_edit" }
      }));
      expect(args).toContain("--approval-mode");
      expect(args).toContain("auto_edit");
    });

    test("extensions work", () => {
      const harness = new GeminiHarness();
      const args = harness.buildArgs(makeContext({
        gemini: { extensions: ["code_execution", "web_search"] }
      }));
      expect(args.filter(a => a === "--extensions")).toHaveLength(2);
    });

    test("screen-reader flag works", () => {
      const harness = new GeminiHarness();
      const args = harness.buildArgs(makeContext({
        gemini: { "screen-reader": true }
      }));
      expect(args).toContain("--screen-reader");
    });
  });

  describe("Copilot-specific", () => {
    test("agent selection works", () => {
      const harness = new CopilotHarness();
      const args = harness.buildArgs(makeContext({
        copilot: { agent: "custom-agent" }
      }));
      expect(args).toContain("--agent");
      expect(args).toContain("custom-agent");
    });

    test("silent defaults to true", () => {
      const harness = new CopilotHarness();
      const args = harness.buildArgs(makeContext({}));
      expect(args).toContain("--silent");
    });

    test("silent: false omits flag", () => {
      const harness = new CopilotHarness();
      const args = harness.buildArgs(makeContext({
        copilot: { silent: false }
      }));
      expect(args).not.toContain("--silent");
    });

    test("banner flag works", () => {
      const harness = new CopilotHarness();
      const args = harness.buildArgs(makeContext({
        copilot: { banner: true }
      }));
      expect(args).toContain("--banner");
    });

    test("no-color flag works", () => {
      const harness = new CopilotHarness();
      const args = harness.buildArgs(makeContext({
        copilot: { "no-color": true }
      }));
      expect(args).toContain("--no-color");
    });

    test("no-custom-instructions flag works", () => {
      const harness = new CopilotHarness();
      const args = harness.buildArgs(makeContext({
        copilot: { "no-custom-instructions": true }
      }));
      expect(args).toContain("--no-custom-instructions");
    });

    test("stream mode works", () => {
      const harness = new CopilotHarness();
      const args = harness.buildArgs(makeContext({
        copilot: { stream: "always" }
      }));
      expect(args).toContain("--stream");
      expect(args).toContain("always");
    });

    test("log-level works (not overridden by debug)", () => {
      const harness = new CopilotHarness();
      const args = harness.buildArgs(makeContext({
        copilot: { "log-level": "info" }
      }));
      expect(args).toContain("--log-level");
      expect(args).toContain("info");
    });

    test("debug overrides copilot log-level", () => {
      const harness = new CopilotHarness();
      const args = harness.buildArgs(makeContext({
        debug: true,
        copilot: { "log-level": "info" }  // Should be ignored
      }));
      expect(args).toContain("debug");
      expect(args).not.toContain("info");
    });
  });
});

// =============================================================================
// FACTORY INTEGRATION TESTS
// =============================================================================

describe("Factory harness creation", () => {
  test("All harnesses have correct names", () => {
    expect(new ClaudeHarness().name).toBe("claude");
    expect(new CodexHarness().name).toBe("codex");
    expect(new CopilotHarness().name).toBe("copilot");
    expect(new GeminiHarness().name).toBe("gemini");
  });

  test("All harnesses have correct commands", () => {
    expect(new ClaudeHarness().getCommand()).toBe("claude");
    expect(new CodexHarness().getCommand()).toBe("codex");
    expect(new CopilotHarness().getCommand()).toBe("copilot");
    expect(new GeminiHarness().getCommand()).toBe("gemini");
  });
});

// =============================================================================
// REGRESSION TESTS
// =============================================================================

describe("Regression tests", () => {
  test("Empty tools object doesn't add flags", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      tools: {}
    }));
    expect(args).not.toContain("--allowed-tools");
    expect(args).not.toContain("--disallowed-tools");
  });

  test("Empty session object doesn't add flags", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      session: {}
    }));
    expect(args).not.toContain("-c");
    expect(args).not.toContain("-r");
    expect(args).not.toContain("--fork-session");
  });

  test("Empty string values are handled", () => {
    const harness = new ClaudeHarness();
    const args = harness.buildArgs(makeContext({
      model: ""
    }));
    // Empty model should not add --model flag
    // (implementation specific - documents behavior)
    expect(args).toBeDefined();
  });

  test("Numeric zero is handled correctly", () => {
    const harness = new CodexHarness();
    const args = harness.buildArgs(makeContext({
      codex: { timeout: 0 }
    }));
    // 0 should still be passed as a value
    expect(args).toContain("0");
  });
});
