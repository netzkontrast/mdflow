# mdflow

> Executable Markdown Agents

`mdflow` is a CLI tool that treats Markdown files as executable AI agents. It follows the Unix philosophy of "everything is a file" and pipeable streams.

## Quick Links

*   **[Guide](/guide/)**: Start here to learn how to use `mdflow`.
*   **[Reference](/reference/schema)**: Configuration schema and ontology.
*   **[Architecture](/architecture/concept)**: Deep dive into how it works.

## Installation

```bash
npm install -g mdflow
# or
bun install && bun link
```

## "Hello World"

Create a file named `hello.claude.md`:

```markdown
---
model: haiku
---
Say "Hello World"
```

Run it:

```bash
md hello.claude.md
```
