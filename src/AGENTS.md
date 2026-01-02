# Source Code Guide

## Directory Structure
- `adapters/`: Logic for communicating with specific LLM CLIs or APIs.
  - `claude.ts`, `openai.ts`, etc.
- `commands/`: Implementation of CLI subcommands (e.g., `md create`).
- `imports-parser.ts`: **Pure** logic for finding `@import` and `!command` patterns.
- `imports.ts`: **Impure** logic for resolving imports (FS access, Network, Shell).
- `template.ts`: LiquidJS wrapper for `{{ variables }}`.
- `context.ts`: Dependency injection container (Logger, Config, Env).
- `process-manager.ts`: Handles child processes (for inline commands).

## Common Patterns

### Import Pipeline
The `expandImports` function in `src/imports.ts` is the heart of the system.
1. `parseImportsSafe(content)` -> `ImportAction[]`
2. `Promise.all(actions.map(resolve))` -> `ResolvedImport[]`
3. `injectResolvedImports(content, resolved)` -> `string`

### Template Variables
Variables starting with `_` (e.g., `_target`) are treated as template variables.
They can be passed via CLI flags (`--_target value`) or defined in frontmatter.

### Error Handling
- Use specific error classes where possible (e.g., `FileSizeLimitError`).
- IO errors should generally be caught and wrapped with context.

## Testing
- Tests are co-located with source files (e.g., `imports.ts` -> `imports.test.ts`).
- We use `bun test`.
- Use `createTestRunContext()` for isolating tests that need config/env.
