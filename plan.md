# Plan: Superpowers Integration

## Phase 1: Foundation (Documentation & Analysis) - *Current Session*
- [x] Explore `mdflow` architecture.
- [x] Analyze `superpowers` patterns.
- [x] Create `AGENTS.md` (Knowledge Base).
- [x] Create `refactoring.md` (Strategy).
- [ ] **Action**: Create `plan.md` (this file).

## Phase 2: Content Migration (The "Port")
- [ ] Create directory structure: `examples/superpowers/`.
  - `examples/superpowers/skills/`
  - `examples/superpowers/agents/`
- [ ] Port **Skills**:
  - `test-driven-development`
  - `systematic-debugging`
  - `writing-plans`
  - *Task*: Convert `SKILL.md` to `examples/superpowers/skills/<name>.md`.
- [ ] Port **Agents**:
  - `code-reviewer`
  - *Task*: Convert to `examples/superpowers/agents/code-reviewer.claude.md`.
  - *Task*: Update internal references to use relative imports (`@../skills/...`).

## Phase 3: Runtime Enhancements (The "Glue")
- [ ] **Feature**: **Import Aliases / Paths**.
  - Enable imports like `@skills/tdd` to resolve to the correct location without long relative paths.
  - Modify `src/imports.ts` and config to support `import_paths`.
- [ ] **Feature**: **Library Installer**.
  - (Optional) Command to install these examples into `~/.mdflow/` for global availability.

## Phase 4: Verification & Demo
- [ ] Create a "Demo Scenario" (e.g., "Implement a Calculator with TDD").
- [ ] Run the ported `tdd` agent.
- [ ] Verify it forces the test-first approach.

## Immediate Next Steps (Next Session)
1. Execute Phase 2 (Porting).
2. Test the ported agents manually.
