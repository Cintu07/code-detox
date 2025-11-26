#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import { Scanner } from '../core/scanner.js';
import { Fixer } from '../core/fixer.js';
import { UI } from './ui.js';
import type { ScanOptions } from '../types.js';

const program = new Command();

program
  .name('code-detox')
  .description('Clean your messy repo with one command')
  .version('1.0.0');

// Scan command
program
  .command('scan')
  .description('Scan project for unused code, dead files, and issues')
  .argument('[path]', 'Path to scan', '.')
  .option('--json', 'Output as JSON')
  .option('--deep', 'Deep analysis mode')
  .action(async (targetPath: string, options) => {
    try {
      const absolutePath = path.resolve(process.cwd(), targetPath);
      
      UI.printInfo(`Scanning ${absolutePath}...`);
      
      const scanOptions: ScanOptions = {
        targetPath: absolutePath,
        deep: options.deep,
        json: options.json
      };

      const report = await Scanner.scan(scanOptions);

      if (options.json) {
        UI.printJSON(report);
      } else {
        UI.printReport(report, absolutePath);
      }
    } catch (error) {
      UI.printError(`Scan failed: ${error}`);
      process.exit(1);
    }
  });

// Fix command
program
  .command('fix')
  .description('Automatically fix detected issues')
  .argument('[path]', 'Path to fix', '.')
  .option('--imports', 'Fix only unused imports')
  .option('--files', 'Remove only unused files')
  .option('--dead', 'Fix only dead code')
  .option('--dry-run', 'Show what would be fixed without making changes')
  .action(async (targetPath: string, options) => {
    try {
      const absolutePath = path.resolve(process.cwd(), targetPath);
      
      UI.printInfo(`Scanning ${absolutePath} for issues...`);
      
      const scanOptions: ScanOptions = {
        targetPath: absolutePath,
        fix: true
      };

      const report = await Scanner.scan(scanOptions);

      if (options.dryRun) {
        UI.printWarning('DRY RUN - No changes will be made');
        UI.printReport(report, absolutePath);
        return;
      }

      UI.printWarning('This will modify your code. Make sure you have a backup!');
      
      let fixed = 0;

      if (options.imports || (!options.files && !options.dead)) {
        UI.printInfo('Fixing unused imports...');
        const count = await Fixer.removeUnusedImports(report.unusedImports);
        UI.printSuccess(`Removed ${count} unused imports`);
        fixed += count;
      }

      if (options.files) {
        UI.printInfo('Removing unused files...');
        const filePaths = report.unusedFiles.map(f => f.path);
        const count = await Fixer.removeUnusedFiles(filePaths);
        UI.printSuccess(`Removed ${count} unused files`);
        fixed += count;
      }

      if (options.dead) {
        UI.printInfo('Commenting out dead code...');
        const count = await Fixer.commentDeadCode(report.deadCode);
        UI.printSuccess(`Commented ${count} dead code blocks`);
        fixed += count;
      }

      UI.printSuccess(`\n✨ Fixed ${fixed} issues!`);
    } catch (error) {
      UI.printError(`Fix failed: ${error}`);
      process.exit(1);
    }
  });

// Unused imports only
program
  .command('unused')
  .description('Show only unused imports')
  .argument('[path]', 'Path to scan', '.')
  .action(async (targetPath: string) => {
    try {
      const absolutePath = path.resolve(process.cwd(), targetPath);
      UI.printInfo(`Scanning for unused imports in ${absolutePath}...`);
      
      const unusedImports = await Scanner.scanUnusedImports(absolutePath);
      
      if (unusedImports.length === 0) {
        UI.printSuccess('No unused imports found!');
        return;
      }

      UI.printSection('🔥', 'Unused Imports', unusedImports.length);
      
      for (const item of unusedImports) {
        const relativePath = path.relative(absolutePath, item.file);
        console.log(`  ${relativePath}:${item.line} - '${item.importName}' from '${item.from}'`);
      }
    } catch (error) {
      UI.printError(`Scan failed: ${error}`);
      process.exit(1);
    }
  });

// Dead code only
program
  .command('dead')
  .description('Show only dead code')
  .argument('[path]', 'Path to scan', '.')
  .action(async (targetPath: string) => {
    try {
      const absolutePath = path.resolve(process.cwd(), targetPath);
      UI.printInfo(`Scanning for dead code in ${absolutePath}...`);
      
      const deadCode = await Scanner.scanDeadCode(absolutePath);
      
      if (deadCode.length === 0) {
        UI.printSuccess('No dead code found!');
        return;
      }

      UI.printSection('⚠️', 'Dead Code', deadCode.length);
      
      for (const issue of deadCode) {
        const relativePath = path.relative(absolutePath, issue.file);
        console.log(`  ${relativePath}:${issue.line} - ${issue.description}`);
      }
    } catch (error) {
      UI.printError(`Scan failed: ${error}`);
      process.exit(1);
    }
  });

// Files only
program
  .command('files')
  .description('Show only unused files')
  .argument('[path]', 'Path to scan', '.')
  .action(async (targetPath: string) => {
    try {
      const absolutePath = path.resolve(process.cwd(), targetPath);
      UI.printInfo(`Scanning for unused files in ${absolutePath}...`);
      
      const unusedFiles = await Scanner.scanUnusedFiles(absolutePath);
      
      if (unusedFiles.length === 0) {
        UI.printSuccess('No unused files found!');
        return;
      }

      UI.printSection('🗑️', 'Unused Files', unusedFiles.length);
      
      for (const file of unusedFiles) {
        const relativePath = path.relative(absolutePath, file.path);
        console.log(`  ${relativePath} - ${file.reason}`);
      }
    } catch (error) {
      UI.printError(`Scan failed: ${error}`);
      process.exit(1);
    }
  });

// Report command
program
  .command('report')
  .description('Generate a detailed report')
  .argument('[path]', 'Path to scan', '.')
  .option('--json', 'Output as JSON')
  .option('--output <file>', 'Save report to file')
  .action(async (targetPath: string, options) => {
    try {
      const absolutePath = path.resolve(process.cwd(), targetPath);
      
      UI.printInfo(`Generating report for ${absolutePath}...`);
      
      const scanOptions: ScanOptions = {
        targetPath: absolutePath,
        json: options.json
      };

      const report = await Scanner.scan(scanOptions);

      if (options.output) {
        const fs = await import('fs/promises');
        const content = options.json 
          ? JSON.stringify(report, null, 2)
          : `CodeDetox Report\nGenerated: ${report.timestamp}\n...`;
        
        await fs.writeFile(options.output, content, 'utf-8');
        UI.printSuccess(`Report saved to ${options.output}`);
      } else {
        if (options.json) {
          UI.printJSON(report);
        } else {
          UI.printReport(report, absolutePath);
        }
      }
    } catch (error) {
      UI.printError(`Report generation failed: ${error}`);
      process.exit(1);
    }
  });

// Purge command (deep clean)
program
  .command('purge')
  .description('Deep clean - remove all detected issues (DANGEROUS)')
  .argument('[path]', 'Path to purge', '.')
  .option('--confirm', 'Confirm purge operation')
  .action(async (targetPath: string, options) => {
    if (!options.confirm) {
      UI.printError('Purge is a destructive operation!');
      UI.printInfo('Run with --confirm to proceed');
      UI.printWarning('Make sure you have a backup of your code!');
      return;
    }

    try {
      const absolutePath = path.resolve(process.cwd(), targetPath);
      
      UI.printWarning(`PURGING ${absolutePath}...`);
      
      const scanOptions: ScanOptions = {
        targetPath: absolutePath,
        deep: true,
        fix: true
      };

      const report = await Scanner.scan(scanOptions);

      // Fix everything
      const importCount = await Fixer.removeUnusedImports(report.unusedImports);
      const deadCodeCount = await Fixer.commentDeadCode(report.deadCode);
      
      UI.printSuccess(`\n✨ Purge complete!`);
      UI.printSuccess(`  - Removed ${importCount} unused imports`);
      UI.printSuccess(`  - Commented ${deadCodeCount} dead code blocks`);
      UI.printWarning(`  - Found ${report.unusedFiles.length} unused files (review manually)`);
    } catch (error) {
      UI.printError(`Purge failed: ${error}`);
      process.exit(1);
    }
  });

program.parse();
