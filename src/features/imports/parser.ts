/**
 * Phase 1: Pure Parser
 *
 * Scans content and returns a list of ImportActions.
 * This is a pure function with no I/O - uses a markdown AST parser
 * that properly ignores imports inside code blocks.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import type {
  ImportAction,
  FileImportAction,
  GlobImportAction,
  UrlImportAction,
  CommandImportAction,
  SymbolImportAction,
  ExecutableCodeFenceAction,
} from './imports-types';

/**
 * Range type for code regions and safe ranges
 */
interface Range {
  start: number;
  end: number;
}

/**
 * Inverts code regions to get safe ranges.
 * Given regions where code exists, returns regions where code doesn't exist.
 */
function invertRanges(codeRegions: Range[], contentLength: number): Range[] {
  const safeRanges: Range[] = [];
  let current = 0;

  for (const region of codeRegions) {
    if (current < region.start) {
      safeRanges.push({ start: current, end: region.start });
    }
    current = region.end;
  }

  if (current < contentLength) {
    safeRanges.push({ start: current, end: contentLength });
  }

  return safeRanges;
}

/**
 * Uses a markdown AST parser to find code blocks (fenced and inline),
 * then returns the "safe" ranges where imports can be parsed.
 *
 * Returns an array of "safe" ranges where imports can be parsed.
 * Exported for unit testing.
 */
export function findSafeRanges(content: string): Range[] {
  if (content.length === 0) {
    return [];
  }

  // OPTIMIZATION: Fast path for content without code blocks
  // If there are no backticks, tildes, or indented blocks, the whole content is safe.
  // This avoids the expensive unified() parser for the majority of files.
  //
  // Indented code blocks start with 4 spaces or a tab at the beginning of a line.
  // We use a regex to check for this.
  const hasBackticks = content.includes('`');
  const hasTildes = content.includes('~');

  if (!hasBackticks && !hasTildes) {
    // Check for indented code blocks (4 spaces or tab at start of line)
    // We use a multiline regex. This is faster than parsing AST.
    const hasIndentedBlock = /^(\t| {4})/m.test(content);

    // Also check for potential nested code blocks in lists or blockquotes
    // If the content has list markers or blockquotes, we fall back to full parsing
    // to be safe, as they might contain indented code blocks.
    const hasPotentialNestedBlocks = /^[ \t]*([*+-]|\d+\.|>)/m.test(content);

    if (!hasIndentedBlock && !hasPotentialNestedBlocks) {
      return [{ start: 0, end: content.length }];
    }
  }

  const processor = unified().use(remarkParse);
  const ast = processor.parse(content) as Root;

  // Collect all code regions (fenced + inline)
  const codeRegions: Range[] = [];

  // Find fenced/indented code blocks
  visit(ast, 'code', (node) => {
    if (node.position?.start.offset !== undefined &&
        node.position?.end.offset !== undefined) {
      codeRegions.push({
        start: node.position.start.offset,
        end: node.position.end.offset,
      });
    }
  });

  // Find inline code spans
  visit(ast, 'inlineCode', (node) => {
    if (node.position?.start.offset !== undefined &&
        node.position?.end.offset !== undefined) {
      codeRegions.push({
        start: node.position.start.offset,
        end: node.position.end.offset,
      });
    }
  });

  // Sort by start position (important for invertRanges)
  codeRegions.sort((a, b) => a.start - b.start);

  // Invert to get safe ranges
  return invertRanges(codeRegions, content.length);
}

/**
 * Check if an index falls within any of the safe ranges
 */
function isInSafeRange(index: number, safeRanges: Array<{ start: number; end: number }>): boolean {
  for (const range of safeRanges) {
    if (index >= range.start && index < range.end) {
      return true;
    }
  }
  return false;
}

/**
 * Combined pattern to match all import types in a single pass.
 *
 * Groups:
 * 1. Executable Fence Start (e.g. ```ts)
 * 2. Executable Fence Info (e.g. ts)
 * 3. Executable Fence Shebang (e.g. #!/bin/bash)
 * 4. Executable Fence Code (content)
 *    \1: Backreference to Fence Start
 *
 * 5. Command Inline Start (e.g. ` or ``)
 * 6. Command Inline Content
 *    \5: Backreference to Command Start
 *
 * 7. Import Path/URL (e.g. https://... or ./file.ts)
 */
const COMBINED_PATTERN = /(`{3,})(.*?)\n(#![^\n]+)\n([\s\S]*?)\1|!(`+)([\s\S]+?)\5|@((?:https?:\/\/[^\s]+)|(?:~?[./][^\s]+))/g;

/**
 * Check if a path contains glob characters
 */
export function isGlobPattern(path: string): boolean {
  return path.includes('*') || path.includes('?') || path.includes('[');
}

/**
 * Parse import path for line range syntax: @./file.ts:10-50
 */
export function parseLineRange(path: string): { path: string; start?: number; end?: number } {
  const match = path.match(/^(.+):(\d+)-(\d+)$/);
  if (match && match[1] && match[2] && match[3]) {
    return {
      path: match[1],
      start: parseInt(match[2], 10),
      end: parseInt(match[3], 10),
    };
  }
  return { path };
}

/**
 * Parse import path for symbol extraction: @./file.ts#SymbolName
 */
export function parseSymbolExtraction(path: string): { path: string; symbol?: string } {
  const match = path.match(/^(.+)#([a-zA-Z_$][a-zA-Z0-9_$]*)$/);
  if (match && match[1] && match[2]) {
    return {
      path: match[1],
      symbol: match[2],
    };
  }
  return { path };
}

/**
 * Parse a single file import path into the appropriate action type
 */
function parseFileImportPath(
  fullMatch: string,
  path: string,
  index: number
): FileImportAction | GlobImportAction | SymbolImportAction {
  // Check for glob pattern first
  if (isGlobPattern(path)) {
    return {
      type: 'glob',
      pattern: path,
      original: fullMatch,
      index,
    };
  }

  // Check for symbol extraction syntax
  const symbolParsed = parseSymbolExtraction(path);
  if (symbolParsed.symbol) {
    return {
      type: 'symbol',
      path: symbolParsed.path,
      symbol: symbolParsed.symbol,
      original: fullMatch,
      index,
    };
  }

  // Check for line range syntax
  const rangeParsed = parseLineRange(path);
  if (rangeParsed.start !== undefined && rangeParsed.end !== undefined) {
    return {
      type: 'file',
      path: rangeParsed.path,
      lineRange: { start: rangeParsed.start, end: rangeParsed.end },
      original: fullMatch,
      index,
    };
  }

  // Regular file import
  return {
    type: 'file',
    path,
    original: fullMatch,
    index,
  };
}

/**
 * Parse all imports from content
 *
 * This is a pure function that scans the content and returns all found imports.
 * It does NOT perform any I/O operations.
 *
 * Uses a context-aware scanner to ignore imports inside:
 * - Fenced code blocks (``` or ~~~)
 * - Inline code spans (`)
 *
 * @param content - The content to scan for imports
 * @returns Array of ImportActions, sorted by index (position in string)
 */
export function parseImports(content: string): ImportAction[] {
  const actions: ImportAction[] = [];

  // Find safe ranges where imports should be parsed (outside code blocks)
  const safeRanges = findSafeRanges(content);

  // Identify starts of unsafe blocks (gaps between safe ranges)
  // These are the only valid positions for executable code fences.
  // This prevents execution of fences nested inside documentation blocks.
  const unsafeStarts = new Set<number>();
  if (safeRanges.length > 0) {
    if (safeRanges[0]!.start > 0) unsafeStarts.add(0);
    for (const range of safeRanges) {
      if (range.end < content.length) {
        unsafeStarts.add(range.end);
      }
    }
  } else if (content.length > 0) {
    // If content exists but no safe ranges, the whole thing is unsafe (a code block)
    unsafeStarts.add(0);
  }

  // Pointer for efficient safe range lookups (amortized O(1))
  let currentRangeIndex = 0;

  // Helper to check safety using the moving pointer
  // Note: match.index is guaranteed to be increasing
  const isSafe = (index: number): boolean => {
    // Advance pointer to the first range that ends after the index
    while (currentRangeIndex < safeRanges.length && safeRanges[currentRangeIndex].end <= index) {
      currentRangeIndex++;
    }

    // Check if the current range covers the index
    // If ranges[i].start <= index < ranges[i].end
    if (currentRangeIndex < safeRanges.length && safeRanges[currentRangeIndex].start <= index) {
      return true;
    }
    return false;
  };

  COMBINED_PATTERN.lastIndex = 0;
  let match;

  while ((match = COMBINED_PATTERN.exec(content)) !== null) {
    const index = match.index;
    const fullMatch = match[0];

    // Check which capture group matched

    // Group 1: Executable Fence
    if (match[1]) {
      // Only process if the match aligns exactly with a known code block start
      if (unsafeStarts.has(index)) {
        const fence = match[1];
        const infoString = match[2];
        const shebang = match[3];
        const code = match[4];

        const language = (infoString ?? '').trim().split(/\s+/)[0] ?? '';

        if (shebang && code !== undefined) {
          const action: ExecutableCodeFenceAction = {
            type: 'executable_code_fence',
            language: language || 'txt',
            shebang,
            code: code.trim(),
            original: fullMatch,
            index,
          };
          actions.push(action);
        }
      }
      continue;
    }

    // For other types, verify they are in a safe range
    if (!isSafe(index)) {
      continue;
    }

    // Group 5: Command Inline
    if (match[5]) {
      const commandContent = match[6];
      if (commandContent) {
        const cmdAction: CommandImportAction = {
          type: 'command',
          command: commandContent,
          original: fullMatch,
          index,
        };
        actions.push(cmdAction);
      }
      continue;
    }

    // Group 7: Import Path/URL
    if (match[7]) {
      const pathOrUrl = match[7];

      // Check if it's a URL
      if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
        const urlAction: UrlImportAction = {
          type: 'url',
          url: pathOrUrl,
          original: fullMatch,
          index,
        };
        actions.push(urlAction);
      } else {
        // Must be a file import
        const action = parseFileImportPath(fullMatch, pathOrUrl, index);
        actions.push(action);
      }
    }
  }

  // Sort by index to maintain order (though COMBINED_PATTERN should already be ordered)
  actions.sort((a, b) => a.index - b.index);

  return actions;
}

/**
 * Check if content contains any imports
 *
 * Uses context-aware scanning to ignore imports inside code blocks.
 *
 * @param content - The content to check
 * @returns true if any imports are found outside of code blocks
 */
export function hasImportsInContent(content: string): boolean {
  // Use parseImports which is already context-aware
  return parseImports(content).length > 0;
}
