# CodeDetox

Clean your messy repository with one command.

CodeDetox is a CLI tool that analyzes JavaScript and TypeScript projects to detect unused code, dead files, stale components, and import rot. Built with AST parsing for accurate static analysis.

## Features

- Unused imports detector - identifies imports never referenced in code
- Unused files finder - detects files never imported by other modules
- Dead code detection - finds unreachable code, unused variables, empty catch blocks
- Dependency analysis - reports unused and missing package.json dependencies
- Auto-fix mode - automatically removes detected issues
- JSON output - export results for CI/CD integration

## Installation

```bash
npm install -g code-detox
```

Or use with npx:

```bash
npx code-detox scan
```

## Usage

### Scan Project

```bash
# Scan current directory
code-detox scan

# Scan specific path
code-detox scan ./src

# JSON output
code-detox scan --json

# Deep analysis
code-detox scan --deep
```

### Fix Issues

```bash
# Fix all detected issues
code-detox fix

# Fix only unused imports
code-detox fix --imports

# Remove unused files
code-detox fix --files

# Comment out dead code
code-detox fix --dead

# Preview changes without applying
code-detox fix --dry-run
```

### Targeted Analysis

```bash
# Show only unused imports
code-detox unused

# Show only dead code
code-detox dead

# Show only unused files
code-detox files
```

### Reports

```bash
# Generate report
code-detox report

# Save to file
code-detox report --output report.json --json
```

## What It Detects

### Unused Imports

Identifies imported modules, functions, or variables never used in the code.

```javascript
import moment from "moment"; // Flagged if never used
import React from "react"; // OK if used in JSX
```

### Unused Files

- Files never imported by any other file
- Components never referenced
- Files matching stale patterns (.old, .backup, .copy)

### Dead Code

- Code after return/throw statements
- Unused variables and functions
- Empty catch blocks
- Unreferenced function declarations

### Dependency Issues

- Packages in package.json never imported
- Imported packages missing from package.json
- Duplicate or conflicting config files

## Sample Output

```
CodeDetox Report — ./src

Scanned 127 files

Unused Imports (12)
  src/utils/math.ts:3 - 'moment' from 'moment'
  src/helpers/date.ts:5 - 'lodash' from 'lodash'

Unused Files (6)
  src/components/OldButton.jsx - Never imported
  src/utils/backup.js - Stale filename pattern

Dead Code (8)
  src/api/users.js:88 - Unreachable after return
  src/lib/cache.ts:45 - Unused variable 'oldCache'

Dependency Issues (5)
  Installed but unused: 'axios', 'lodash'
  Used but not installed: 'date-fns'

Total Issues: 31
```

## Architecture

```
src/
├── core/
│   ├── scanner.ts           # Main orchestrator
│   ├── graphBuilder.ts      # Dependency graph
│   ├── unusedFinder.ts      # Import analysis
│   ├── deadCodeDetector.ts  # AST analysis
│   ├── staleDetector.ts     # File analysis
│   ├── configAnalyzer.ts    # Package.json analysis
│   └── fixer.ts             # Auto-fix engine
├── utils/
│   ├── astParser.ts         # Babel AST parsing
│   └── fileUtils.ts         # File operations
└── cli/
    ├── index.ts             # CLI commands
    └── ui.ts                # Terminal output
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Code Quality
on: [pull_request]
jobs:
  detox:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npx code-detox scan --json > report.json
      - run: test $(jq '.unusedImports | length' report.json) -eq 0
```

## Configuration

Create `.detoxrc.json` in project root:

```json
{
  "exclude": ["**/*.test.ts", "**/*.spec.ts", "**/fixtures/**"],
  "entryPoints": ["src/index.ts", "src/main.ts"]
}
```

## Safety

- Always run with `--dry-run` first to preview changes
- Create backups before using `fix` mode
- Entry point files (index.ts, main.ts) are automatically excluded from unused file detection
- Test files and config files are skipped by default

## Development

```bash
git clone https://github.com/Cintu07/code-detox.git
cd code-detox
npm install
npm run build
npm link
code-detox scan
```

## Technical Details

- Uses Babel parser for AST analysis
- Builds dependency graph for accurate file usage tracking
- Analyzes scope and binding for unused variable detection
- Supports JavaScript, JSX, TypeScript, TSX
- Handles both ES modules and CommonJS

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

## Credits

My Coffee
