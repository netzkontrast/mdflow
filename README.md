# mdflow

**The "Superpowers" Engine for AI Engineering.**
> **Note:** This repository integrates the "Superpowers" methodology (Brainstorming, TDD, SDD) onto a decentralized `mdflow` architecture.

`mdflow` is a CLI tool that treats Markdown files as executable AI agents. It follows the Unix philosophy of "everything is a file" and pipeable streams.

## Documentation

Full documentation is available in the [`docs/`](docs/) directory.

*   [**Guide**](docs/guide/index.md): The comprehensive user guide and examples tour.
*   [**Architecture**](docs/architecture/concept.md): The architectural vision (`Konzept.md`).
*   [**Reference**](docs/reference/schema.md): Schema and Ontology definitions.
*   [**Internal**](docs/internal/claude.md): Developer guide for Claude integration.

## Quick Start

1.  **Install**:
    ```bash
    npm install -g mdflow
    # or
    bun install && bun link
    ```
2.  **Create an Agent**:
    ```bash
    # task.claude.md
    echo "Explain quantum computing" > task.claude.md
    ```
3.  **Run**:
    ```bash
    mdflow task.claude.md
    ```

## Superpowers & Agents

See [AGENTS.md](AGENTS.md) for the Skills Library and Workflow Rules.

---

## 🚀 Quick Start (Superpowers)

### 1. The Superpowers Workflow
We have integrated the core "Superpowers" skills and workflows into `mdflow`:

```bash
# The Superpowers Workflow
md commands/brainstorm.md   # Interactive design session
md commands/write-plan.md   # Generate execution plan
md commands/execute-plan.md # Execute the plan
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
@../skills/testing/test-driven-development/SKILL.md

Task: {{ _task }}
```

### 3. Run It

```bash
md agents/coder.claude.md
```
