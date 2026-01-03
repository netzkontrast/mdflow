# Source Code Overview

This directory contains the source code for the `mdflow` runtime. The codebase is organized into a modular architecture to ensure separation of concerns, testability, and extensibility.

## Directory Structure

```text
src/
├── index.ts           # Entry point
├── cli/               # Command-line interface logic
├── core/              # Core domain logic and runtime
├── features/          # Distinct capabilities (Config, History, Imports, etc.)
└── utils/             # Shared utility functions
```

## Data Flow

1.  **Entry Point (`src/index.ts`)**:
    -   Initializes the `ProcessManager` for signal handling.
    -   Creates a `CliRunner`.
    -   Invokes `runner.run(process.argv)`.

2.  **CLI Runner (`src/cli/runner.ts`)**:
    -   Parses arguments using `src/cli/cli.ts`.
    -   Handles subcommands (e.g., `create`, `setup`).
    -   Resolves the target agent file (local or remote).
    -   Instantiates the `AgentRuntime`.
    -   Executes the runtime pipeline.
    -   Displays the dashboard/context tree.

3.  **Agent Runtime (`src/core/runtime.ts`)**:
    -   **Resolution Phase**: Determines if the source is a local file or remote URL.
    -   **Context Phase**: Parses frontmatter, loads environment variables, and expands imports (`@file`).
    -   **Template Phase**: Substitutes LiquidJS variables (`{{ _var }}`) and processes CLI arguments.
    -   **Execution Phase**: Builds the final command arguments and spawns the subprocess.

## Key Concepts

-   **Agent**: An executable markdown file containing prompts and configuration.
-   **Skill**: A reusable markdown module imported into agents.
-   **Runtime**: The engine that parses, compiles, and executes agents.
-   **System Environment**: An abstraction layer for file system and process operations, facilitating testing.
