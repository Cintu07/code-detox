# Contributing to CodeDetox

Thank you for your interest in contributing to CodeDetox! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/code-detox.git`
3. Install dependencies: `npm install`
4. Build the project: `npm run build`

## Development

```bash
# Watch mode for development
npm run dev

# Test the CLI locally
npm start scan ./test-project

# Link for global testing
npm link
code-detox scan
```

## Project Structure

- `src/core/` - Core analysis engines
- `src/utils/` - Utility functions
- `src/cli/` - CLI interface
- `src/types.ts` - TypeScript type definitions

## Adding New Features

1. Create a new detector in `src/core/`
2. Add types to `src/types.ts`
3. Integrate into `src/core/scanner.ts`
4. Update CLI commands in `src/cli/index.ts`
5. Update README.md with examples

## Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Keep functions focused and small

## Testing

```bash
# Run tests (when implemented)
npm test

# Test on real projects
code-detox scan ../your-project
```

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Build: `npm run build`
4. Test thoroughly
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Ideas for Contributions

- Add support for more languages (Python, Go, Rust)
- Improve AST parsing accuracy
- Add more dead code patterns
- Optimize performance for large codebases
- Create VS Code extension
- Add test coverage
- Improve documentation
- Add configuration file support

## Questions?

Open an issue or discussion on GitHub!
