/**
 * Template variable substitution for markdown content
 * Supports {{ variable }} syntax with named arguments
 */

export interface TemplateVars {
  [key: string]: string;
}

/**
 * Extract template variables from content
 * Returns array of variable names found in {{ variable }} patterns
 */
export function extractTemplateVars(content: string): string[] {
  const regex = /\{\{\s*(\w+)\s*\}\}/g;
  const vars: Set<string> = new Set();
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[1]) vars.add(match[1]);
  }
  return Array.from(vars);
}

/**
 * Substitute template variables in content
 * Replaces {{ variable }} with corresponding values from vars
 * Throws error if required variable is missing and strict mode is enabled
 */
export function substituteTemplateVars(
  content: string,
  vars: TemplateVars,
  options: { strict?: boolean } = {}
): string {
  const { strict = false } = options;

  return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, varName: string) => {
    if (varName in vars) {
      return vars[varName]!;
    }
    if (strict) {
      throw new Error(`Missing required template variable: ${varName}`);
    }
    return match; // Leave unreplaced if not strict
  });
}

/**
 * Parse CLI arguments into template variables
 * Extracts --key value pairs that aren't known flags
 */
export function parseTemplateArgs(
  args: string[],
  knownFlags: Set<string>
): TemplateVars {
  const vars: TemplateVars = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    // Skip non-flags
    if (!arg?.startsWith("--")) continue;

    const key = arg.slice(2); // Remove --

    // Skip known flags (handled by CLI parser)
    if (knownFlags.has(arg) || knownFlags.has(`--${key}`)) continue;

    // If next arg exists and isn't a flag, it's the value
    if (nextArg && !nextArg.startsWith("-")) {
      vars[key] = nextArg;
      i++; // Skip the value arg
    } else {
      // Boolean flag without value
      vars[key] = "true";
    }
  }

  return vars;
}
