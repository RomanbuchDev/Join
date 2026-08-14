"use strict";

const { readFileSync, readdirSync } = require("node:fs");
const { extname, resolve } = require("node:path");

const MAX_LINES = 400;
const CHECKED_EXTENSIONS = new Set([".cjs", ".css", ".html", ".js", ".mjs"]);

// Dieselben Quellpfade wie in .github/workflows/code-quality.yml
// (Prettier, html-validate, stylelint, eslint)
const SOURCE_PATHS = [
  { dir: ".", recursive: false },
  { dir: "css", recursive: true },
  { dir: "html", recursive: true },
  { dir: "js", recursive: true },
  { dir: "quality", recursive: true },
];

function countLines(content) {
  return content === "" ? 0 : content.split(/\r\n|\r|\n/u).length;
}


function collectFiles(directory, recursive) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return recursive ? collectFiles(filePath, true) : [];
    }
    return entry.isFile() && CHECKED_EXTENSIONS.has(extname(entry.name))
      ? [filePath]
      : [];
  });
}


function findOversizedFiles(directory, maximum = MAX_LINES) {
  return SOURCE_PATHS.flatMap(({ dir, recursive }) =>
    collectFiles(resolve(directory, dir), recursive),
  )
    .map((filePath) => ({
      filePath,
      lines: countLines(readFileSync(filePath, "utf8")),
    }))
    .filter(({ lines }) => lines > maximum);
}


function runCheck(directory) {
  const violations = findOversizedFiles(directory);
  violations.forEach(({ filePath, lines }) => {
    process.stderr.write(
      `${filePath}: ${lines} Zeilen (maximal ${MAX_LINES})\n`,
    );
  });
  return violations.length === 0 ? 0 : 1;
}

if (require.main === module) {
  process.exitCode = runCheck(process.cwd());
}

module.exports = { countLines, findOversizedFiles };
