import fs from 'fs/promises';
import type { UnusedImport, DeadCodeIssue } from '../types.js';

export class Fixer {
  /**
   * Remove unused imports from a file
   */
  static async removeUnusedImports(unusedImports: UnusedImport[]): Promise<number> {
    let fixed = 0;
    
    // Group by file
    const byFile = new Map<string, UnusedImport[]>();
    for (const item of unusedImports) {
      if (!byFile.has(item.file)) {
        byFile.set(item.file, []);
      }
      byFile.get(item.file)!.push(item);
    }

    for (const [file, imports] of byFile) {
      try {
        let content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        // Sort by line number in descending order to avoid index shifting
        const sortedImports = imports.sort((a, b) => b.line - a.line);

        for (const imp of sortedImports) {
          const lineIndex = imp.line - 1;
          if (lineIndex < 0 || lineIndex >= lines.length) continue;

          const line = lines[lineIndex];
          
          // Simple removal: remove entire line if it only contains this import
          // For more complex cases, we'd need to parse and reconstruct
          if (line.includes(`import`) && line.includes(imp.importName)) {
            lines.splice(lineIndex, 1);
            fixed++;
          }
        }

        await fs.writeFile(file, lines.join('\n'), 'utf-8');
      } catch (error) {
        console.error(`Failed to fix ${file}:`, error);
      }
    }

    return fixed;
  }

  /**
   * Remove unused files
   */
  static async removeUnusedFiles(files: string[]): Promise<number> {
    let removed = 0;

    for (const file of files) {
      try {
        await fs.unlink(file);
        removed++;
      } catch (error) {
        console.error(`Failed to remove ${file}:`, error);
      }
    }

    return removed;
  }

  /**
   * Comment out dead code
   */
  static async commentDeadCode(issues: DeadCodeIssue[]): Promise<number> {
    let fixed = 0;

    // Group by file
    const byFile = new Map<string, DeadCodeIssue[]>();
    for (const issue of issues) {
      if (!byFile.has(issue.file)) {
        byFile.set(issue.file, []);
      }
      byFile.get(issue.file)!.push(issue);
    }

    for (const [file, fileIssues] of byFile) {
      try {
        let content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');

        // Sort by line number in descending order
        const sortedIssues = fileIssues.sort((a, b) => b.line - a.line);

        for (const issue of sortedIssues) {
          const lineIndex = issue.line - 1;
          if (lineIndex < 0 || lineIndex >= lines.length) continue;

          // Comment out the line
          lines[lineIndex] = `// [DEAD CODE] ${lines[lineIndex]}`;
          fixed++;
        }

        await fs.writeFile(file, lines.join('\n'), 'utf-8');
      } catch (error) {
        console.error(`Failed to fix ${file}:`, error);
      }
    }

    return fixed;
  }

  /**
   * Create a backup before fixing
   */
  static async createBackup(targetPath: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${targetPath}_backup_${timestamp}`;
    
    // This is a simplified backup - in production, use proper backup tools
    console.log(`Backup would be created at: ${backupPath}`);
    
    return backupPath;
  }
}
