# mdflow

**The "Superpowers" Engine for AI Engineering.**

`mdflow` treats Markdown files as **Executable Agents**. It provides the runtime environment to implement the "Superpowers" methodology—a decentralized, file-centric approach to AI software development.

```bash
# The Superpowers Workflow
md agents/brainstorm.claude.md   # Interactive design session
md agents/plan.claude.md         # Generate execution plan
md agents/implement.codex.md     # Execute the plan
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
- **[GUIDE.md](./GUIDE.md)**: 10+ Examples of `mdflow` in action.
- **[Konzept.md](./Konzept.md)**: The architectural vision behind the framework.

---

## Configuration

Global defaults in `~/.mdflow/config.yaml`.
Project specific environment variables in `.env`.

> **Note:** This tool powers the "Superpowers" methodology but is agnostic—you can use it for any LLM automation task.
