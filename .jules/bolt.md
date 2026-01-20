## 2024-05-23 - [Optimizing loadGitignore with Caching]
**Learning:** In CLI tools that traverse directory trees frequently (like glob expansion), redundant file I/O for `.gitignore` files can be a significant bottleneck, especially when multiple globs share the same base directories. Caching file contents or existence checks can provide massive speedups (observed 3.7x).
**Action:** When implementing recursive directory walkers or file scanners, always consider caching metadata or file contents if the same paths are visited multiple times within a single execution.

## 2024-05-23 - [Optimizing Binary File Detection with Single Read]
**Learning:** For small files (which constitute the majority of source code), reading the file twice (once to check for binary content via `slice()` and once to get text content via `text()`) is inefficient. Reading the entire file into a buffer once, checking for null bytes, and then decoding it to text reduces I/O operations by half for these files.
**Action:** Use `readTextOrBinary` pattern to optimize file reading when binary detection is required, especially in loops processing many small files.

## 2024-05-24 - [Optimizing processGlobImport with Parallel I/O]
**Learning:** Sequential processing of glob results is a major bottleneck when handling many files. Using `Promise.all` with a `Semaphore` to limit concurrency allows for significant speedups (5x observed) while keeping memory usage and file descriptors in check.
**Action:** Always parallelize file I/O when processing lists of files, but use a semaphore to prevent resource exhaustion.
