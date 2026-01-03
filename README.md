# mdflow (with Superpowers)

**The "Superpowers" Engine for AI Engineering.**
> **Note:** This repository integrates the "Superpowers" methodology (Brainstorming, TDD, SDD) onto a decentralized `mdflow` architecture. See `Konzept.md` for the architectural vision.

`mdflow` is a CLI tool that treats Markdown files as executable AI agents. It follows the Unix philosophy of "everything is a file" and pipeable streams.

## The Superpowers System

We have integrated the core "Superpowers" skills and workflows into `mdflow`:

1.  **Brainstorming**: Interactive design sessions.
2.  **Planning**: Automated implementation planning.
3.  **Subagent Driven Development (SDD)**: "Fan-out" execution of plans using parallel workers.
4.  **Rigorous Engineering**: Skills for TDD, Systematic Debugging, and Code Review.

See [AGENTS.md](AGENTS.md) for the full Skills Library.

## Documentation

*   [reference.md](docs/reference.md): Definitions of Agent, Skill, Workflow, Tool, and Configuration Schema.
*   [architecture.md](docs/architecture.md): Architectural vision and migration strategy.
*   [technical.md](docs/technical.md): Technical documentation of the source code.

## Vision

Instead of monolithic "Agent Platforms", we believe in:
- **Executable Markdown**: Files named `task.model.md` are commands.
- **Composable Skills**: Imports (`@file`) allow reusing prompt logic.
- **Pipeline Architecture**: `cat task.md | mdflow | grep "result"`

## Repository Structure

- `src/`: The `mdflow` runtime (TypeScript).
- `skills/`: Passive instruction sets (The "Superpowers").
- `agents/`: Executable agent definitions.
- `commands/`: Executable commands for workflows.
- `ontology.md` & `Schema.md`: System definition.

---

## What Is This?

Markdown files become first-class CLI commands. Write a prompt in markdown, run it like a script. The command is inferred from the filename.

```markdown
# review.claude.md
---
model: opus
---
Review this code for bugs and suggest improvements.
```

`mdflow` treats Markdown files as **Executable Agents**. It provides the runtime environment to implement the "Superpowers" methodology—a decentralized, file-centric approach to AI software development.

```bash
# The Superpowers Workflow
md commands/brainstorm.md   # Interactive design session
md commands/write-plan.md   # Generate execution plan
md commands/execute-plan.md # Execute the plan
```

---

## ⚡ The Superpowers Framework

We follow a structured **Agentic Workflow**:

1.  **Skills (`skills/`)**: Reusable knowledge modules (e.g., `tdd.md`, `security.md`).
2.  **Agents (`agents/`)**: Executable personas that combine Skills + Prompts.
3.  **Workflow**: Brainstorm $\to$ Plan $\to$ Implement $\to$ Review.

### Directory Structure

Recommended structure for your repository:

```text
my-project/
├── .mdflow/
├── skills/                  # Your Knowledge Base
│   ├── tdd.md
│   └── code-style.md
├── agents/                  # Your Executable Agents
│   ├── architect.claude.md
│   └── developer.codex.md
├── commands/                # Workflow Commands
│   ├── brainstorm.md
│   ├── write-plan.md
│   └── execute-plan.md
├── DESIGN.md                # Generated Context
└── PLAN.md                  # Generated Context
```

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install -g mdflow
# or
bun install && bun link
```

### 2. Create Your First Agent

Create `agents/coder.claude.md`:

```markdown
---
model: claude-3-5-sonnet
_inputs:
  _task:
    type: text
    description: "What should I build?"
---
You are an Expert Developer.
@../skills/tdd.md

Task: {{ _task }}
```

### 3. Run It

```bash
md agents/coder.claude.md
```

---

## 🛠 Features

### Executable Markdown
Name your file `task.COMMAND.md` and run it.
- `task.claude.md` $\to$ Runs Claude
- `task.gemini.md` $\to$ Runs Gemini
- `task.codex.md` $\to$ Runs OpenAI (Codex)

### Dynamic Imports & Context
Build context dynamically from your codebase.

```markdown
Review these files:
@./src/**/*.ts
```

### Interactive Inputs
Turn prompts into forms.

```yaml
---
_inputs:
  _env:
    type: select
    options: [dev, prod]
---
Deploy to {{ _env }}.
```

---

## 📖 Documentation

- **[AGENTS.md](./AGENTS.md)**: The "Superpowers" Knowledge Base & Spec.
- **[Guide](./docs/guide.md)**: 10+ Examples of `mdflow` in action.
- **[Architecture](./docs/architecture.md)**: The architectural vision behind the framework.
- **[Reference](./docs/reference.md)**: Ontology and Schema.
- **[Technical](./docs/technical.md)**: Source code documentation.

---

## Configuration

Global defaults in `~/.mdflow/config.yaml`.
Project specific environment variables in `.env`.

> **Note:** This tool powers the "Superpowers" methodology but is agnostic—you can use it for any LLM automation task.
