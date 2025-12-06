import { expect, test, describe } from "bun:test";
import { formatDryRun, toCommandList, type DryRunInfo } from "./dryrun";

describe("toCommandList", () => {
  test("converts string to array", () => {
    expect(toCommandList("echo hello")).toEqual(["echo hello"]);
  });

  test("passes array through", () => {
    expect(toCommandList(["cmd1", "cmd2"])).toEqual(["cmd1", "cmd2"]);
  });

  test("returns empty array for undefined", () => {
    expect(toCommandList(undefined)).toEqual([]);
  });
});

describe("formatDryRun", () => {
  test("includes header", () => {
    const info: DryRunInfo = {
      frontmatter: {},
      prompt: "Test prompt",
      harnessArgs: ["-p"],
      harnessName: "copilot",
      contextFiles: [],
      beforeCommands: [],
      afterCommands: [],
      templateVars: {},
    };
    const output = formatDryRun(info);
    expect(output).toContain("DRY RUN MODE");
  });

  test("includes prompt preview", () => {
    const info: DryRunInfo = {
      frontmatter: {},
      prompt: "My test prompt content",
      harnessArgs: ["-p"],
      harnessName: "copilot",
      contextFiles: [],
      beforeCommands: [],
      afterCommands: [],
      templateVars: {},
    };
    const output = formatDryRun(info);
    expect(output).toContain("PROMPT PREVIEW");
    expect(output).toContain("My test prompt content");
  });

  test("includes template variables", () => {
    const info: DryRunInfo = {
      frontmatter: {},
      prompt: "Test",
      harnessArgs: [],
      harnessName: "copilot",
      contextFiles: [],
      beforeCommands: [],
      afterCommands: [],
      templateVars: { target: "src/main.ts", branch: "develop" },
    };
    const output = formatDryRun(info);
    expect(output).toContain("TEMPLATE VARIABLES");
    expect(output).toContain("{{ target }}");
    expect(output).toContain("src/main.ts");
    expect(output).toContain("{{ branch }}");
    expect(output).toContain("develop");
  });

  test("includes context files", () => {
    const info: DryRunInfo = {
      frontmatter: {},
      prompt: "Test",
      harnessArgs: [],
      harnessName: "copilot",
      contextFiles: [
        { path: "/full/path/utils.ts", relativePath: "utils.ts", content: "const x = 1;\nconst y = 2;" }
      ],
      beforeCommands: [],
      afterCommands: [],
      templateVars: {},
    };
    const output = formatDryRun(info);
    expect(output).toContain("CONTEXT FILES");
    expect(output).toContain("utils.ts");
    expect(output).toContain("2 lines");
  });

  test("includes before commands", () => {
    const info: DryRunInfo = {
      frontmatter: {},
      prompt: "Test",
      harnessArgs: [],
      harnessName: "copilot",
      contextFiles: [],
      beforeCommands: ["git status", "cat README.md"],
      afterCommands: [],
      templateVars: {},
    };
    const output = formatDryRun(info);
    expect(output).toContain("BEFORE COMMANDS");
    expect(output).toContain("git status");
    expect(output).toContain("cat README.md");
  });

  test("includes after commands with stdin note", () => {
    const info: DryRunInfo = {
      frontmatter: {},
      prompt: "Test",
      harnessArgs: [],
      harnessName: "copilot",
      contextFiles: [],
      beforeCommands: [],
      afterCommands: ["pbcopy", "echo done"],
      templateVars: {},
    };
    const output = formatDryRun(info);
    expect(output).toContain("AFTER COMMANDS");
    expect(output).toContain("pbcopy");
    expect(output).toContain("receives copilot output via stdin");
  });

  test("includes harness command", () => {
    const info: DryRunInfo = {
      frontmatter: { model: "gpt-5" },
      prompt: "Test",
      harnessArgs: ["--model", "gpt-5", "-p"],
      harnessName: "copilot",
      contextFiles: [],
      beforeCommands: [],
      afterCommands: [],
      templateVars: {},
    };
    const output = formatDryRun(info);
    expect(output).toContain("COPILOT COMMAND");
    expect(output).toContain("copilot --model gpt-5 -p");
  });

  test("includes prerequisites", () => {
    const info: DryRunInfo = {
      frontmatter: {
        requires: { bin: ["docker", "kubectl"], env: ["API_KEY"] }
      },
      prompt: "Test",
      harnessArgs: [],
      harnessName: "copilot",
      contextFiles: [],
      beforeCommands: [],
      afterCommands: [],
      templateVars: {},
    };
    const output = formatDryRun(info);
    expect(output).toContain("PREREQUISITES");
    expect(output).toContain("docker");
    expect(output).toContain("kubectl");
    expect(output).toContain("API_KEY");
  });

  test("includes configuration summary", () => {
    const info: DryRunInfo = {
      frontmatter: {
        model: "gpt-5",
        extract: "json",
        cache: true,
        silent: true,
      },
      prompt: "Test",
      harnessArgs: [],
      harnessName: "copilot",
      contextFiles: [],
      beforeCommands: [],
      afterCommands: [],
      templateVars: {},
    };
    const output = formatDryRun(info);
    expect(output).toContain("CONFIGURATION");
    expect(output).toContain("Model: gpt-5");
    expect(output).toContain("Extract: json");
    expect(output).toContain("Cache: enabled");
    expect(output).toContain("Silent: true");
  });

  test("truncates long prompts", () => {
    const longPrompt = Array(50).fill("Line of content").join("\n");
    const info: DryRunInfo = {
      frontmatter: {},
      prompt: longPrompt,
      harnessArgs: [],
      harnessName: "copilot",
      contextFiles: [],
      beforeCommands: [],
      afterCommands: [],
      templateVars: {},
    };
    const output = formatDryRun(info);
    expect(output).toContain("more lines");
  });
});
