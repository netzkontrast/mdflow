## 2024-05-23 - [Caching File I/O in Recursive Walks]
**Learning:** Walking directory trees (like for `.gitignore` discovery) in a CLI tool can trigger redundant file I/O when processing multiple items that share a common path.
**Action:** Implement module-level caching (e.g., `Map<path, content>`) for file reads and existence checks in recursive functions to significantly reduce syscalls.

## 2024-05-23 - [Native vs Manual Loop for Binary Check]
**Learning:** `Uint8Array.prototype.includes(0)` is faster and cleaner than a manual `for` loop for checking binary content in buffers.
**Action:** Always prefer native TypedArray methods over manual loops for byte scanning.
