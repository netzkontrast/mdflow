# Meta: Analysis & Refactoring

This document combines the analysis of gaps between `superpowers` and `mdflow`, and the refactoring strategy to bridge them.

---

## Part 1: Gap Analysis

This section analyzes the gap between the legacy `netzkontrast/superpowers` codebase and the target `mdflow` architecture.

### 1.1 Core Architecture Mismatch

| Feature | Superpowers (Legacy) | mdflow (Target) | Gap / Action |
| :--- | :--- | :--- | :--- |
| **Execution Model** | Stateful "Agent Connect" or Platform Plugin | Stateless CLI (`mdflow`) pipeline | **Gap**: Replicate state using file-based context or shell scripts. |
| **Skill Discovery** | Runtime scanning of `skills/` dir | Explicit imports (`@file`) | **Action**: Robust import resolver or explicit paths. |
| **Subagents** | `Task` tool invokes sub-agent | "Fan-out" via shell piping | **Gap**: Need `mdflow` adapter/script for "dispatching" tasks. |
| **Tooling** | Assumes `TodoWrite` | Has `bash`, `read_file` | **Action**: Map `TodoWrite` to file-based todo list management. |

### 1.2 Feature Analysis

*   **Skills:** Most skills (Brainstorming, TDD, Debugging) are content-heavy and port easily as imports.
*   **Workflows:** Complex workflows like `subagent-driven-development` require shell orchestration or recursive `mdflow` calls, as they rely on loops.
*   **Platform Logic:** `mdflow` has its own logic (`src/imports-parser.ts`) which needs to verify compatibility with Superpowers metadata.

### 1.3 Specific Gaps

1.  **TodoWrite Tool:** Replaced by standard file editing (e.g., appending to `PLAN.md`).
2.  **Task Dispatch:** Needs a "Dispatcher" agent/script to read plans and call `mdflow` per item.
3.  **Bootstrap:** Ensure skills live in `examples/superpowers/skills` or `skills/` for easy import.

---

## Part 2: Refactoring & Integration Strategy

### 2.1 Goal
Integrate `netzkontrast/superpowers` into `mdflow` to enhance it with robust engineering skills (TDD, Debugging) and specialized agents.

### 2.2 Integration Strategy (The "Schema")

#### The Skill Schema
A Skill in `mdflow` is a Markdown file designed for **Import**.
*   **Location:** `skills/` (e.g., `skills/tdd.md`).
*   **Format:** Pure Markdown.
*   **Usage:** `@./skills/test-driven-development.md`

#### The Agent Schema
An Agent in `mdflow` is a Markdown file designed for **Execution**.
*   **Location:** `agents/`.
*   **Format:** YAML Frontmatter + Body + Imports.

### 2.3 Core Enhancements
*   **Alias Imports:** Allow mapping `@tdd` to `~/.mdflow/skills/tdd.md` (Future).
*   **Context Management:** Verify handling of large skill imports.
*   **Workflow Chaining:** Create "Workflow Agents" that chain other agents.

### 2.4 Vision: The "Ultrathink" Synthesis
`superpowers` provides the **Software Engineering Wisdom**.
`mdflow` provides the **Execution Runtime**.

By combining them, we create a tool that doesn't just "generate code" but "generates code *correctly*" by enforcing processes like TDD and Review.

**Implementation Plan:**
1.  **Port Skills:** Copy content to `skills/*.md`.
2.  **Port Agents:** Copy content to `agents/*.md` and update imports.
3.  **Verify:** Run complex tasks using ported skills.
