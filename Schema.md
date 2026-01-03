# Schema: mdflow & Superpowers

This document defines the configuration schemas for mdflow Agents and Superpowers Skills.

## 1. Agent Schema (`*.model.md`)

Agents are executable Markdown files. Their behavior is controlled by YAML frontmatter.

### Core Fields

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `model` | `string` | **Yes** | The model to use (e.g., `claude-3-5-sonnet`, `gpt-4o`). Use `inherit` to use the default. |
| `temperature` | `number` | No | Randomness (0.0 - 1.0). Default: `0.0`. |
| `system` | `string` | No | System prompt override. |
| `stop` | `string[]` | No | Stop sequences. |

### Inputs & Logic

| Field | Type | Description |
| :--- | :--- | :--- |
| `_inputs` | `object` | Defines interactive inputs prompted at runtime. Keys become template variables. |
| `_env` | `string[]` | List of environment variables to inject. |
| `_dry_run` | `boolean` | If `true`, prints the compiled prompt without executing. |

#### `_inputs` Schema
```yaml
_inputs:
  variable_name:
    type: text | select | confirm
    message: "Prompt string"
    options: ["Option A", "Option B"] # Required for 'select'
    default: "Default value"
```

### Superpowers Extensions

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Human-readable name (legacy compatibility). |
| `description` | `string` | Description of purpose (legacy compatibility). |
| `version` | `string` | Semantic version of the agent. |
| `author` | `string` | Author/Owner. |

---

## 2. Skill Schema (`SKILL.md`)

Skills are passive instruction sets.

### Frontmatter Fields

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Unique identifier (kebab-case). Used for imports. |
| `description` | `string` | **Yes** | "Use when..." string describing triggers and symptoms. **Crucial for discovery.** |
| `disable-model-invocation` | `boolean` | No | If `true`, this file cannot be executed as an Agent (legacy). |

### Example

```yaml
---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes.
---
```

## 3. Tool Schema (Legacy Mapping)

While `mdflow` uses native tools, we map legacy Superpowers tool definitions for compatibility/documentation.

### Task Tool (Virtual)
Used in SDD to dispatch sub-agents.

```json
{
  "name": "Task",
  "parameters": {
    "type": "string", // e.g. "superpowers:code-reviewer"
    "task": "string", // Description of work
    "context": "string" // Additional context
  }
}
```

### TodoWrite Tool (Virtual)
Used for tracking plan state.

```json
{
  "name": "TodoWrite",
  "parameters": {
    "action": "add | complete | update",
    "item": "string"
  }
}
```
