# Core Module Documentation

The `src/core/` directory contains the fundamental business logic of `mdflow`, specifically the runtime engine that interprets and executes markdown agents.

## `AgentRuntime` (`src/core/runtime.ts`)

The `AgentRuntime` class is the heart of the system. It refactors the execution process into a clean pipeline of distinct phases:

### 1. Resolution Phase (`resolve`)
-   **Input**: Source string (file path or URL).
-   **Responsibility**:
    -   Detects if the source is a remote URL.
    -   Fetches remote files if necessary (using `src/features/remote`).
    -   Validates file existence.
-   **Output**: `ResolvedSource` object containing content, path, and type.

### 2. Context Phase (`buildContext`)
-   **Input**: `ResolvedSource`.
-   **Responsibility**:
    -   Parses YAML frontmatter (`src/core/agent/parse`).
    -   Resolves the execution command (e.g., `claude`, `python`) based on configuration or filename.
    -   Loads environment variables (`src/features/env`).
    -   Expands imports and globs (`src/features/imports`).
    -   Executes pre-hooks.
-   **Output**: `AgentContext`.

### 3. Template Phase (`processTemplate`)
-   **Input**: `AgentContext`.
-   **Responsibility**:
    -   Injects template variables (`src/core/agent/template`).
    -   Handles interactive inputs if variables are missing.
    -   Builds CLI arguments from frontmatter configuration.
    -   Maps positional arguments.
-   **Output**: `ProcessedTemplate`.

### 4. Execution Phase (`execute`)
-   **Input**: `AgentContext`, `ProcessedTemplate`.
-   **Responsibility**:
    -   Constructs the final shell command.
    -   Spawns the child process (`src/core/execution/command`).
    -   Streams input/output.
-   **Output**: `RunResult` (exit code, output).

## Execution Logic (`src/core/execution/`)

-   **`command.ts`**: Handles the low-level spawning of processes using `Bun.spawn`. It manages `stdio` piping and argument construction.
-   **`process-manager.ts`**: A singleton that manages the lifecycle of child processes, ensuring proper cleanup on signals (SIGINT, SIGTERM) and restoring terminal state.

## System Abstraction (`src/core/system-environment.ts`)

To support robust testing, `mdflow` uses a `SystemEnvironment` interface.
-   **`BunSystemEnvironment`**: The real implementation using Bun's runtime APIs.
-   **`TestSystemEnvironment`**: (In tests) An in-memory implementation for file system and process mocking.

## Types (`src/core/types.ts`)

Defines the core data structures:
-   `AgentFrontmatter`: Shape of the YAML configuration.
-   `ExecutionPlan`: Structured representation of what *would* run (used for dry-runs).
-   `IOStreams`: Abstraction for stdin/stdout/stderr.
