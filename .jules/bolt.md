## 2024-05-23 - [Caching Gitignore Lookups]
**Learning:** `loadGitignore` was recursively walking up the directory tree for *every* glob import, causing redundant I/O operations. In a deep directory structure with many glob imports, this became a significant bottleneck.
**Action:** Implemented a simple `Map` cache for `loadGitignore`. This avoids re-reading `.gitignore` files and re-checking directory existence for paths that have already been processed. The improvement was ~40% in a synthetic benchmark with deep directory structures and multiple glob imports.
