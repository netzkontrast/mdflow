# CLI Module Documentation

The `src/cli/` directory handles the user interface, argument parsing, and command dispatching.

## Entry Point

The application entry point is `src/index.ts`, which sets up the `ProcessManager` and hands off control to `CliRunner`.

## Argument Parsing (`src/cli/cli.ts`)

`mdflow` has a unique argument parsing strategy:
-   **Pass-through**: If a file is specified (e.g., `md task.md --verbose`), flags like `--verbose` are passed *to the underlying tool*, not consumed by `mdflow`.
-   **Internal Flags**: Flags starting with `--_` (e.g., `--_dry-run`, `--_command`) are consumed by `mdflow`.
-   **Ad-hoc Commands**: `md.claude "prompt"` allows executing one-off commands without a file.

The `parseCliArgs` function distinguishes between `mdflow` commands (`create`, `setup`) and agent execution.

## The Runner (`src/cli/runner.ts`)

`CliRunner` orchestrates the CLI experience:
1.  **Command Handling**: Dispatches to handlers for `create`, `setup`, `logs`, etc.
2.  **Interactive Mode**: If no file is provided, it invokes the interactive file selector.
3.  **Ad-hoc Execution**: Handles `md.COMMAND` syntax by creating temporary agent contexts.
4.  **Runtime Invocation**: Instantiates `AgentRuntime` to execute the selected agent.
5.  **UI Feedback**: Manages spinners (using `ora`) and prints the "Context Dashboard" (summary of files/tokens) before execution.

## Interactive UI (`src/cli/ui/`)

-   **`file-selector.ts`**: Implements the interactive agent picker using `ink` or raw terminal escape codes. It supports searching and previewing agent descriptions.
-   **`edit-prompt.ts`**: Logic for opening the resolved prompt in the user's `$EDITOR` before execution (`--_edit`).

## Subcommands

-   **`src/cli/create.ts`**: Interactive wizard for creating new agent files.
-   **`src/cli/setup.ts`**: configuring shell aliases and paths.
-   **`src/cli/explain.ts`**: Logic for the `explain` command, which shows the resolved configuration.
