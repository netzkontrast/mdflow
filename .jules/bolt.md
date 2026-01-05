## 2024-03-24 - [Glob Import Gitignore Caching]
**Learning:** `ignore` library initialization and file system walking for `.gitignore` files is a significant bottleneck when performed repeatedly for glob imports in the same directory structure.
**Action:** Implement in-memory caching for repetitive file system operations like `loadGitignore`, especially in CLI tools where the process lifetime is short but intensive.
