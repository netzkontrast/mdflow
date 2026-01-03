# GAP ANALYSIS & MIGRATION PLAN: Superpowers -> mdflow

This document outlines the discrepancies between the Vision (`Konzept.md`) and the Current Reality, and lists the necessary updates to documentation and structure.

## 1. Gap Analysis (Vision vs. Reality)

| Feature | Vision (`Konzept.md`) | Current Reality | Status |
| :--- | :--- | :--- | :--- |
| **Architecture** | Decentralized `mdflow` agents | `mdflow` core exists, but "Superpowers" agents are missing | ⚠️ Partial |
| **Directory Structure** | `skills/` (for partials), `agents/` (for executable) | `examples/` (mixed bag) | ❌ Missing |
| **Orchestration** | Shell scripts (`dispatch.sh`), Pipe chaining | Manual pipe examples exist in `GUIDE.md` | ⚠️ Manual only |
| **Knowledge Base** | `AGENTS.md` as "Spec File" | `AGENTS.md` is a general overview | ⚠️ Needs Update |
| **Workflow** | Brainstorm -> Plan -> Implement -> Review | No explicit workflow defined in docs | ❌ Missing |
| **Parallelism** | "Fan-out" via `parallel` or `xargs` | Mentioned in `GUIDE.md` ex. 10, but no standard script | ⚠️ Conceptual |
| **Security** | "Zero Trust", Containerization, Shim Agents | Basic permission flags exist. No container/shim docs. | ⚠️ Basic |

## 2. Documentation Update List (The Task)

The following files must be updated to reflect the `Konzept.md` vision as the **primary operating mode** of the project.

### `AGENTS.md` (Priority: High)
- [ ] **Rewrite Goal**: Transform into the "Knowledge Base" and "Spec File" for the Superpowers system.
- [ ] Define the **Core Roles**:
  - `Architect` (Brainstorm/Design)
  - `Planner` (Task breakdown)
  - `Developer` (Implementation)
  - `Reviewer` (QA/Critique)
- [ ] Document the **Skill System**: How to write and import skills (`@./skills/name.md`).
- [ ] Document the **Workflow**: The circular lifecycle of an AI task.

### `README.md` (Priority: High)
- [ ] **Integration**: Explicitly state that `mdflow` is the runtime for the "Superpowers" methodology.
- [ ] **Quick Start**: Update to show a "Superpowers" style command (e.g., `md agents/brainstorm.claude.md`).
- [ ] **Structure**: Recommend the `skills/` and `agents/` directory layout for users.

### `CLAUDE.md` (Priority: Medium)
- [ ] **Instruction**: Teach Claude (the coding assistant) that we follow the Superpowers architecture.
- [ ] **Patterns**: Add examples of "Skill" files (pure markdown, no frontmatter) vs "Agent" files.

### `GUIDE.md` (Priority: Medium)
- [ ] **New Example**: Add "11. The Superpowers Workflow" (replacing or adding to the list).
- [ ] Show the Brainstorm -> Plan -> Implement chain.

### `refactoring.md` (Priority: Low)
- [ ] Mark the "Analysis" phase as complete.
- [ ] Update with the concrete steps we are taking now.

## 3. Implementation Tasks (Future/Next Session)

To support the documentation, the following structure must exist (at least as examples):

- [ ] Create `examples/superpowers/` directory.
- [ ] Create `examples/superpowers/skills/` (e.g., `writing-plans.md`, `tdd.md`).
- [ ] Create `examples/superpowers/agents/` (e.g., `brainstorm.claude.md`, `plan.claude.md`).
- [ ] Create `examples/superpowers/scripts/dispatch.sh` (The Fan-Out script).

## 4. Current Session Checklist
- [ ] Update `plan.md` (This file) ✅
- [ ] Update `AGENTS.md`
- [ ] Update `README.md`
- [ ] Update `CLAUDE.md`
- [ ] Update `GUIDE.md`
