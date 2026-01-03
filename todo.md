# Critique & Refactoring Plan

## 1. Intense Critique of `docs/meta.md`

The current `docs/meta.md` correctly identifies the "What" (Gap Analysis) but fails significantly on the "How" (Implementation Details). It is too passive and aspirational.

### Critical Weaknesses:
1.  **"Fan-out" is Hand-Waved:** The document says "Need mdflow adapter/script". This is the *hardest* part of SDD. It requires parsing a `PLAN.md` (JSON/Markdown list), maintaining state (which task is done?), and launching parallel processes. `mdflow` currently has no primitive for this.
2.  **"TodoWrite" Naivety:** Replacing a structured tool (`TodoWrite`) with "File editing" is dangerous. LLMs are bad at appending to the middle of files without clobbering content. We need a robust `update-plan` agent or a dedicated CLI utility (e.g., `md plan update`).
3.  **Path Hell:** The document suggests `examples/skills`, `lib/skills`, and `skills/`. This ambiguity will kill usability. We must strictly enforce the Root-Level `skills/` rule as per user preference.
4.  **Missing "Glue":** There is no mention of *how* an agent triggers a workflow. Does the Planner *call* the Dispatcher? Or does the User call the Dispatcher which reads the Plan? (Answer: The latter is more "Unix-philosophy", but `meta.md` doesn't decide).
5.  **No Testing Strategy:** How do we prove "Superpowers" work? We need a `smoke-tests/sdd-workflow.sh` that mocks the agents and verifies the pipeline.

---

## 2. Next Best Refactoring: The "Workflow Primitives"

To turn `mdflow` into a "Superpowers Engine", we need to build the *Workflow Primitives* that replace the legacy Tools.

### Phase 1: The Skills Foundation (Cleanup)
*   [ ] **Standardize `skills/`:** strictly follow `skills/<category>/<name>.md`.
*   [ ] **Port Core Skills:** Ensure `brainstorming`, `writing-plans`, `tdd` are clean and import-ready.

### Phase 2: The "State" Primitive (Plan Manager)
*   [ ] **Create `src/cli/plan.ts` (or `commands/plan-manager.md`):** A tool/agent specifically designed to safely read/write `PLAN.md`.
    *   *Why:* To replace `TodoWrite`.
    *   *Spec:* `md plan add "Task"`, `md plan complete 1`.

### Phase 3: The "Dispatch" Primitive (Fan-Out)
*   [ ] **Create `commands/dispatch.sh` (or `.ts`):** A script that reads `PLAN.md` and executes `mdflow` for each pending task.
    *   *Why:* To implement SDD.
    *   *Logic:* `for task in $(md plan list --pending); do mdflow agents/engineer.md --_task "$task" & done`.

### Phase 4: The "Loop" Primitive (Verification)
*   [ ] **Create `agents/reviewer.md`:** An agent that takes a file + spec and outputs PASS/FAIL.
*   [ ] **Integrate into Dispatch:** The dispatcher should only mark a task "Done" if `reviewer.md` returns PASS.

### Phase 5: Verification
*   [ ] **Smoke Test:** Create `smoke-tests/superpowers-demo.sh` that runs the full loop on a dummy task ("Create a fibonacci function").
