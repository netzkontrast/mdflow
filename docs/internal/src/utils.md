# Utils Module Documentation

The `src/utils/` directory provides shared helper functions used across the application.

## Streams (`src/utils/streams.ts`, `src/utils/stream.ts`)

Utilities for handling Node.js/Bun streams.
-   `createDefaultStreams`: Returns standard `stdin`, `stdout`, `stderr`.
-   `createCaptureStream`: Creates a writable stream that captures output to a buffer (useful for testing and output capturing).
-   `readStream`: Reads a stream into a string.

## Markdown Renderer (`src/utils/markdown-renderer.ts`)

Renders markdown to the terminal with syntax highlighting and formatting.
-   Used for displaying the help screen, dry-run output, and agent descriptions.
-   Uses `marked` and `chalk`.

## Fetch (`src/utils/fetch.ts`)

Wrapper around the global `fetch` API.
-   Adds timeout support.
-   Standardizes error handling for network requests.

## Binary Check (`src/utils/binary-check.ts`)

Checks for the existence of required binaries in the system `$PATH`.
-   Used to verify that the command specified in an agent (e.g., `claude`, `python`) is actually installed.

## Test Utils (`src/utils/test-utils.ts`)

Helpers for writing integration tests.
-   `runTestAgent`: Executes an agent in a test environment.
-   `createMockFileSystem`: Sets up a fake file system structure.
