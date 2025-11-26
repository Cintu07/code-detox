# Twitter/X Posts for CodeDetox

## Tweet 1 (Main Launch)

Just shipped CodeDetox - a CLI tool that finds unused code in JavaScript/TypeScript projects.

Detects:

- Unused imports
- Dead code and unreachable logic
- Orphaned files
- Empty catch blocks
- Missing dependencies

npx code-detox scan

Open source. MIT licensed.

https://github.com/Cintu07/code-detox

---

## Tweet 2 (Technical Details)

CodeDetox uses Babel AST parsing to analyze your codebase.

It builds a dependency graph, tracks imports, and detects:

- Variables declared but never used
- Functions never called
- Files never imported
- Code after return statements

Works on JS, JSX, TS, TSX files.

---

## Tweet 3 (Use Case)

Before every deploy, run:

code-detox scan --json > report.json

Last scan found:

- 43 unused imports
- 18 orphaned components
- 12 empty catch blocks
- 8 unreachable code blocks

Clean codebase = faster builds = better performance.

---

## Tweet 4 (CI/CD)

Add CodeDetox to your CI pipeline:

npx code-detox scan --json
if [ $? -ne 0 ]; then exit 1; fi

Catch code rot before it ships to production.

GitHub Actions example in the repo.

---

## LinkedIn Post

CodeDetox: Static Analysis Tool for JavaScript/TypeScript

After working on large codebases, I noticed the same problems everywhere:

- Unused imports accumulating over time
- Dead files never cleaned up
- Empty error handlers hiding bugs
- Dependencies installed but never used

Built CodeDetox to solve this. It uses AST parsing to detect:

- Unused imports and variables
- Unreachable code blocks
- Orphaned files and components
- Missing dependencies

Key features:

- Auto-fix mode for safe cleanup
- JSON output for CI/CD integration
- Dependency graph analysis
- Support for JS, JSX, TS, TSX

MIT licensed and open source.

npm: code-detox
GitHub: https://github.com/Cintu07/code-detox

---

## Reddit r/javascript Post Title

CodeDetox: CLI tool to detect unused code, dead files, and import rot in JS/TS projects

## Reddit Post Body

Built a CLI tool that analyzes JavaScript and TypeScript projects to find code that should be removed.

What it detects:

- Unused imports (identifies imports never referenced)
- Unused files (files never imported anywhere)
- Dead code (unreachable code, unused variables, empty catch blocks)
- Dependency issues (packages installed but unused, or used but not in package.json)

How it works:

- Uses Babel to parse your code into an AST
- Builds a dependency graph to track imports
- Analyzes scope and binding for unused variables
- Checks for unreachable code after return/throw statements

Usage:

```bash
npx code-detox scan
code-detox fix --dry-run
code-detox scan --json > report.json
```

Can be integrated into CI/CD pipelines to catch code rot before deployment.

MIT licensed: https://github.com/Cintu07/code-detox

Feedback welcome.

---

## Dev.to Article Title

Building CodeDetox: A Static Analysis Tool for Detecting Unused Code

## Hacker News Title

CodeDetox: CLI tool for detecting unused code in JavaScript/TypeScript projects

## Product Hunt Description

Clean your messy codebase with one command.

CodeDetox analyzes JavaScript and TypeScript projects to detect unused imports, dead code, orphaned files, and dependency issues.

Built with Babel AST parsing for accurate static analysis. Includes auto-fix mode and JSON output for CI/CD integration.

Perfect for maintaining large codebases and catching code rot before it ships.
