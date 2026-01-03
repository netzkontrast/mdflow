# Reference: Ontology & Schema

This document consolidates the definitions of entities within the `mdflow` system (Ontology) and their configuration references (Schema).

---

## Part 1: Ontology

This section defines the core entities and relationships within the Superpowers system as implemented on the `mdflow` architecture.

### 1.1 Core Entities

#### Agent (`*.model.md`)
An **Agent** is an executable Markdown file that defines a specific AI persona and task.
*   **Active:** It is the entry point for execution (e.g., `mdflow agents/planner.claude.md`).
*   **Configurable:** Uses YAML frontmatter for parameters (`model`, `temperature`, `_inputs`).
*   **Composable:** Can import Skills and other partials.

#### Skill (`SKILL.md` or `*.md`)
A **Skill** is a passive Markdown file containing reusable instructions, patterns, or knowledge.
*   **Passive:** Not executed directly but imported into an Agent (e.g., `@import skills/tdd`).
*   **Modular:** Focuses on a single capability (e.g., "Test Driven Development").
*   **Structure:** Pure Markdown. Frontmatter is optional (used for discovery).

#### Workflow
A **Workflow** is a sequence of Agents or Steps orchestrated to achieve a larger goal.
*   **Implementation:** Typically shell scripts (`dispatch.sh`) or pipes (`step1 | step2`) connecting stateless Agents.
*   **Examples:** "Brainstorming -> Planning -> Execution", "Subagent Driven Development".

#### Tool
A **Tool** is an external capability invoked by an Agent.
*   **Native:** Standard Unix tools (`git`, `grep`, `cat`).
*   **mdflow Specific:** The `mdflow` CLI itself (recursion).

### 1.2 Superpowers Capabilities

These are high-level capabilities provided by the system.

*   **Brainstorming:** Interactive workflow to turn ideas into `DESIGN.md`.
*   **Planning:** Agent that converts `DESIGN.md` into `PLAN.md`.
*   **Subagent Driven Development (SDD):** Complex workflow using "Fan-out" parallelism and "Review Loops".
*   **Systematic Debugging:** Skill enforcing a 4-phase debugging process.
*   **Test Driven Development (TDD):** Skill enforcing the Red-Green-Refactor cycle.

---

## Part 2: Schema

This section defines the configuration schemas for Agents and Skills.

### 2.1 Agent Schema (`*.model.md`)

Agents are executable Markdown files controlled by YAML frontmatter.

#### Core Fields

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `model` | `string` | **Yes** | The model to use (e.g., `claude-3-5-sonnet`). Use `inherit` for default. |
| `temperature` | `number` | No | Randomness (0.0 - 1.0). Default: `0.0`. |
| `system` | `string` | No | System prompt override. |
| `stop` | `string[]` | No | Stop sequences. |

#### Inputs & Logic

| Field | Type | Description |
| :--- | :--- | :--- |
| `_inputs` | `object` | Defines interactive inputs prompted at runtime. Keys become template variables. |
| `_env` | `string[]` | List of environment variables to inject. |
| `_dry_run` | `boolean` | If `true`, prints the compiled prompt without executing. |

**`_inputs` Example:**
```yaml
_inputs:
  variable_name:
    type: text | select | confirm
    message: "Prompt string"
    options: ["Option A", "Option B"] # Required for 'select'
    default: "Default value"
```

### 2.2 Skill Schema (`SKILL.md`)

Skills are passive instruction sets.

#### Frontmatter Fields

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Unique identifier (kebab-case). |
| `description` | `string` | **Yes** | "Use when..." string describing triggers. Crucial for discovery. |

### 2.3 Legacy Tool Schema

For compatibility with legacy Superpowers tools:

*   **Task Tool:** Used in SDD to dispatch sub-agents.
*   **TodoWrite Tool:** Used for tracking plan state (mapped to file I/O in `mdflow`).
