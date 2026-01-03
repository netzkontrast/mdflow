# mdflow Knowledge Base & Agent Specifications

## 1. Overview: The "Superpowers" Architecture
This repository implements the "Superpowers" methodology using `mdflow`. The core philosophy is to decompose complex software engineering tasks into discrete, composable **Agents** that share a common library of **Skills**.

Instead of a monolithic "AI coding tool," we treat the development process as a pipeline of specialized roles (Agents) collaborating through standard interfaces (Markdown files).

## 2. Core Concepts

### 2.1 Agents (`agents/*.md`)
An Agent is an **Executable Markdown File**. It defines a specific "Persona" and a "Task".
- **Location**: `agents/` (or `examples/superpowers/agents/`)
- **Structure**:
  - **Frontmatter**: Configuration (`model`, `temperature`, `_inputs`).
  - **Imports**: Loads necessary **Skills**.
  - **Prompt**: The instruction set.

**Example:**
```markdown
# brainstorm.claude.md
---
model: claude-3-5-sonnet
_interactive: true
---
You are a Software Architect.
@../skills/brainstorming.md
```

### 2.2 Skills (`skills/*.md`)
A Skill is a **Reusable Instruction Module**. It contains best practices, formatting guides, or specific methodologies (e.g., TDD, Threat Modeling).
- **Location**: `skills/` (or `examples/superpowers/skills/`)
- **Structure**: Pure Markdown (headers, lists, examples). No frontmatter required.

**Example:**
```markdown
# Skill: Systematic Debugging
1. Isolate the reproduction case.
2. Formulate a hypothesis.
3. ...
```

### 2.3 The Workflow (The Loop)
The "Superpowers" loop consists of four phases:
1. **Brainstorm** (`agents/brainstorm.md`): Clarify requirements, output `DESIGN.md`.
2. **Plan** (`agents/plan.md`): Break design into tasks, output `PLAN.md` (JSON/List).
3. **Implement** (`agents/implement.md`): Execute tasks (often in parallel/fan-out).
4. **Review** (`agents/review.md`): Critique changes against `DESIGN.md`.

## 3. Core Agent Specifications

### 3.1 The Architect (`agents/architect.claude.md`)
- **Role**: High-level system design and requirement gathering.
- **Input**: User goal (interactive).
- **Output**: `DESIGN.md` (System Architecture, Tech Stack).
- **Required Skills**: `brainstorming.md`, `system-design.md`.

### 3.2 The Planner (`agents/planner.claude.md`)
- **Role**: Project Management. Converts design into executable steps.
- **Input**: `DESIGN.md`.
- **Output**: `PLAN.md` (Task list, often minified JSON for automation).
- **Required Skills**: `writing-plans.md`, `json-schema.md`.

### 3.3 The Engineer (`agents/engineer.claude.md`)
- **Role**: Implementation. Writes code, tests, and config.
- **Input**: A single Task from `PLAN.md`.
- **Output**: File changes.
- **Required Skills**: `tdd.md`, `clean-code.md`, `language-specific/*.md`.
- **Note**: This agent is often run in "Fan-Out" mode (multiple instances in parallel).

### 3.4 The Reviewer (`agents/reviewer.claude.md`)
- **Role**: QA and Security.
- **Input**: `git diff` or specific files.
- **Output**: Critique or "LGTM".
- **Required Skills**: `security-audit.md`, `code-style.md`.

## 4. Development Guidelines

### 4.1 Writing Skills
- **Keep it Atomic**: A skill should do one thing well (e.g., "Write Python Docstrings").
- **Use Examples**: LLMs learn best from "Few-Shot" examples (Good vs. Bad).
- **Version Control**: Skills are code. Commit them.

### 4.2 Writing Agents
- **Inherit Config**: Use `mdflow` defaults where possible.
- **Use Inputs**: Use `_inputs` frontmatter for interactive agents.
- **State via Files**: Agents are stateless. Read from files (`@PLAN.md`), write to files.

### 4.3 Testing Agents (The Shim Strategy)
To verify agent behavior without non-deterministic LLM calls:
1. Run with `--_dry-run`.
2. Capture the **Final Prompt**.
3. Diff against a "Golden Prompt" to ensure skills are imported correctly.
# mdflow Knowledge Base & Skills Library

## Overview
`mdflow` is a CLI tool that treats Markdown files as executable AI agents. It follows the Unix philosophy of "everything is a file" and pipeable streams.

For architectural details, see `docs/reference/ontology.md` and `docs/reference/Schema.md`.

## Superpowers Skills Library
The following skills are available for import. Use them via `@import skills/<category>/<skill-name>/SKILL.md`.

### Process & Workflow
*   **`brainstorming`** (`skills/collaboration/brainstorming/SKILL.md`)
    *   *Trigger:* Use before creative work to explore requirements and design.
    *   *Action:* Interactive Q&A to produce a Design Document (`DESIGN.md`).
*   **`writing-plans`** (`skills/collaboration/writing-plans/SKILL.md`)
    *   *Trigger:* Use after design is approved.
    *   *Action:* Converts design into a bite-sized Implementation Plan (`PLAN.md`).
*   **`executing-plans`** (`skills/collaboration/executing-plans/SKILL.md`)
    *   *Trigger:* Use to execute a plan in batches.
    *   *Action:* Sequential execution with checkpoints.
*   **`subagent-driven-development`** (`skills/collaboration/subagent-driven-development/SKILL.md`)
    *   *Trigger:* Use for complex plans requiring specialized workers.
    *   *Action:* Dispatches "Implementer", "Spec Reviewer", and "Code Quality Reviewer" sub-agents for each task.
*   **`dispatching-parallel-agents`** (`skills/collaboration/dispatching-parallel-agents/SKILL.md`)
    *   *Trigger:* Use for independent tasks (e.g., fixing 3 unrelated bugs).
    *   *Action:* Concurrent execution.
*   **`using-git-worktrees`** (`skills/collaboration/using-git-worktrees/SKILL.md`)
    *   *Trigger:* Use when starting feature work that needs isolation.
    *   *Action:* Creates isolated workspaces.
*   **`finishing-a-development-branch`** (`skills/collaboration/finishing-a-development-branch/SKILL.md`)
    *   *Trigger:* Use when implementation is complete.
    *   *Action:* Guides completion of development work (merge/PR/cleanup).

### Engineering Practices
*   **`test-driven-development`** (`skills/testing/test-driven-development/SKILL.md`)
    *   *Trigger:* Before writing implementation code.
    *   *Action:* Enforces Red-Green-Refactor cycle. "No code without a failing test."
*   **`systematic-debugging`** (`skills/debugging/systematic-debugging/SKILL.md`)
    *   *Trigger:* When encountering bugs or test failures.
    *   *Action:* Enforces 4-phase process: Investigation -> Pattern -> Hypothesis -> Implementation.
*   **`verification-before-completion`** (`skills/debugging/verification-before-completion/SKILL.md`)
    *   *Trigger:* Before claiming a task is done.
    *   *Action:* Requires running a fresh verification command.

### Review & Quality
*   **`requesting-code-review`** (`skills/collaboration/requesting-code-review/SKILL.md`)
    *   *Trigger:* Before merging or finishing a task.
    *   *Action:* Dispatches a `code-reviewer` agent.
*   **`receiving-code-review`** (`skills/collaboration/receiving-code-review/SKILL.md`)
    *   *Trigger:* When processing feedback.
    *   *Action:* Evaluation framework for feedback (verify before implementing).

### Meta Skills
*   **`writing-skills`** (`skills/meta/writing-skills/SKILL.md`)
    *   *Trigger:* When creating or editing skills.
    *   *Action:* TDD for documentation.
*   **`using-superpowers`** (`skills/using-skills/SKILL.md`)
    *   *Trigger:* When starting conversations.
    *   *Action:* Establishes rules for skill usage.

### Agents
*   **`code-reviewer`** (`agents/code-reviewer.md`)
    *   *Role:* Senior Code Reviewer. Checks plan alignment, quality, and architecture.

## Commands
Commands are executable markdown files located in `/commands/` that orchestrate workflows.
*   **`brainstorm`** (`commands/brainstorm.md`): Invokes the brainstorming skill.
*   **`write-plan`** (`commands/write-plan.md`): Invokes the writing-plans skill.
*   **`execute-plan`** (`commands/execute-plan.md`): Invokes the executing-plans skill.

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
- `commands/`: Executable commands for workflows.
- `docs/reference/ontology.md`: Entity definitions.
- `docs/reference/Schema.md`: Configuration reference.
