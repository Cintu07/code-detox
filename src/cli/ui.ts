import picocolors from 'picocolors';
import path from 'path';
import type { DetoxReport } from '../types.js';

export class UI {
  /**
   * Print the ASCII logo
   */
  static printLogo(): void {
    const logo = `
${picocolors.cyan('╔════════════════════════════════╗')}
${picocolors.cyan('║')}  ${picocolors.bold(picocolors.magenta('CODE DETOX'))}            ${picocolors.cyan('║')}
${picocolors.cyan('║')}  ${picocolors.dim('cleanse your repo.')}      ${picocolors.cyan('║')}
${picocolors.cyan('╚════════════════════════════════╝')}
`;
    console.log(logo);
  }

  /**
   * Print a section header
   */
  static printSection(icon: string, title: string, count: number): void {
    console.log(`\n${icon} ${picocolors.bold(title)} ${picocolors.dim(`(${count})`)}`);
  }

  /**
   * Print the full report
   */
  static printReport(report: DetoxReport, targetPath: string): void {
    this.printLogo();
    
    console.log(picocolors.bold(`\n🧹 CodeDetox Report — ${picocolors.cyan(targetPath)}\n`));
    console.log(picocolors.dim(`Scanned ${report.scannedFiles} files`));
    console.log(picocolors.dim(`Generated at ${report.timestamp.toLocaleString()}\n`));

    // Unused Imports
    if (report.unusedImports.length > 0) {
      this.printSection('🔥', 'Unused Imports', report.unusedImports.length);
      
      // Group by file
      const byFile = new Map<string, typeof report.unusedImports>();
      for (const item of report.unusedImports.slice(0, 20)) { // Limit display
        if (!byFile.has(item.file)) {
          byFile.set(item.file, []);
        }
        byFile.get(item.file)!.push(item);
      }

      for (const [file, imports] of byFile) {
        const relativePath = path.relative(targetPath, file);
        console.log(picocolors.yellow(`  ${relativePath}:`));
        
        for (const imp of imports) {
          console.log(
            picocolors.dim(`    line ${imp.line}`) +
            ` → '${picocolors.red(imp.importName)}' from '${picocolors.cyan(imp.from)}'`
          );
        }
      }

      if (report.unusedImports.length > 20) {
        console.log(picocolors.dim(`  ... and ${report.unusedImports.length - 20} more`));
      }
    }

    // Unused Files
    if (report.unusedFiles.length > 0) {
      this.printSection('🗑️', 'Unused Files', report.unusedFiles.length);
      
      for (const file of report.unusedFiles.slice(0, 15)) {
        const relativePath = path.relative(targetPath, file.path);
        console.log(`  ${picocolors.red('✗')} ${picocolors.yellow(relativePath)}`);
        console.log(`     ${picocolors.dim(file.reason)}`);
      }

      if (report.unusedFiles.length > 15) {
        console.log(picocolors.dim(`  ... and ${report.unusedFiles.length - 15} more`));
      }
    }

    // Dead Code
    if (report.deadCode.length > 0) {
      this.printSection('⚠️', 'Dead Code', report.deadCode.length);
      
      const byType = new Map<string, typeof report.deadCode>();
      for (const issue of report.deadCode.slice(0, 15)) {
        if (!byType.has(issue.type)) {
          byType.set(issue.type, []);
        }
        byType.get(issue.type)!.push(issue);
      }

      for (const [type, issues] of byType) {
        for (const issue of issues) {
          const relativePath = path.relative(targetPath, issue.file);
          console.log(
            `  ${picocolors.red('●')} ${picocolors.yellow(relativePath)}:${issue.line}`
          );
          console.log(`     ${picocolors.dim(issue.description)}`);
        }
      }

      if (report.deadCode.length > 15) {
        console.log(picocolors.dim(`  ... and ${report.deadCode.length - 15} more`));
      }
    }

    // Dependency Issues
    if (report.dependencyIssues.length > 0) {
      this.printSection('📦', 'Dependency Issues', report.dependencyIssues.length);
      
      const unused = report.dependencyIssues.filter(d => d.type === 'unused');
      const missing = report.dependencyIssues.filter(d => d.type === 'missing');

      if (unused.length > 0) {
        console.log(picocolors.dim('  Installed but unused:'));
        for (const dep of unused.slice(0, 10)) {
          console.log(`    ${picocolors.red('●')} '${picocolors.yellow(dep.name)}' ${picocolors.dim(`v${dep.installedVersion}`)}`);
        }
      }

      if (missing.length > 0) {
        console.log(picocolors.dim('  Used but not installed:'));
        for (const dep of missing.slice(0, 10)) {
          console.log(`    ${picocolors.red('●')} '${picocolors.cyan(dep.name)}'`);
        }
      }
    }

    // Summary
    console.log('\n' + picocolors.dim('─'.repeat(50)));
    const totalIssues =
      report.unusedImports.length +
      report.unusedFiles.length +
      report.deadCode.length +
      report.dependencyIssues.length;

    if (totalIssues === 0) {
      console.log(picocolors.green('\n✨ Your codebase is clean! No issues found.\n'));
    } else {
      console.log(picocolors.bold(`\n📊 Total Issues: ${picocolors.red(totalIssues.toString())}\n`));
      console.log(picocolors.dim('Run with --fix to automatically fix issues'));
      console.log(picocolors.dim('Run with --json to get JSON output\n'));
    }
  }

  /**
   * Print JSON report
   */
  static printJSON(report: DetoxReport): void {
    console.log(JSON.stringify(report, null, 2));
  }

  /**
   * Print success message
   */
  static printSuccess(message: string): void {
    console.log(picocolors.green(`✓ ${message}`));
  }

  /**
   * Print error message
   */
  static printError(message: string): void {
    console.log(picocolors.red(`✗ ${message}`));
  }

  /**
   * Print warning
   */
  static printWarning(message: string): void {
    console.log(picocolors.yellow(`⚠ ${message}`));
  }

  /**
   * Print info
   */
  static printInfo(message: string): void {
    console.log(picocolors.cyan(`ℹ ${message}`));
  }
}
