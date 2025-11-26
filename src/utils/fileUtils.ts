import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { glob } from 'glob';
import type { FileInfo } from '../types.js';

export class FileUtils {
  /**
   * Get all files matching patterns
   */
  static async getFiles(
    targetPath: string,
    patterns: string[] = ['**/*.{js,jsx,ts,tsx,py,go}'],
    exclude: string[] = ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'coverage/**']
  ): Promise<string[]> {
    const files: string[] = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: targetPath,
        absolute: true,
        ignore: exclude,
        nodir: true
      });
      files.push(...matches);
    }
    
    return [...new Set(files)]; // Remove duplicates
  }

  /**
   * Read file content
   */
  static async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  /**
   * Get file info
   */
  static async getFileInfo(filePath: string): Promise<FileInfo> {
    const content = await this.readFile(filePath);
    const extension = path.extname(filePath).slice(1);
    
    return {
      path: filePath,
      content,
      extension
    };
  }

  /**
   * Check if file exists
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get relative path
   */
  static getRelativePath(from: string, to: string): string {
    return path.relative(from, to);
  }

  /**
   * Resolve import path
   */
  static resolveImportPath(
    fromFile: string,
    importPath: string,
    extensions: string[] = ['.js', '.jsx', '.ts', '.tsx', '.json']
  ): string | null {
    // Handle node_modules
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      return null; // External module
    }

    const dir = path.dirname(fromFile);
    let resolved = path.resolve(dir, importPath);

    // Try with extensions
    if (!path.extname(resolved)) {
      for (const ext of extensions) {
        const withExt = resolved + ext;
        if (existsSync(withExt)) {
          return withExt;
        }
      }
      
      // Try index files
      for (const ext of extensions) {
        const indexFile = path.join(resolved, `index${ext}`);
        if (existsSync(indexFile)) {
          return indexFile;
        }
      }
    }

    return existsSync(resolved) ? resolved : null;
  }

  /**
   * Get package.json from directory
   */
  static async getPackageJson(dir: string): Promise<any> {
    const pkgPath = path.join(dir, 'package.json');
    try {
      const content = await this.readFile(pkgPath);
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Detect stale filenames
   */
  static isStaleFilename(filename: string): boolean {
    const stalePatterns = [
      /\.old$/i,
      /\.backup$/i,
      /\.copy$/i,
      /\.bak$/i,
      /_old$/i,
      /_backup$/i,
      /_copy$/i,
      /^old[-_]/i,
      /^backup[-_]/i,
      /\.deprecated/i
    ];

    const basename = path.basename(filename, path.extname(filename));
    return stalePatterns.some(pattern => pattern.test(basename));
  }
}
