# mdflow Knowledge Base & Skills Library

## Overview
`mdflow` is a CLI tool that treats Markdown files as executable AI agents. It follows the Unix philosophy of "everything is a file" and pipeable streams.

For architectural details, see `docs/reference/ontology.md` and `docs/reference/schema.md`.

## Basic Rules for Repo Workflows

All agents and contributors must adhere to the following workflows to ensure quality and consistency.

### 1. The Agentic Workflow
All significant tasks should follow this four-phase lifecycle:

1.  **Brainstorming**: Understand the "Why" and "What". Explore requirements.
2.  **Planning**: Create a detailed plan (using `set_plan` if you are an agent).
3.  **Implementation**: Execute the plan iteratively.
4.  **Review**: Verify the work against the requirements.

### 2. Deep Planning & Verification
*   **Deep Planning**: Before writing code, use the `set_plan` tool. Think deeply about the requirements. Ask clarifying questions (`request_user_input`) if anything is ambiguous.
*   **Verification**: **Always** verify your changes. After writing a file, read it back (`read_file`) to ensure it looks correct. After running a command, check the output. **Never** mark a task as complete without verification.

### 3. Documentation First
*   If you change a feature, update the documentation in `docs/` immediately.
*   The `AGENTS.md` file (this file) serves as the source of truth for agent behavior. Keep it updated.

### 4. Subagent Driven Development (SDD)
*   For complex tasks, use the "Fan-Out" architecture.
*   Break tasks down into sub-tasks that can be handled by specialized agents or simpler steps.

---

## Superpowers Skills Library
The following skills are available for import. Use them via `@import skills/<category>/<skill-name>`.

### Process & Workflow
*   **`brainstorming`** (`skills/brainstorming/SKILL.md`)
    *   *Trigger:* Use before creative work to explore requirements and design.
    *   *Action:* Interactive Q&A to produce a Design Document (`DESIGN.md`).
*   **`writing-plans`** (`skills/writing-plans/SKILL.md`)
    *   *Trigger:* Use after design is approved.
    *   *Action:* Converts design into a bite-sized Implementation Plan (`PLAN.md`).
*   **`executing-plans`** (`skills/executing-plans/SKILL.md`)
    *   *Trigger:* Use to execute a plan in batches.
    *   *Action:* Sequential execution with checkpoints.
*   **`subagent-driven-development`** (`skills/subagent-driven-development/SKILL.md`)
    *   *Trigger:* Use for complex plans requiring specialized workers.
    *   *Action:* Dispatches "Implementer", "Spec Reviewer", and "Code Quality Reviewer" sub-agents for each task.
*   **`dispatching-parallel-agents`** (`skills/dispatching-parallel-agents/SKILL.md`)
    *   *Trigger:* Use for independent tasks (e.g., fixing 3 unrelated bugs).
    *   *Action:* Concurrent execution.

### Engineering Practices
*   **`test-driven-development`** (`skills/test-driven-development/SKILL.md`)
    *   *Trigger:* Before writing implementation code.
    *   *Action:* Enforces Red-Green-Refactor cycle. "No code without a failing test."
*   **`systematic-debugging`** (`skills/systematic-debugging/SKILL.md`)
    *   *Trigger:* When encountering bugs or test failures.
    *   *Action:* Enforces 4-phase process: Investigation -> Pattern -> Hypothesis -> Implementation.
*   **`verification-before-completion`** (`skills/verification-before-completion/SKILL.md`)
    *   *Trigger:* Before claiming a task is done.
    *   *Action:* Requires running a fresh verification command.

### Review & Quality
*   **`requesting-code-review`** (`skills/requesting-code-review/SKILL.md`)
    *   *Trigger:* Before merging or finishing a task.
    *   *Action:* Dispatches a `code-reviewer` agent.
*   **`receiving-code-review`** (`skills/receiving-code-review/SKILL.md`)
    *   *Trigger:* When processing feedback.
    *   *Action:* Evaluation framework for feedback (verify before implementing).

### Agents
*   **`code-reviewer`** (`agents/code-reviewer.md`)
    *   *Role:* Senior Code Reviewer. Checks plan alignment, quality, and architecture.

## Core Concepts
- **Executable Markdown**: Files named `task.model.md` are commands.
- **Frontmatter Configuration**: YAML frontmatter (`---`) maps to CLI flags.
- **Pipeline Architecture**:
  1. **Parse**: Scan for imports (`@file`, `!cmd`) and template vars.
  2. **Resolve**: Fetch content (files, URLs) and execute commands.
  3. **Inject**: Stitch content back into the prompt.
  4. **Execute**: Send the final prompt to the LLM (via adapters).
- **Template System**: LiquidJS is used for variables (`{{ _var }}`) and logic (`{% if %}`).

## Repository Structure
- `src/`: Source code (TypeScript).
- `skills/`: Passive instruction sets (Superpowers).
- `agents/`: Executable agent definitions.
- `docs/`: User and developer documentation.
