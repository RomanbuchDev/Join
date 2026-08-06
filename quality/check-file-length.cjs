'use strict';

const { readFileSync, readdirSync } = require('node:fs');
const { extname, resolve } = require('node:path');

const MAX_LINES = 400;
const CHECKED_EXTENSIONS = new Set(['.cjs', '.css', '.html', '.js', '.mjs']);
const IGNORED_DIRECTORIES = new Set(['.git', 'coverage', 'dist', 'node_modules']);


function countLines(content) {
  return content === '' ? 0 : content.split(/\r\n|\r|\n/u).length;
}


function collectFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = resolve(directory, entry.name);
    if (entry.isDirectory() && !IGNORED_DIRECTORIES.has(entry.name)) {
      return collectFiles(filePath);
    }
    return entry.isFile() && CHECKED_EXTENSIONS.has(extname(entry.name))
      ? [filePath]
      : [];
  });
}


function findOversizedFiles(directory, maximum = MAX_LINES) {
  return collectFiles(directory)
    .map((filePath) => ({
      filePath,
      lines: countLines(readFileSync(filePath, 'utf8')),
    }))
    .filter(({ lines }) => lines > maximum);
}


function runCheck(directory) {
  const violations = findOversizedFiles(directory);
  violations.forEach(({ filePath, lines }) => {
    process.stderr.write(`${filePath}: ${lines} Zeilen (maximal ${MAX_LINES})\n`);
  });
  return violations.length === 0 ? 0 : 1;
}


if (require.main === module) {
  process.exitCode = runCheck(process.cwd());
}

module.exports = { countLines, findOversizedFiles };
