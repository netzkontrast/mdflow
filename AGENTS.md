# mdflow Knowledge Base

## Overview
`mdflow` is a CLI tool that treats Markdown files as executable AI agents. It follows the Unix philosophy of "everything is a file" and pipeable streams. The core idea is that a Markdown file with frontmatter configuration and a prompt body *is* the command.

## Core Concepts
- **Executable Markdown**: Files named `task.model.md` are commands.
- **Frontmatter Configuration**: YAML frontmatter (`---`) maps to CLI flags.
- **Pipeline Architecture**:
  1. **Parse**: Scan for imports (`@file`, `!cmd`) and template vars.
  2. **Resolve**: Fetch content (files, URLs) and execute commands.
  3. **Inject**: Stitch content back into the prompt.
  4. **Execute**: Send the final prompt to the LLM (via adapters).
- **Template System**: LiquidJS is used for variables (`{{ _var }}`) and logic (`{% if %}`).
- **Adapters**: Pluggable interfaces for different LLM providers (Claude, OpenAI, etc.).

## Repository Structure
- `src/`: Source code (TypeScript).
  - `index.ts`: Library entry point.
  - `cli.ts`: CLI entry point (`bin/md`).
  - `imports.ts` / `imports-parser.ts`: Core logic for parsing and resolving imports.
  - `template.ts`: LiquidJS integration.
  - `adapters/`: LLM provider implementations.
  - `commands/`: Subcommands (like `create`, `explain`).
- `test/`: Tests (using `bun test`).
- `examples/`: Example agents.

## Development Patterns
- **Testing**: We use `bun test`. Run `bun test` to execute all tests.
- **Imports**: All IO operations (file reading, fetching) happen in the resolution phase (`src/imports.ts`). The parser (`src/imports-parser.ts`) is pure.
- **Security**:
  - We use a "Safe Parser" that ignores imports inside code blocks to prevent accidental execution of example code.
  - Binary files are detected and skipped/blocked.
  - Command execution has timeouts and output limits.

## Key Files for Navigation
- `src/imports-parser.ts`: Start here to understand how imports are detected.
- `src/imports.ts`: Start here to understand how imports are *processed* (IO).
- `src/template.ts`: Variable substitution logic.
- `src/adapters/`: How to add new AI models.

## Integration Goals (Superpowers)
We are currently integrating "Superpowers" (a set of skills and agents from `netzkontrast/superpowers`).
- **Skills**: Reusable instructions (e.g., TDD, Debugging) to be injected into prompts.
- **Agents**: Specialized workflows (e.g., Code Reviewer) to be executed by `mdflow`.
