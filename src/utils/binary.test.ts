import { test, expect, beforeAll, afterAll } from "bun:test";
import { isBinaryFile, isBinaryFileAsync, expandImports } from "./imports";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

let testDir: string;

beforeAll(async () => {
  testDir = await mkdtemp(join(tmpdir(), "binary-test-"));

  // Create text files
  await Bun.write(join(testDir, "text.txt"), "Hello, world!");
  await Bun.write(join(testDir, "code.ts"), "const x = 1;");
  await Bun.write(join(testDir, "readme.md"), "# Readme\n\nContent here.");

  // Create files with binary extensions
  await Bun.write(join(testDir, "image.png"), "fake png content");
  await Bun.write(join(testDir, "doc.pdf"), "fake pdf content");
  await Bun.write(join(testDir, "archive.zip"), "fake zip content");
  await Bun.write(join(testDir, "data.db"), "fake db content");

  // Create actual binary file with null bytes
  const binaryContent = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x00, 0x57, 0x6f, 0x72, 0x6c, 0x64]);
  await Bun.write(join(testDir, "actual-binary.dat"), binaryContent);

  // Create file that looks like text but has null byte in middle
  const mixedContent = new Uint8Array([0x54, 0x65, 0x78, 0x74, 0x00, 0x4d, 0x6f, 0x72, 0x65]);
  await Bun.write(join(testDir, "hidden-binary.txt"), mixedContent);

  // Create .DS_Store file
  await Bun.write(join(testDir, ".DS_Store"), "fake ds_store content");

  // Create directory for glob tests with mixed files
  await Bun.write(join(testDir, "mixed/code.ts"), "const y = 2;");
  await Bun.write(join(testDir, "mixed/image.png"), "fake image");
  await Bun.write(join(testDir, "mixed/doc.pdf"), "fake pdf");
  await Bun.write(join(testDir, "mixed/.DS_Store"), "ds store");
});

afterAll(async () => {
  await rm(testDir, { recursive: true });
});

// ===== isBinaryFile (synchronous extension check) =====

test("isBinaryFile detects image extensions", () => {
  expect(isBinaryFile("photo.png")).toBe(true);
  expect(isBinaryFile("image.jpg")).toBe(true);
  expect(isBinaryFile("picture.jpeg")).toBe(true);
  expect(isBinaryFile("animation.gif")).toBe(true);
  expect(isBinaryFile("icon.ico")).toBe(true);
  expect(isBinaryFile("modern.webp")).toBe(true);
  expect(isBinaryFile("bitmap.bmp")).toBe(true);
});

test("isBinaryFile detects executable extensions", () => {
  expect(isBinaryFile("program.exe")).toBe(true);
  expect(isBinaryFile("library.dll")).toBe(true);
  expect(isBinaryFile("shared.so")).toBe(true);
  expect(isBinaryFile("dynamic.dylib")).toBe(true);
  expect(isBinaryFile("binary.bin")).toBe(true);
});

test("isBinaryFile detects archive extensions", () => {
  expect(isBinaryFile("archive.zip")).toBe(true);
  expect(isBinaryFile("backup.tar")).toBe(true);
  expect(isBinaryFile("compressed.gz")).toBe(true);
  expect(isBinaryFile("packed.7z")).toBe(true);
  expect(isBinaryFile("stored.rar")).toBe(true);
});

test("isBinaryFile detects document extensions", () => {
  expect(isBinaryFile("document.pdf")).toBe(true);
  expect(isBinaryFile("word.doc")).toBe(true);
  expect(isBinaryFile("word.docx")).toBe(true);
  expect(isBinaryFile("excel.xls")).toBe(true);
  expect(isBinaryFile("excel.xlsx")).toBe(true);
  expect(isBinaryFile("powerpoint.ppt")).toBe(true);
  expect(isBinaryFile("powerpoint.pptx")).toBe(true);
});

test("isBinaryFile detects database extensions", () => {
  expect(isBinaryFile("data.sqlite")).toBe(true);
  expect(isBinaryFile("data.db")).toBe(true);
  expect(isBinaryFile("data.sqlite3")).toBe(true);
});

test("isBinaryFile detects .DS_Store", () => {
  expect(isBinaryFile(".DS_Store")).toBe(true);
  expect(isBinaryFile("/path/to/.DS_Store")).toBe(true);
  expect(isBinaryFile("some/dir/.DS_Store")).toBe(true);
});

test("isBinaryFile returns false for text extensions", () => {
  expect(isBinaryFile("readme.md")).toBe(false);
  expect(isBinaryFile("code.ts")).toBe(false);
  expect(isBinaryFile("script.js")).toBe(false);
  expect(isBinaryFile("config.json")).toBe(false);
  expect(isBinaryFile("style.css")).toBe(false);
  expect(isBinaryFile("data.yaml")).toBe(false);
  expect(isBinaryFile("notes.txt")).toBe(false);
});

test("isBinaryFile checks buffer for null bytes", () => {
  // Buffer with null byte should be detected as binary
  const binaryBuffer = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x00, 0x21]);
  expect(isBinaryFile("unknown.xyz", binaryBuffer)).toBe(true);

  // Buffer without null bytes should not be detected as binary
  const textBuffer = Buffer.from("Hello, world!");
  expect(isBinaryFile("unknown.xyz", textBuffer)).toBe(false);
});

test("isBinaryFile handles case insensitivity", () => {
  expect(isBinaryFile("IMAGE.PNG")).toBe(true);
  expect(isBinaryFile("Document.PDF")).toBe(true);
  expect(isBinaryFile("ARCHIVE.ZIP")).toBe(true);
});

// ===== isBinaryFileAsync (with file content check) =====

test("isBinaryFileAsync detects binary by extension", async () => {
  expect(await isBinaryFileAsync(join(testDir, "image.png"))).toBe(true);
  expect(await isBinaryFileAsync(join(testDir, "doc.pdf"))).toBe(true);
  expect(await isBinaryFileAsync(join(testDir, "archive.zip"))).toBe(true);
});

test("isBinaryFileAsync returns false for text files", async () => {
  expect(await isBinaryFileAsync(join(testDir, "text.txt"))).toBe(false);
  expect(await isBinaryFileAsync(join(testDir, "code.ts"))).toBe(false);
  expect(await isBinaryFileAsync(join(testDir, "readme.md"))).toBe(false);
});

test("isBinaryFileAsync detects actual binary content", async () => {
  expect(await isBinaryFileAsync(join(testDir, "actual-binary.dat"))).toBe(true);
});

test("isBinaryFileAsync detects hidden binary content", async () => {
  // File has .txt extension but contains null bytes
  expect(await isBinaryFileAsync(join(testDir, "hidden-binary.txt"))).toBe(true);
});

test("isBinaryFileAsync detects .DS_Store", async () => {
  expect(await isBinaryFileAsync(join(testDir, ".DS_Store"))).toBe(true);
});

// ===== expandImports integration with binary detection =====

test("expandImports throws error for direct binary file import", async () => {
  const content = "@./image.png";
  await expect(expandImports(content, testDir)).rejects.toThrow("Cannot import binary file");
});

test("expandImports throws error for direct .DS_Store import", async () => {
  const content = "@./.DS_Store";
  await expect(expandImports(content, testDir)).rejects.toThrow("Cannot import binary file");
});

test("expandImports throws error for binary file with line range", async () => {
  const content = "@./image.png:1-10";
  await expect(expandImports(content, testDir)).rejects.toThrow("Cannot import binary file");
});

test("expandImports skips binary files in glob imports", async () => {
  const content = "@./mixed/*";
  const result = await expandImports(content, testDir);

  // Should include text file
  expect(result).toContain("const y = 2");

  // Should NOT include binary files
  expect(result).not.toContain("fake image");
  expect(result).not.toContain("fake pdf");
  expect(result).not.toContain("ds store");
});

test("expandImports allows text file imports", async () => {
  const content = "@./text.txt";
  const result = await expandImports(content, testDir);
  expect(result).toBe("Hello, world!");
});

test("expandImports allows code file imports", async () => {
  const content = "@./code.ts";
  const result = await expandImports(content, testDir);
  expect(result).toBe("const x = 1;");
});

test("expandImports allows markdown file imports", async () => {
  const content = "@./readme.md";
  const result = await expandImports(content, testDir);
  expect(result).toBe("# Readme\n\nContent here.");
});
