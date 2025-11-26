import { FileUtils } from '../utils/fileUtils.js';
import { UnusedFinder } from './unusedFinder.js';
import { StaleDetector } from './staleDetector.js';
import { DeadCodeDetector } from './deadCodeDetector.js';
import { ConfigAnalyzer } from './configAnalyzer.js';
import type { DetoxReport, ScanOptions } from '../types.js';

export class Scanner {
  /**
   * Run a full scan of the project
   */
  static async scan(options: ScanOptions): Promise<DetoxReport> {
    const { targetPath } = options;
    
    // Get all files to scan
    const files = await FileUtils.getFiles(targetPath);
    
    // Run all detectors in parallel
    const [unusedImports, unusedFiles, deadCode, packageAnalysis] = await Promise.all([
      UnusedFinder.findInProject(targetPath),
      StaleDetector.findUnusedFiles(targetPath),
      DeadCodeDetector.detectInProject(targetPath),
      ConfigAnalyzer.analyzePackageJson(targetPath)
    ]);

    const dependencyIssues = [
      ...packageAnalysis.unusedDependencies,
      ...packageAnalysis.missingDependencies
    ];

    return {
      unusedImports,
      unusedFiles,
      deadCode,
      dependencyIssues,
      scannedFiles: files.length,
      timestamp: new Date()
    };
  }

  /**
   * Scan only for unused imports
   */
  static async scanUnusedImports(targetPath: string) {
    return UnusedFinder.findInProject(targetPath);
  }

  /**
   * Scan only for dead code
   */
  static async scanDeadCode(targetPath: string) {
    return DeadCodeDetector.detectInProject(targetPath);
  }

  /**
   * Scan only for unused files
   */
  static async scanUnusedFiles(targetPath: string) {
    return StaleDetector.findUnusedFiles(targetPath);
  }
}
