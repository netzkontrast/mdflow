# Refactoring & Integration Brainstorming

## Goal
Integrate `netzkontrast/superpowers` into `mdflow` to enhance it with robust engineering skills (TDD, Debugging) and specialized agents.

## Analysis of Superpowers

### "Skills"
- **Format**: Markdown files (`SKILL.md`).
- **Content**: Instructions, principles, and examples (Good/Bad).
- **Mechanism**: In `superpowers`, these are likely injected into the context based on triggers.
- **Porting to `mdflow`**:
  - Can be treated as **Partial Imports**.
  - We can verify `mdflow`'s `@import` syntax is sufficient.
  - *Idea*: Create a "Standard Library" of skills in `mdflow` (e.g., `lib/skills/`).
  - Users can import them via `@mdflow/skills/tdd` (requires a resolver update) or just relative paths if we ship them in a known location.

### "Agents"
- **Format**: Markdown files (mostly) with frontmatter.
- **Content**: System prompts, workflow definitions.
- **Mechanism**: In `superpowers`, these are "personas" the AI adopts.
- **Porting to `mdflow`**:
  - Direct mapping to `*.md` executable files.
  - Frontmatter needs to be adapted to `mdflow` schema (e.g., `model: inherit` -> `model: ...`).

## The Gap
1. **Import Ergonomics**: `superpowers` relies on implicit loading or easy access. `mdflow` currently requires explicit paths (`@./path/to/skill.md`).
   - *Solution*: Implement a "Library" or "Package" concept. Allow imports like `@std/tdd` or `@superpowers/debugging`.
2. **Context Management**: `superpowers` skills are often large. `mdflow` needs robust context window management (already present but needs verification with large skills).
3. **Workflow Chaining**: `superpowers` implies a workflow (Plan -> Review -> Code). `mdflow` handles this via piping or script orchestration.
   - *Solution*: Create "Workflow Agents" that chain other agents using `!mdflow step2.md`.

## Integration Strategy (The "Schema")

### 1. The Skill Schema
A Skill in `mdflow` should be a Markdown file designed for **Import**.
- **Location**: `examples/skills/` (initially) -> `lib/skills/` (long term).
- **Format**: Pure Markdown. Frontmatter is optional (ignored by import usually, but good for metadata).
- **Usage**:
  ```markdown
  # My Task
  I need to write a new feature.

  @./skills/test-driven-development.md
  ```

### 2. The Agent Schema
An Agent in `mdflow` is a Markdown file designed for **Execution**.
- **Location**: `examples/agents/`.
- **Format**:
  ```yaml
  ---
  model: claude-3-5-sonnet
  temperature: 0
  ---
  ```
  (Body containing instructions + Skill Imports)

### 3. Core Enhancements
To make this "Super", we should add:
- **Alias Imports**: Allow mapping `@tdd` to `~/.mdflow/skills/tdd.md` or a bundled path.
- **Auto-Injection**: (Maybe) Allow configuration to always inject certain skills for certain file types? (Too magic for now).

## Implementation Steps (Draft)
1. **Port Skills**: Copy `superpowers/skills/*/SKILL.md` to `mdflow/examples/skills/*.md`.
   - Clean up frontmatter if necessary.
2. **Port Agents**: Copy `superpowers/agents/*.md` to `mdflow/examples/agents/*.md`.
   - Update imports to point to the new skill locations.
   - Adjust frontmatter.
3. **Create "Super" Agent**: A master agent that orchestrates the workflow using the ported skills.
4. **Verify**: Run a complex task using the ported TDD skill to ensure it enforces the "Red-Green-Refactor" loop.

## The "Ultrathink" Synthesis
`superpowers` provides the **Software Engineering Wisdom**.
`mdflow` provides the **Execution Runtime**.

By combining them, we create a tool that doesn't just "generate code" but "generates code *correctly*".

**Vision**:
Running `mdflow feature.md` shouldn't just write code. It should:
1. Load `skills/planning.md` -> Ask user for plan.
2. Load `skills/tdd.md` -> Write test -> Run test (fail) -> Write code -> Run test (pass).
3. Load `skills/review.md` -> Critique own code.

This requires `mdflow` to handle **Interactive Loops** or **Multi-Step Execution**.
Currently `mdflow` is mostly "One-Shot" or "Interactive Chat".
We can simulate the loop via a shell script or a "Master Agent" that calls sub-agents.

**Recommendation**: Start by porting the content as explicit imports. This gives immediate power to the user to compose their own "Super Agents".
