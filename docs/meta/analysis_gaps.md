# Analysis: Superpowers vs. mdflow Gaps

This document analyzes the gap between the legacy `netzkontrast/superpowers` codebase (ingested via `superpowers.md`) and the target `mdflow` architecture.

## 1. Core Architecture Mismatch

| Feature | Superpowers (Legacy) | mdflow (Target) | Gap / Action |
| :--- | :--- | :--- | :--- |
| **Execution Model** | Stateful "Agent Connect" or Platform Plugin (Codex/OpenCode/Claude) | Stateless CLI (`mdflow`) pipeline | **Gap**: `mdflow` needs to replicate the "Bootstrap" and "Session State" behavior using file-based context or shell scripts. |
| **Skill Discovery** | Runtime scanning of `skills/` dir, `find_skills` tool | Explicit imports (`@file`) or `imports-resolver` | **Action**: `mdflow` needs a robust import resolver that mimics `skills-core.js` logic (finding skills in specific paths). |
| **Subagents** | `Task` tool invokes sub-agent (managed by host) | "Fan-out" via shell piping / recursive `mdflow` calls | **Gap**: The `subagent-driven-development` skill relies on a `Task` tool. We need to create an `mdflow` adapter or script that handles "dispatching" tasks. |
| **Tooling** | Assumes `TodoWrite`, `Read`, `Bash` | Has `bash`, `read_file` (implied). Missing `TodoWrite`. | **Action**: Map `TodoWrite` to a file-based todo list manager (e.g., appending to `PLAN.md` or `TODO.md`). |

## 2. Feature Analysis (from `superpowers.md`)

### Skills
The following skills are present and need to be ported to `mdflow` compatible formats (likely just ensuring they work as imports):
*   `brainstorming`: Interactive Q&A. `mdflow` supports `_inputs` which matches this well.
*   `writing-plans`: Creates `docs/plans/*.md`. `mdflow` can do this via `stdout` or file write tools.
*   `executing-plans` / `subagent-driven-development`: **Critical Gap.** These are complex workflows involving loops and sub-agents.
    *   *Requirement:* `mdflow` needs a way to loop or recurse based on a plan file.
*   `systematic-debugging`: A purely instructional skill. Easy port.
*   `test-driven-development`: Instructional. Easy port.
*   `requesting-code-review` / `receiving-code-review`: Relies on `code-reviewer` agent.

### Agents
*   `code-reviewer`: A specialized prompt. Needs to be an `.md` agent file (e.g., `agents/code-reviewer.claude.md`).

### Platform Logic
*   `skills-core.js`: Contains logic for frontmatter extraction and skill resolution. `mdflow` has similar logic in `src/imports-parser.ts` and `src/imports.ts`. We should verify `mdflow` handles the `name` and `description` frontmatter from `superpowers` skills correctly (or map them to `mdflow` schema).

## 3. Specific Gaps to Address

1.  **TodoWrite Tool:** Superpowers heavily uses `TodoWrite` for tracking state. `mdflow` is stateless.
    *   *Solution:* Create a standard `tools/todo.sh` or use `mdflow`'s built-in file editing to manage a `TODO.md`.
2.  **Task Dispatch:** The `Task` tool is the engine of SDD.
    *   *Solution:* We need a "Dispatcher" agent or script that reads a plan and calls `mdflow` for each item.
3.  **Bootstrap:** Users "install" superpowers.
    *   *Solution:* `mdflow` already has an `examples/` dir. We should ensure `superpowers` skills live in `examples/superpowers/skills` and are easily importable.

## 4. Ontology Mapping

*   **Superpower Skill** -> `mdflow` **Import** (`@skills/name`)
*   **Superpower Agent** -> `mdflow` **Executable Agent** (`agents/name.model.md`)
*   **Superpower Bootstrap** -> `mdflow` **Config/Setup** (`.mdflow/config` or documentation)
