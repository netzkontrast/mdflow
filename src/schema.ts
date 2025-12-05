/**
 * Zod schemas for frontmatter validation
 * Provides type safety and helpful error messages
 */

import { z } from "zod";

/** Input field types for wizard mode */
const inputTypeSchema = z.enum(["text", "confirm", "select", "password"]);

/** Single input field definition */
export const inputFieldSchema = z.object({
  name: z.string().min(1, "Input name is required"),
  type: inputTypeSchema,
  message: z.string().min(1, "Input message is required"),
  default: z.union([z.string(), z.boolean()]).optional(),
  choices: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.type === "select" && (!data.choices || data.choices.length === 0)) {
      return false;
    }
    return true;
  },
  { message: "Select inputs require a non-empty choices array" }
);

/** Supported AI models */
const modelSchema = z.enum([
  "claude-sonnet-4.5",
  "claude-haiku-4.5",
  "claude-opus-4.5",
  "claude-sonnet-4",
  "gpt-5",
  "gpt-5.1",
  "gpt-5.1-codex-mini",
  "gpt-5.1-codex",
  "gpt-5-mini",
  "gpt-4.1",
  "gemini-3-pro-preview",
]).optional();

/** Output extraction modes */
const extractModeSchema = z.enum(["json", "code", "markdown", "raw"]).optional();

/** String or array of strings */
const stringOrArraySchema = z.union([
  z.string(),
  z.array(z.string()),
]).optional();

/** Main frontmatter schema */
export const frontmatterSchema = z.object({
  // Wizard mode inputs
  inputs: z.array(inputFieldSchema).optional(),

  // Context globs
  context: stringOrArraySchema,

  // Output extraction
  extract: extractModeSchema,

  // Command hooks
  before: stringOrArraySchema,
  after: stringOrArraySchema,

  // Model configuration
  model: modelSchema,
  agent: z.string().optional(),

  // Behavior flags
  silent: z.boolean().optional(),
  interactive: z.boolean().optional(),

  // Permission flags
  "allow-all-tools": z.boolean().optional(),
  "allow-all-paths": z.boolean().optional(),
  "allow-tool": z.string().optional(),
  "deny-tool": z.string().optional(),
  "add-dir": z.string().optional(),

  // Caching
  cache: z.boolean().optional(),

  // Prerequisites
  requires: z.object({
    bin: z.array(z.string()).optional(),
    env: z.array(z.string()).optional(),
  }).optional(),
}).passthrough(); // Allow unknown keys for forward compatibility

/** Type inferred from schema */
export type FrontmatterSchema = z.infer<typeof frontmatterSchema>;

/**
 * Format zod issues into readable error strings
 */
function formatZodIssues(issues: Array<{ path: (string | number)[]; message: string }>): string[] {
  return issues.map(issue => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

/**
 * Validate parsed YAML against frontmatter schema
 * Returns validated data or throws with helpful error messages
 */
export function validateFrontmatter(data: unknown): FrontmatterSchema {
  const result = frontmatterSchema.safeParse(data);

  if (!result.success) {
    const errors = formatZodIssues(result.error.issues);
    throw new Error(`Invalid frontmatter:\n  ${errors.join("\n  ")}`);
  }

  return result.data;
}

/**
 * Validate without throwing - returns result object
 */
export function safeParseFrontmatter(data: unknown): {
  success: boolean;
  data?: FrontmatterSchema;
  errors?: string[];
} {
  const result = frontmatterSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = formatZodIssues(result.error.issues);
  return { success: false, errors };
}
