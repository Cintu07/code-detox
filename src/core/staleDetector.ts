import { FileUtils } from '../utils/fileUtils.js';
import { GraphBuilder } from './graphBuilder.js';
import type { UnusedFile } from '../types.js';

export class StaleDetector {
  /**
   * Find unused files in the project
   */
  static async findUnusedFiles(targetPath: string): Promise<UnusedFile[]> {
    const unusedFiles: UnusedFile[] = [];
    
    // Get all files
    const files = await FileUtils.getFiles(targetPath, ['**/*.{js,jsx,ts,tsx,vue,svelte}']);
    
    // Build dependency graph
    const graphBuilder = new GraphBuilder();
    await graphBuilder.build(targetPath, files);
    
    // Common entry points to exclude
    const entryPoints = [
      'index',
      'main',
      'app',
      '_app',
      'server',
      'config',
      'vite.config',
      'webpack.config',
      'next.config',
      'tailwind.config',
      'jest.config',
      'test',
      'spec',
      '.test',
      '.spec'
    ];
    
    // Get unused files from graph
    const graphUnused = graphBuilder.getUnusedFiles(entryPoints);
    
    for (const file of graphUnused) {
      let reason = 'Never imported by any file';
      
      // Check if it's a stale filename
      if (FileUtils.isStaleFilename(file)) {
        reason = 'Stale filename pattern (old/backup/copy)';
      }
      
      unusedFiles.push({ path: file, reason });
    }
    
    return unusedFiles;
  }

  /**
   * Find component files that appear to be stale
   */
  static async findStaleComponents(targetPath: string): Promise<UnusedFile[]> {
    const staleComponents: UnusedFile[] = [];
    
    // Get component files
    const componentPatterns = [
      '**/components/**/*.{jsx,tsx,vue,svelte}',
      '**/Components/**/*.{jsx,tsx,vue,svelte}'
    ];
    
    const files = await FileUtils.getFiles(targetPath, componentPatterns);
    
    // Build dependency graph
    const graphBuilder = new GraphBuilder();
    await graphBuilder.build(targetPath);
    
    for (const file of files) {
      const node = graphBuilder.getNode(file);
      
      if (!node) continue;
      
      // Check if never imported
      if (node.importedBy.length === 0) {
        staleComponents.push({
          path: file,
          reason: 'Component never imported'
        });
      }
      
      // Check for stale naming
      if (FileUtils.isStaleFilename(file)) {
        staleComponents.push({
          path: file,
          reason: 'Stale component name'
        });
      }
    }
    
    return staleComponents;
  }

  /**
   * Find duplicate files (similar names)
   */
  static async findDuplicates(targetPath: string): Promise<Map<string, string[]>> {
    const files = await FileUtils.getFiles(targetPath);
    const duplicates = new Map<string, string[]>();
    
    // Group by basename without extension
    const groups = new Map<string, string[]>();
    
    for (const file of files) {
      const basename = file.split(/[\\/]/).pop()?.replace(/\.(js|jsx|ts|tsx|py|go)$/, '') || '';
      const normalized = basename.toLowerCase();
      
      if (!groups.has(normalized)) {
        groups.set(normalized, []);
      }
      groups.get(normalized)!.push(file);
    }
    
    // Find groups with multiple files
    for (const [name, fileList] of groups) {
      if (fileList.length > 1) {
        duplicates.set(name, fileList);
      }
    }
    
    return duplicates;
  }
}
