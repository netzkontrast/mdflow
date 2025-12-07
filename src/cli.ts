import type { AgentFrontmatter } from "./types";
import type { TemplateVars } from "./template";

export interface CliArgs {
  filePath: string;
  overrides: Partial<AgentFrontmatter>;
  appendText: string;
  templateVars: TemplateVars;
  noCache: boolean;
  dryRun: boolean;
  verbose: boolean;
  logs: boolean;
  command?: string;
  passthroughArgs: string[];
  check: boolean;
  json: boolean;
  setup: boolean;
}

/** ma's own flags - everything else passes through to the command */
const MA_FLAGS = new Set([
  "--command", "-c",
  "--help", "-h",
  "--dry-run",
  "--no-cache",
  "--verbose",
  "--logs",
  "--check",
  "--json",
  "--setup",
]);

/**
 * Parse CLI arguments
 * ma only handles its own flags - all unknown flags pass through to the command
 */
export function parseCliArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  let filePath = "";
  const overrides: Partial<AgentFrontmatter> = {};
  const positionalArgs: string[] = [];
  const passthroughArgs: string[] = [];
  let noCache = false;
  let dryRun = false;
  let verbose = false;
  let command: string | undefined;
  let check = false;
  let json = false;
  let logs = false;
  let setup = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    // Non-flag argument
    if (!arg.startsWith("-")) {
      if (!filePath) {
        filePath = arg;
      } else {
        positionalArgs.push(arg);
      }
      continue;
    }

    // Check if it's an ma flag
    if (!MA_FLAGS.has(arg)) {
      // Unknown flag - pass through to command
      passthroughArgs.push(arg);
      // If next arg exists and isn't a flag, it's the value
      if (nextArg && !nextArg.startsWith("-")) {
        passthroughArgs.push(nextArg);
        i++;
      }
      continue;
    }

    // Handle ma's own flags
    switch (arg) {
      case "--command":
      case "-c":
        if (nextArg) {
          command = nextArg;
          i++;
        }
        break;

      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
        break;

      case "--no-cache":
        noCache = true;
        break;

      case "--dry-run":
        dryRun = true;
        break;

      case "--verbose":
        verbose = true;
        break;

      case "--logs":
        logs = true;
        break;

      case "--check":
        check = true;
        break;

      case "--json":
        json = true;
        break;

      case "--setup":
        setup = true;
        break;
    }
  }

  // Parse template variables from body content (not from CLI flags anymore)
  const templateVars: TemplateVars = {};

  return {
    filePath,
    overrides,
    appendText: positionalArgs.join(" "),
    templateVars,
    noCache,
    dryRun,
    verbose,
    logs,
    command,
    passthroughArgs,
    check,
    json,
    setup,
  };
}

/**
 * Merge frontmatter with CLI overrides (CLI wins)
 */
export function mergeFrontmatter(
  frontmatter: AgentFrontmatter,
  overrides: Partial<AgentFrontmatter>
): AgentFrontmatter {
  return { ...frontmatter, ...overrides };
}

function printHelp() {
  console.log(`
Usage: ma <file.md> [text] [options] [any-flags-for-command]
       ma --setup

Arguments:
  file.md                 Markdown file to execute
  text                    Additional text appended to the prompt body

ma Options:
  --command, -c <cmd>     Command to execute (e.g., claude, codex, gemini)
  --no-cache              Skip cache and force fresh execution
  --dry-run               Show what would be executed without running
  --check                 Validate frontmatter without executing
  --json                  Output validation results as JSON (with --check)
  --verbose               Show debug info
  --logs                  Show log directory (~/.markdown-agent/logs/)
  --setup                 Configure shell to run .md files directly
  --help, -h              Show this help

All other flags are passed through to the command automatically.

Command Resolution (in priority order):
  1. --command flag
  2. command: in frontmatter
  3. Inferred from filename (e.g., task.claude.md → claude)

Frontmatter:
  All frontmatter keys are passed as CLI flags to the command.
  - Strings: --key value
  - Booleans: --key (true) or omitted (false)
  - Arrays: --key val1 --key val2

Examples:
  ma task.claude.md "focus on error handling"
  ma task.claude.md -p "print mode prompt"
  ma task.md --command claude --model opus
  ma commit.gemini.md --verbose
`);
}
