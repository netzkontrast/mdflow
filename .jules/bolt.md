## 2024-05-23 - [Optimizing loadGitignore with Caching]
**Learning:** In CLI tools that traverse directory trees frequently (like glob expansion), redundant file I/O for `.gitignore` files can be a significant bottleneck, especially when multiple globs share the same base directories. Caching file contents or existence checks can provide massive speedups (observed 3.7x).
**Action:** When implementing recursive directory walkers or file scanners, always consider caching metadata or file contents if the same paths are visited multiple times within a single execution.

## 2024-05-23 - [Optimizing Binary File Detection with Single Read]
**Learning:** For small files (which constitute the majority of source code), reading the file twice (once to check for binary content via `slice()` and once to get text content via `text()`) is inefficient. Reading the entire file into a buffer once, checking for null bytes, and then decoding it to text reduces I/O operations by half for these files.
**Action:** Use `readTextOrBinary` pattern to optimize file reading when binary detection is required, especially in loops processing many small files.

## 2025-02-14 - [Parallelizing Glob Import Processing]
**Learning:** Sequential processing of files found by `Glob.scan` (which is an async generator) creates a significant bottleneck, even for small files, due to accumulated I/O latency. Parallelizing file reading and binary checking using `Promise.all` with a semaphore provided a 5x speedup (280ms -> 57ms for 1000 files).
**Action:** When iterating over file lists from `Glob`, collect paths first and process them in parallel batches using `Semaphore` to maximize I/O throughput.
