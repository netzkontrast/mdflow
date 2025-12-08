/**
 * Stream utilities for teeing, collecting, and piping readable streams.
 * Enables simultaneous display to console and capture for programmatic use.
 */

/**
 * Tee a readable stream into two independent streams.
 * Both streams will receive identical data from the source.
 *
 * @param readable - Source readable stream to tee
 * @returns Tuple of [streamA, streamB] that can be consumed independently
 */
export function teeStream(readable: ReadableStream<Uint8Array>): [ReadableStream<Uint8Array>, ReadableStream<Uint8Array>] {
  return readable.tee();
}

/**
 * Collect a readable stream into a string.
 * Consumes the entire stream and returns the concatenated content.
 *
 * @param readable - Source readable stream to collect
 * @returns Promise resolving to the collected string content
 */
export async function collectStream(readable: ReadableStream<Uint8Array>): Promise<string> {
  const reader = readable.getReader();
  const decoder = new TextDecoder();
  const chunks: string[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(decoder.decode(value, { stream: true }));
  }

  // Flush any remaining bytes
  chunks.push(decoder.decode());

  return chunks.join("");
}

/**
 * Pipe a readable stream to process.stdout.
 * Writes each chunk to stdout as it arrives, enabling real-time display.
 *
 * @param readable - Source readable stream to pipe
 * @returns Promise resolving when the stream is fully piped
 */
export async function pipeToStdout(readable: ReadableStream<Uint8Array>): Promise<void> {
  const reader = readable.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    await Bun.write(Bun.stdout, value);
  }
}

/**
 * Pipe a readable stream to process.stderr.
 * Writes each chunk to stderr as it arrives, enabling real-time display.
 *
 * @param readable - Source readable stream to pipe
 * @returns Promise resolving when the stream is fully piped
 */
export async function pipeToStderr(readable: ReadableStream<Uint8Array>): Promise<void> {
  const reader = readable.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    await Bun.write(Bun.stderr, value);
  }
}

/**
 * Tee and process a stream: pipe to stdout while collecting content.
 * This is the main utility for "teeing" - simultaneous display and capture.
 *
 * @param readable - Source readable stream
 * @returns Promise resolving to the collected string content
 */
export async function teeToStdoutAndCollect(readable: ReadableStream<Uint8Array>): Promise<string> {
  const [displayStream, collectStream_] = teeStream(readable);

  // Run both operations in parallel
  const [, collected] = await Promise.all([
    pipeToStdout(displayStream),
    collectStream(collectStream_),
  ]);

  return collected;
}

/**
 * Tee and process a stream: pipe to stderr while collecting content.
 *
 * @param readable - Source readable stream
 * @returns Promise resolving to the collected string content
 */
export async function teeToStderrAndCollect(readable: ReadableStream<Uint8Array>): Promise<string> {
  const [displayStream, collectStream_] = teeStream(readable);

  // Run both operations in parallel
  const [, collected] = await Promise.all([
    pipeToStderr(displayStream),
    collectStream(collectStream_),
  ]);

  return collected;
}
