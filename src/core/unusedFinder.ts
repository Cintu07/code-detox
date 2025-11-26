import { FileUtils } from '../utils/fileUtils.js';
import { ASTParser } from '../utils/astParser.js';
import type { UnusedImport } from '../types.js';

export class UnusedFinder {
  /**
   * Find all unused imports in a file
   */
  static async findInFile(filePath: string): Promise<UnusedImport[]> {
    const unused: UnusedImport[] = [];
    
    try {
      const content = await FileUtils.readFile(filePath);
      const isTypeScript = /\.tsx?$/.test(filePath);

      // Get all imports
      const imports = ASTParser.extractImports(content, isTypeScript);
      
      // Get all identifiers used in the code
      const usedIdentifiers = ASTParser.extractIdentifiers(content, isTypeScript);

      // Check which imports are unused
      for (const imp of imports) {
        for (const specifier of imp.specifiers) {
          if (!usedIdentifiers.has(specifier)) {
            unused.push({
              file: filePath,
              line: imp.line,
              importName: specifier,
              from: imp.source
            });
          }
        }
      }

    } catch (error) {
      // Silently skip files that can't be parsed
    }

    return unused;
  }

  /**
   * Find unused imports in multiple files
   */
  static async findInFiles(files: string[]): Promise<UnusedImport[]> {
    const allUnused: UnusedImport[] = [];

    for (const file of files) {
      const unused = await this.findInFile(file);
      allUnused.push(...unused);
    }

    return allUnused;
  }

  /**
   * Find unused imports in a project
   */
  static async findInProject(targetPath: string): Promise<UnusedImport[]> {
    const files = await FileUtils.getFiles(targetPath, ['**/*.{js,jsx,ts,tsx}']);
    return this.findInFiles(files);
  }
}
