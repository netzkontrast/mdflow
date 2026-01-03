# Features Module Documentation

The `src/features/` directory contains self-contained modules that implement specific capabilities of the system.

## Imports (`src/features/imports/`)

Handles the `@file` and `!cmd` syntax.
-   **Recursive Expansion**: Supports nested imports.
-   **Globs**: Expands `@src/**/*.ts` into multiple files.
-   **Smart selection**: Can read specific line ranges or function blocks (future).

## Configuration (`src/features/config.ts`)

Manages the configuration hierarchy:
1.  **Defaults**: Hardcoded defaults.
2.  **Global Config**: `~/.mdflow/config.yaml`.
3.  **Command Defaults**: Config specific to a tool (e.g., `claude`).
4.  **Frontmatter**: Config in the agent file.
5.  **CLI Flags**: Runtime overrides.

## Remote Execution (`src/features/remote.ts`)

Enables running agents directly from URLs (e.g., `md https://example.com/agent.md`).
-   **Fetching**: Downloads the file to a temporary location.
-   **Caching**: Caches remote files to avoid repeated network requests.
-   **Cleanup**: Removes temporary files after execution.

## Trust System (`src/features/trust.ts`)

Implements a "Trust On First Use" (TOFU) security model for remote agents.
-   Prompts the user to trust a new domain.
-   Stores trusted domains in `~/.mdflow/known_hosts`.

## History (`src/features/history.ts`)

Tracks agent usage to improve the interactive file picker.
-   Stores run timestamps.
-   Calculates "frecency" (frequency + recency) scores to rank agents.

## Logging (`src/features/logger.ts`)

Structured JSON logging using `pino`.
-   Logs are stored in `~/.mdflow/logs/`.
-   Separate loggers for parsing, templates, and execution.

## Secrets (`src/features/secrets.ts`)

Utilities for handling sensitive data.
-   Masks sensitive arguments in logs and console output.
-   Integrates with `.env` loading.
