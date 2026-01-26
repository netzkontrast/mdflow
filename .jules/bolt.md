## 2024-05-23 - [Optimizing loadGitignore with Caching]
**Learning:** In CLI tools that traverse directory trees frequently (like glob expansion), redundant file I/O for `.gitignore` files can be a significant bottleneck, especially when multiple globs share the same base directories. Caching file contents or existence checks can provide massive speedups (observed 3.7x).
**Action:** When implementing recursive directory walkers or file scanners, always consider caching metadata or file contents if the same paths are visited multiple times within a single execution.

## 2024-05-23 - [Optimizing Binary File Detection with Single Read]
**Learning:** For small files (which constitute the majority of source code), reading the file twice (once to check for binary content via `slice()` and once to get text content via `text()`) is inefficient. Reading the entire file into a buffer once, checking for null bytes, and then decoding it to text reduces I/O operations by half for these files.
**Action:** Use `readTextOrBinary` pattern to optimize file reading when binary detection is required, especially in loops processing many small files.

## 2026-01-26 - [Optimizing Unified Processor Reuse and AST Traversal]
**Learning:** Recreating `unified` processors (like `remark-parse`) for every operation is expensive. Reusing a single module-level instance can yield significant speedups (observed ~40%). Additionally, `unist-util-visit` supports visiting multiple node types in a single pass, avoiding redundant AST traversals.
**Action:** Instantiate `unified` processors once at the module level when possible. Combine visitors for multiple node types into a single `visit` call.
