# mdflow Knowledge Base & Skills Library

## 1. Overview: The "Superpowers" Architecture
This repository implements the "Superpowers" methodology using `mdflow`. The core philosophy is to decompose complex software engineering tasks into discrete, composable **Agents** that share a common library of **Skills**.

Instead of a monolithic "AI coding tool," we treat the development process as a pipeline of specialized roles (Agents) collaborating through standard interfaces (Markdown files).

For architectural details, see `docs/reference.md` and `docs/architecture.md`.

## 2. Basic Rules for Repo Workflows

All agents and contributors must adhere to the following workflows to ensure quality and consistency.

### 2.1 The Agentic Workflow
All significant tasks should follow this four-phase lifecycle:

1.  **Brainstorming**: Understand the "Why" and "What". Explore requirements.
2.  **Planning**: Create a detailed plan (using `set_plan` if you are an agent).
3.  **Implementation**: Execute the plan iteratively.
4.  **Review**: Verify the work against the requirements.

### 2.2 Deep Planning & Verification
*   **Deep Planning**: Before writing code, use the `set_plan` tool. Think deeply about the requirements. Ask clarifying questions (`request_user_input`) if anything is ambiguous.
*   **Verification**: **Always** verify your changes. After writing a file, read it back (`read_file`) to ensure it looks correct. After running a command, check the output. **Never** mark a task as complete without verification.

### 2.3 Documentation First
*   If you change a feature, update the documentation in `docs/` immediately.
*   The `AGENTS.md` file (this file) serves as the source of truth for agent behavior. Keep it updated.

### 2.4 Subagent Driven Development (SDD)
*   For complex tasks, use the "Fan-Out" architecture.
*   Break tasks down into sub-tasks that can be handled by specialized agents or simpler steps.

## 3. Core Concepts

### 3.1 Agents (`agents/*.md`)
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
@../skills/collaboration/brainstorming/SKILL.md
```

### 3.2 Skills (`skills/*.md`)
A Skill is a **Reusable Instruction Module**. It contains best practices, formatting guides, or specific methodologies (e.g., TDD, Threat Modeling).
- **Location**: `skills/` (or `examples/superpowers/skills/`)
- **Structure**: Pure Markdown (headers, lists, examples). No frontmatter required.

### 3.3 The Workflow (The Loop)
The "Superpowers" loop consists of four phases:
1. **Brainstorm** (`commands/brainstorm.md`): Clarify requirements, output `DESIGN.md`.
2. **Plan** (`commands/write-plan.md`): Break design into tasks, output `PLAN.md` (JSON/List).
3. **Implement** (`commands/execute-plan.md`): Execute tasks (often in parallel/fan-out).
4. **Review**: Critique changes against `DESIGN.md`.

### 3.4 Commands (`commands/*.md`)
Commands are executable markdown files located in `/commands/` that orchestrate workflows using multiple skills in a specific order.

## 4. Superpowers Skills Library
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

## 5. Core Agent Specifications

### 5.1 The Architect (`agents/architect.claude.md`)
- **Role**: High-level system design and requirement gathering.
- **Input**: User goal (interactive).
- **Output**: `DESIGN.md` (System Architecture, Tech Stack).
- **Required Skills**: `brainstorming.md`, `system-design.md`.

### 5.2 The Planner (`agents/planner.claude.md`)
- **Role**: Project Management. Converts design into executable steps.
- **Input**: `DESIGN.md`.
- **Output**: `PLAN.md` (Task list, often minified JSON for automation).
- **Required Skills**: `writing-plans.md`, `json-schema.md`.

### 5.3 The Engineer (`agents/engineer.claude.md`)
- **Role**: Implementation. Writes code, tests, and config.
- **Input**: A single Task from `PLAN.md`.
- **Output**: File changes.
- **Required Skills**: `tdd.md`, `clean-code.md`, `language-specific/*.md`.
- **Note**: This agent is often run in "Fan-Out" mode (multiple instances in parallel).

### 5.4 The Reviewer (`agents/reviewer.claude.md`)
- **Role**: QA and Security.
- **Input**: `git diff` or specific files.
- **Output**: Critique or "LGTM".
- **Required Skills**: `security-audit.md`, `code-style.md`.

## 6. Commands
Commands are executable markdown files located in `/commands/` that orchestrate workflows.
*   **`brainstorm`** (`commands/brainstorm.md`): Invokes the brainstorming skill.
*   **`write-plan`** (`commands/write-plan.md`): Invokes the writing-plans skill.
*   **`execute-plan`** (`commands/execute-plan.md`): Invokes the executing-plans skill.

## 7. Repository Structure
- `src/`: Source code (TypeScript).
- `skills/`: Passive instruction sets (Superpowers).
- `agents/`: Executable agent definitions.
- `commands/`: Executable commands for workflows.
- `docs/reference.md`: Entity definitions and Configuration reference.
- `docs/`: User and developer documentation.
