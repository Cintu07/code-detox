import { FileUtils } from '../utils/fileUtils.js';
import { ASTParser } from '../utils/astParser.js';
import type { DeadCodeIssue } from '../types.js';

export class DeadCodeDetector {
  /**
   * Detect dead code in a single file
   */
  static async detectInFile(filePath: string): Promise<DeadCodeIssue[]> {
    const issues: DeadCodeIssue[] = [];
    
    try {
      const content = await FileUtils.readFile(filePath);
      const isTypeScript = /\.tsx?$/.test(filePath);

      // Find unreachable code
      const unreachable = ASTParser.findUnreachableCode(content, isTypeScript);
      for (const item of unreachable) {
        issues.push({
          file: filePath,
          line: item.line,
          type: 'unreachable',
          description: 'Unreachable code after return/throw statement'
        });
      }

      // Find unused variables
      const unusedVars = ASTParser.findUnusedVariables(content, isTypeScript);
      for (const item of unusedVars) {
        issues.push({
          file: filePath,
          line: item.line,
          type: 'unused-var',
          description: `Unused variable '${item.name}'`
        });
      }

      // Find empty catch blocks
      const emptyCatches = ASTParser.findEmptyCatchBlocks(content, isTypeScript);
      for (const item of emptyCatches) {
        issues.push({
          file: filePath,
          line: item.line,
          type: 'empty-catch',
          description: 'Empty catch block - errors are silently ignored'
        });
      }

    } catch (error) {
      // Skip files that can't be parsed
    }

    return issues;
  }

  /**
   * Detect dead code in multiple files
   */
  static async detectInFiles(files: string[]): Promise<DeadCodeIssue[]> {
    const allIssues: DeadCodeIssue[] = [];

    for (const file of files) {
      const issues = await this.detectInFile(file);
      allIssues.push(...issues);
    }

    return allIssues;
  }

  /**
   * Detect dead code in a project
   */
  static async detectInProject(targetPath: string): Promise<DeadCodeIssue[]> {
    const files = await FileUtils.getFiles(targetPath, ['**/*.{js,jsx,ts,tsx}']);
    return this.detectInFiles(files);
  }
}
