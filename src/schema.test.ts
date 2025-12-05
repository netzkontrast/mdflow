import { expect, test, describe } from "bun:test";
import { validateFrontmatter, safeParseFrontmatter } from "./schema";

describe("validateFrontmatter", () => {
  test("validates minimal frontmatter", () => {
    const result = validateFrontmatter({ model: "gpt-5" });
    expect(result.model).toBe("gpt-5");
  });

  test("validates all supported models", () => {
    const models = [
      "claude-sonnet-4.5", "claude-haiku-4.5", "claude-opus-4.5",
      "gpt-5", "gpt-5.1", "gemini-3-pro-preview"
    ];
    for (const model of models) {
      const result = validateFrontmatter({ model });
      expect(result.model).toBe(model);
    }
  });

  test("validates inputs array", () => {
    const result = validateFrontmatter({
      inputs: [
        { name: "branch", type: "text", message: "Branch?" },
        { name: "force", type: "confirm", message: "Force?", default: false },
      ]
    });
    expect(result.inputs).toHaveLength(2);
    expect(result.inputs![0]!.name).toBe("branch");
    expect(result.inputs![1]!.default).toBe(false);
  });

  test("validates select input with choices", () => {
    const result = validateFrontmatter({
      inputs: [
        { name: "env", type: "select", message: "Env?", choices: ["dev", "prod"] }
      ]
    });
    expect(result.inputs![0]!.choices).toEqual(["dev", "prod"]);
  });

  test("rejects select without choices", () => {
    expect(() => validateFrontmatter({
      inputs: [
        { name: "env", type: "select", message: "Env?" }
      ]
    })).toThrow("Select inputs require a non-empty choices array");
  });

  test("validates context as string", () => {
    const result = validateFrontmatter({ context: "src/**/*.ts" });
    expect(result.context).toBe("src/**/*.ts");
  });

  test("validates context as array", () => {
    const result = validateFrontmatter({ context: ["src/**/*.ts", "!**/*.test.ts"] });
    expect(result.context).toEqual(["src/**/*.ts", "!**/*.test.ts"]);
  });

  test("validates extract modes", () => {
    for (const extract of ["json", "code", "markdown", "raw"]) {
      const result = validateFrontmatter({ extract });
      expect(result.extract).toBe(extract);
    }
  });

  test("rejects invalid extract mode", () => {
    expect(() => validateFrontmatter({ extract: "invalid" })).toThrow();
  });

  test("validates before/after commands", () => {
    const result = validateFrontmatter({
      before: "echo hello",
      after: ["pbcopy", "echo done"]
    });
    expect(result.before).toBe("echo hello");
    expect(result.after).toEqual(["pbcopy", "echo done"]);
  });

  test("validates boolean flags", () => {
    const result = validateFrontmatter({
      silent: true,
      interactive: false,
      "allow-all-tools": true,
      "allow-all-paths": false,
    });
    expect(result.silent).toBe(true);
    expect(result.interactive).toBe(false);
    expect(result["allow-all-tools"]).toBe(true);
    expect(result["allow-all-paths"]).toBe(false);
  });

  test("validates requires object", () => {
    const result = validateFrontmatter({
      requires: {
        bin: ["docker", "gh"],
        env: ["GITHUB_TOKEN"]
      }
    });
    expect(result.requires?.bin).toEqual(["docker", "gh"]);
    expect(result.requires?.env).toEqual(["GITHUB_TOKEN"]);
  });

  test("allows unknown keys for forward compatibility", () => {
    const result = validateFrontmatter({
      model: "gpt-5",
      futureFeature: "some value"
    });
    expect(result.model).toBe("gpt-5");
    expect((result as any).futureFeature).toBe("some value");
  });
});

describe("safeParseFrontmatter", () => {
  test("returns success with valid data", () => {
    const result = safeParseFrontmatter({ model: "gpt-5" });
    expect(result.success).toBe(true);
    expect(result.data?.model).toBe("gpt-5");
  });

  test("returns errors with invalid data", () => {
    const result = safeParseFrontmatter({
      inputs: [{ type: "text" }] // Missing name and message
    });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  test("formats error paths correctly", () => {
    const result = safeParseFrontmatter({
      inputs: [{ name: "test", type: "invalid", message: "test" }]
    });
    expect(result.success).toBe(false);
    expect(result.errors?.some(e => e.includes("inputs.0.type"))).toBe(true);
  });
});
