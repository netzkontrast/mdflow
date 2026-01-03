# Technical Documentation: Source Code

This document provides a detailed technical overview of the `mdflow` codebase, covering the architecture, core runtime, CLI, features, and utilities.

---

## 1. Overview (`src/`)

The codebase is organized into a modular architecture to ensure separation of concerns.

### Directory Structure
*   `src/index.ts`: Entry point.
*   `src/cli/`: Command-line interface logic.
*   `src/core/`: Core domain logic and runtime.
*   `src/features/`: Distinct capabilities (Config, History, Imports, etc.).
*   `src/utils/`: Shared utility functions.

### Data Flow
1.  **Entry Point (`src/index.ts`):** Initializes `ProcessManager` and runs `CliRunner`.
2.  **CLI Runner (`src/cli/runner.ts`):** Parses args, resolves agent file, instantiates `AgentRuntime`.
3.  **Agent Runtime (`src/core/runtime.ts`):** Executes the pipeline (Resolve -> Context -> Template -> Execute).

---

## 2. Core Runtime (`src/core/`)

The `AgentRuntime` class manages the execution pipeline:

### Phases
1.  **Resolution Phase (`resolve`):** Determines if source is local/remote and fetches if needed.
2.  **Context Phase (`buildContext`):** Parses frontmatter, resolves command, loads env vars, expands imports (`@file`).
3.  **Template Phase (`processTemplate`):** Substitutes LiquidJS variables (`{{ _var }}`) and processes CLI args.
4.  **Execution Phase (`execute`):** Constructs the shell command and spawns the subprocess.

### Execution
*   **`command.ts`:** Handles low-level process spawning (`Bun.spawn`).
*   **`process-manager.ts`:** Manages child process lifecycle and signal handling.
*   **`system-environment.ts`:** Abstraction for file system/process operations (Real vs. Test).

---

## 3. CLI (`src/cli/`)

### Argument Parsing (`cli.ts`)
*   **Pass-through:** Flags for the underlying tool (e.g., `--verbose`) are passed through.
*   **Internal Flags:** `mdflow` flags start with `--_` (e.g., `--_dry-run`).
*   **Ad-hoc:** `md.claude "prompt"` executes one-off commands.

### Components
*   **`runner.ts`:** Orchestrates the CLI flow (commands, interactive mode, execution).
*   **`ui/file-selector.ts`:** Interactive agent picker with preview.
*   **`create.ts`:** Wizard for creating agents.
*   **`explain.ts`:** Shows resolved configuration.

---

## 4. Features (`src/features/`)

*   **Imports (`imports/`):** Handles recursive expansion and globs (`@src/**/*.ts`).
*   **Config (`config.ts`):** Manages hierarchy (Defaults > Global > Command > Frontmatter > CLI).
*   **Remote (`remote.ts`):** Fetches and caches remote agents (URL execution).
*   **Trust (`trust.ts`):** TOFU (Trust On First Use) security model for remote agents.
*   **History (`history.ts`):** Tracks usage for "frecency" sorting in the file picker.
*   **Logger (`logger.ts`):** Structured JSON logging.

---

## 5. Utilities (`src/utils/`)

*   **`streams.ts`:** Node.js/Bun stream helpers.
*   **`markdown-renderer.ts`:** Renders markdown to terminal with highlighting.
*   **`fetch.ts`:** Wrapper for network requests.
*   **`binary-check.ts`:** Verifies existence of required binaries in `$PATH`.
*   **`test-utils.ts`:** Helpers for integration tests.
