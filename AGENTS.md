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
