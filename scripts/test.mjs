// Runs the game-logic tests with Node's built-in test runner, so no test framework is needed.
// tsc compiles types/, utils/ and tests/ to CommonJS in .test-build/, the "@/" path alias is
// rewritten to relative requires (tsc leaves it alone), then node --test runs the compiled tests.

import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '.test-build');

function run(args) {
  const { status } = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (status !== 0) {
    process.exit(status ?? 1);
  }
}

function listJsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listJsFiles(path);
    return entry.name.endsWith('.js') ? [path] : [];
  });
}

rmSync(outDir, { recursive: true, force: true });

const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');
run([tsc, '-p', 'tsconfig.test.json']);

for (const file of listJsFiles(outDir)) {
  const source = readFileSync(file, 'utf8');
  const rewritten = source.replace(/require\((['"])@\/([^'"]+)\1\)/g, (_, quote, target) => {
    let path = relative(dirname(file), join(outDir, target)).split(sep).join('/');
    if (!path.startsWith('.')) path = `./${path}`;
    return `require(${quote}${path}${quote})`;
  });
  if (rewritten !== source) {
    writeFileSync(file, rewritten);
  }
}

const testFiles = listJsFiles(join(outDir, 'tests')).filter(file => file.endsWith('.test.js')).sort();
run(['--test', ...testFiles]);
