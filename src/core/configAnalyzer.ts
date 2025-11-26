import path from 'path';
import { FileUtils } from '../utils/fileUtils.js';
import type { DependencyIssue } from '../types.js';

export class ConfigAnalyzer {
  /**
   * Analyze package.json for issues
   */
  static async analyzePackageJson(targetPath: string): Promise<{
    unusedDependencies: DependencyIssue[];
    missingDependencies: DependencyIssue[];
    unusedScripts: string[];
  }> {
    const pkg = await FileUtils.getPackageJson(targetPath);
    
    if (!pkg) {
      return {
        unusedDependencies: [],
        missingDependencies: [],
        unusedScripts: []
      };
    }

    const unusedDeps: DependencyIssue[] = [];
    const missingDeps: DependencyIssue[] = [];
    
    // Get all project files
    const files = await FileUtils.getFiles(targetPath, ['**/*.{js,jsx,ts,tsx}']);
    
    // Collect all imports from all files
    const allImports = new Set<string>();
    
    for (const file of files) {
      try {
        const content = await FileUtils.readFile(file);
        const isTypeScript = /\.tsx?$/.test(file);
        const { ASTParser } = await import('../utils/astParser.js');
        const imports = ASTParser.extractImports(content, isTypeScript);
        
        imports.forEach(imp => {
          // Extract package name (handle scoped packages)
          const pkgName = imp.source.startsWith('@')
            ? imp.source.split('/').slice(0, 2).join('/')
            : imp.source.split('/')[0];
          
          // Only track external packages
          if (!pkgName.startsWith('.') && !pkgName.startsWith('/')) {
            allImports.add(pkgName);
          }
        });
      } catch {
        // Skip files that can't be parsed
      }
    }

    // Check for unused dependencies
    const dependencies = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };

    for (const [depName, version] of Object.entries(dependencies)) {
      if (!allImports.has(depName)) {
        // Skip common build tools and type definitions
        const skipList = [
          'typescript',
          'eslint',
          'prettier',
          'jest',
          'vitest',
          'vite',
          'webpack',
          'rollup',
          'esbuild',
          '@types/'
        ];
        
        if (!skipList.some(skip => depName.includes(skip))) {
          unusedDeps.push({
            name: depName,
            type: 'unused',
            installedVersion: version as string
          });
        }
      }
    }

    // Check for missing dependencies
    for (const importedPkg of allImports) {
      if (!dependencies[importedPkg]) {
        missingDeps.push({
          name: importedPkg,
          type: 'missing'
        });
      }
    }

    // Analyze scripts (basic check)
    const unusedScripts: string[] = [];
    if (pkg.scripts) {
      const scripts = Object.keys(pkg.scripts);
      const commonScripts = ['build', 'dev', 'start', 'test', 'lint', 'format'];
      
      for (const script of scripts) {
        // Check for obviously stale scripts
        if (
          script.includes('old') ||
          script.includes('backup') ||
          script.includes('temp') ||
          script.includes('unused')
        ) {
          unusedScripts.push(script);
        }
      }
    }

    return {
      unusedDependencies: unusedDeps,
      missingDependencies: missingDeps,
      unusedScripts
    };
  }

  /**
   * Check for conflicting configs
   */
  static async findConfigConflicts(targetPath: string): Promise<string[]> {
    const conflicts: string[] = [];
    
    // Check for multiple config files of the same type
    const configGroups = {
      'ESLint': ['.eslintrc', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', 'eslint.config.js'],
      'Prettier': ['.prettierrc', '.prettierrc.js', '.prettierrc.json', '.prettierrc.yml'],
      'TypeScript': ['tsconfig.json', 'tsconfig.base.json'],
      'Jest': ['jest.config.js', 'jest.config.ts', 'jest.config.json']
    };

    for (const [toolName, configFiles] of Object.entries(configGroups)) {
      const existingConfigs: string[] = [];
      
      for (const configFile of configFiles) {
        const fullPath = path.join(targetPath, configFile);
        if (await FileUtils.fileExists(fullPath)) {
          existingConfigs.push(configFile);
        }
      }
      
      if (existingConfigs.length > 1) {
        conflicts.push(`Multiple ${toolName} configs found: ${existingConfigs.join(', ')}`);
      }
    }

    return conflicts;
  }
}
