// Fails if any file in the working tree is untracked AND not gitignored —
// i.e. anything a plain `git add .` would sweep into the next commit
// without a deliberate decision. This project was originally scaffolded in
// an AI design tool that left its own runtime/sync files (support.js,
// github.md, .thumbnail, uploads/) sitting in the project directory,
// untracked and ungitignored — a `git add` before this check existed would
// have published all of it. See CLAUDE.md, "Design-tool scaffolding".
//
// Uses `git ls-files --others --exclude-standard`, which is exactly the
// set `git add -A` would newly stage: untracked files, minus whatever
// .gitignore already excludes.

import { spawnSync } from "node:child_process";

const repoCheck = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], { stdio: "ignore" });
if (repoCheck.status !== 0) {
  console.log("check:untracked: not a git repository yet — skipping (nothing can be committed until `git init`)");
  process.exit(0);
}

const result = spawnSync("git", ["ls-files", "--others", "--exclude-standard"], { encoding: "utf8" });
if (result.status !== 0) {
  console.error(result.stderr);
  process.exit(1);
}

const files = result.stdout.split("\n").filter(Boolean);

if (files.length > 0) {
  console.error("FAIL  the following files are untracked and NOT gitignored — `git add` would publish them:");
  for (const f of files) console.error(`      ${f}`);
  console.error("\nEither commit them intentionally, or add them to .gitignore.");
  process.exit(1);
}

console.log("OK    no unexpected untracked files");
process.exit(0);
