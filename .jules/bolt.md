## 2024-05-23 - [Optimizing loadGitignore with Caching]
**Learning:** In CLI tools that traverse directory trees frequently (like glob expansion), redundant file I/O for `.gitignore` files can be a significant bottleneck, especially when multiple globs share the same base directories. Caching file contents or existence checks can provide massive speedups (observed 3.7x).
**Action:** When implementing recursive directory walkers or file scanners, always consider caching metadata or file contents if the same paths are visited multiple times within a single execution.
