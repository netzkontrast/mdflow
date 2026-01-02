# mdflow Core Architecture & Superfeatures Integration

This document outlines the architectural design of `mdflow` following the refactoring to support "Superfeatures" (Agentic Workflows) and a modular core.

## 1. Core Architecture

The `src` directory has been reorganized into logical modules to support scalability and maintainability.

### Directory Structure

*   **`src/core/`**: The heart of the system. Contains domain logic and abstractions.
    *   `agent/`: Parsing, templating, tokenization, and limits logic for Markdown Agents.
    *   `execution/`: Command execution, process management, and concurrency primitives.
    *   `adapters/`: Tool adapters (Claude, Gemini, etc.) that bridge mdflow with specific CLI tools.
    *   `types.ts`: Core type definitions.
    *   `errors.ts`: Centralized error handling.
    *   `system-environment.ts`: Dependency injection for filesystem/system operations.

*   **`src/cli/`**: The user interface and entry point.
    *   `cli.ts`, `runner.ts`: Main CLI orchestration and lifecycle.
    *   `ui/`: User interaction components (spinner, menus, file selector).
    *   `create.ts`, `setup.ts`, `explain.ts`: Subcommand implementations.

*   **`src/features/`**: Cross-cutting concerns and specific capabilities.
    *   `imports/`: The **Import Pipeline** engine (File, URL, Glob, Symbol resolution).
    *   `history.ts`: Frecency algorithm and variable persistence.
    *   `trust.ts`: TOFU (Trust On First Use) security model for remote agents.
    *   `secrets.ts`: Sensitive data redaction.
    *   `dashboard.ts`: Context visualization.
    *   `forms.ts`: Interactive form input handling.

*   **`src/utils/`**: Shared utilities.
    *   `fetch.ts`, `stream.ts`, `markdown-renderer.ts`.

## 2. Superfeatures Integration

The "Superfeatures" refer to the capabilities enabling **Agentic Workflows** (Brainstorming -> Planning -> Implementation -> Review). This is achieved through the **mdflow Import Pipeline** and **Process Fan-Out**.

### The Import Pipeline (`src/features/imports`)

The import pipeline is the mechanism that enables "Skills". A Skill is simply a Markdown file containing instructions/prompts that can be imported into an Agent.

*   **Mechanism**:
    1.  **Parse**: `imports/parser.ts` identifies imports (`@file`, `@url`, `@glob`).
    2.  **Resolve**: `imports/resolver.ts` fetches content (supporting parallel resolution via `Semaphore`).
    3.  **Inject**: `imports/injector.ts` stitches content into the prompt.

*   **Capabilities**:
    *   **Partial Imports**: `@./skills/tdd.md` (Modular skills).
    *   **Symbol Extraction**: `@./code.ts#InterfaceName` (Precise context).
    *   **Line Ranges**: `@./legacy.ts:10-50` (Focused context).
    *   **Globs**: `@./src/**/*.ts` (Broad context with token limits).

### Process Fan-Out (`src/core/execution`)

"Subagent Driven Development" (SDD) relies on executing multiple agents in parallel.

*   **Mechanism**:
    *   `ProcessManager` (`src/core/execution/process-manager.ts`) handles the lifecycle of child processes, ensuring clean shutdown and signal propagation.
    *   `Concurrency` (`src/core/execution/concurrency.ts`) provides synchronization primitives.
    *   **Usage**: Agents can use the shell (via `!` syntax or `subagent` tools) to spawn `mdflow` instances.
    *   **Example**: `ls files/*.ts | xargs -P 4 -I {} mdflow fix.md --file {}`

### Agentic Workflow Support

The core supports the "Superpowers" loop defined in `Konzept.md`:

1.  **Brainstorming**: Interactive agents (`_interactive: true`) using `src/features/forms.ts` to collect user intent.
2.  **Planning**: Agents using `src/features/imports` to load "Planning Skills" and output structured plans.
3.  **Implementation**: Fan-out execution of "Implementer Agents" consuming the plan.
4.  **Review**: "Reviewer Agents" using `!git diff` (via Command execution) to audit changes.

## 3. Usage for Developers

### Creating a New Skill
Create a markdown file in your skills directory:
```markdown
# My Skill
Always write code with comments.
```
Import it in your agent:
```markdown
# My Agent
@./skills/my-skill.md
```

### Creating a New Agent
Create a `.md` file in `.mdflow/` or `examples/`:
```markdown
---
model: claude-3-5-sonnet
_inputs:
  topic: "What to discuss?"
---
# Discussing {{ topic }}
@./skills/polite-conversation.md
```

## 4. Contributing
*   Run tests: `bun test`
*   Build: `bun run build` (if applicable)
*   Lint: `bun run lint`
