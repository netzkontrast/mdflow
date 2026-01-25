## 2024-05-23 - [Optimizing loadGitignore with Caching]
**Learning:** In CLI tools that traverse directory trees frequently (like glob expansion), redundant file I/O for `.gitignore` files can be a significant bottleneck, especially when multiple globs share the same base directories. Caching file contents or existence checks can provide massive speedups (observed 3.7x).
**Action:** When implementing recursive directory walkers or file scanners, always consider caching metadata or file contents if the same paths are visited multiple times within a single execution.

## 2024-05-23 - [Optimizing Binary File Detection with Single Read]
**Learning:** For small files (which constitute the majority of source code), reading the file twice (once to check for binary content via `slice()` and once to get text content via `text()`) is inefficient. Reading the entire file into a buffer once, checking for null bytes, and then decoding it to text reduces I/O operations by half for these files.
**Action:** Use `readTextOrBinary` pattern to optimize file reading when binary detection is required, especially in loops processing many small files.

## 2026-01-25 - [Optimizing I/O with Debouncing]
**Learning:** Functions like `recordUsage` that persist state to disk can become major bottlenecks if called frequently (e.g., in loops). Implementing a debounce mechanism can reduce I/O operations by orders of magnitude (e.g., 20 writes -> 2 writes). However, for CLI tools, using `.unref()` on the timer can lead to data loss if the process exits before the timer fires.
**Action:** Use debouncing for frequent I/O operations, but carefully consider the trade-off between exit speed (using `.unref()`) and data persistence. For CLI tools where data integrity matters more than instant exit, avoid `.unref()` or implement a flush-on-exit mechanism.
