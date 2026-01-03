# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## The "Superpowers" Architecture

This repository follows the **Superpowers Architecture** for AI Agents.
- **`mdflow`** is the runtime engine (CLI tool).
- **`agents/`** contains executable `.md` files (The "Persona").
- **`skills/`** contains reusable `.md` instructions (The "Knowledge").

When creating or modifying agents, adhere to this structure.

### 1. Agent Structure (`agents/*.md`)

Agents MUST be executable. They utilize frontmatter for configuration.

```markdown
# agents/example.claude.md
---
model: sonnet                   # or opus, haiku
_interactive: true              # if it needs user chat
_inputs:                        # Defined inputs
  _topic:
    type: text
---
# Role Definition
You are a specialized assistant.

# Skill Imports
@../skills/formatting.md        # Relative import of skills

# Task
Discuss: {{ _topic }}
```

### 2. Skill Structure (`skills/*.md`)

Skills are pure markdown. DO NOT use frontmatter unless specifically needed for metadata. They are meant to be injected (imported).

```markdown
# skills/formatting.md

## Formatting Rules
1. Always use H2 for sections.
2. Use bullet points for lists.
```

---

## CLI & Development

### Commands

```bash
# Run an agent
md agents/task.claude.md

# Run tests
bun test

# Build
bun run bundle
```

### Key Modules

- `src/index.ts`: Entry point.
- `src/imports.ts`: Handles the `@path` expansion logic.
- `src/template.ts`: Handles `{{ var }}` substitution.

### Testing
- We use `bun test`.
- New features should be tested in `test/`.
- Integration tests can be simulated using `smoke-tests/`.
