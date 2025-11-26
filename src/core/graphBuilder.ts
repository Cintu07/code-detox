import path from 'path';
import { FileUtils } from '../utils/fileUtils.js';
import { ASTParser } from '../utils/astParser.js';

export interface DependencyNode {
  path: string;
  imports: string[]; // Files this imports
  importedBy: string[]; // Files that import this
  exports: string[];
}

export class GraphBuilder {
  private nodes: Map<string, DependencyNode> = new Map();

  /**
   * Build dependency graph for the project
   */
  async build(targetPath: string, files?: string[]): Promise<Map<string, DependencyNode>> {
    const allFiles = files || await FileUtils.getFiles(targetPath);
    
    // Initialize all nodes
    for (const file of allFiles) {
      this.nodes.set(file, {
        path: file,
        imports: [],
        importedBy: [],
        exports: []
      });
    }

    // Build relationships
    for (const file of allFiles) {
      await this.processFile(file, targetPath);
    }

    return this.nodes;
  }

  /**
   * Process a single file
   */
  private async processFile(filePath: string, rootPath: string): Promise<void> {
    const node = this.nodes.get(filePath);
    if (!node) return;

    try {
      const content = await FileUtils.readFile(filePath);
      const isTypeScript = /\.tsx?$/.test(filePath);

      // Extract imports
      const imports = ASTParser.extractImports(content, isTypeScript);
      
      for (const imp of imports) {
        const resolvedPath = FileUtils.resolveImportPath(filePath, imp.source);
        
        if (resolvedPath && this.nodes.has(resolvedPath)) {
          node.imports.push(resolvedPath);
          
          const importedNode = this.nodes.get(resolvedPath);
          if (importedNode) {
            importedNode.importedBy.push(filePath);
          }
        }
      }

      // Extract exports
      node.exports = ASTParser.extractExports(content, isTypeScript);

    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  /**
   * Get files that are never imported
   */
  getUnusedFiles(entryPoints: string[] = []): string[] {
    const unused: string[] = [];

    for (const [filePath, node] of this.nodes) {
      // Skip entry points
      if (entryPoints.some(entry => filePath.includes(entry))) {
        continue;
      }

      // Check if file is never imported
      if (node.importedBy.length === 0) {
        // Also check if it's a stale filename
        unused.push(filePath);
      }
    }

    return unused;
  }

  /**
   * Get node by path
   */
  getNode(filePath: string): DependencyNode | undefined {
    return this.nodes.get(filePath);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): Map<string, DependencyNode> {
    return this.nodes;
  }

  /**
   * Find circular dependencies
   */
  findCircularDependencies(): string[][] {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (node: string, path: string[]): void => {
      visited.add(node);
      recStack.add(node);
      path.push(node);

      const nodeData = this.nodes.get(node);
      if (nodeData) {
        for (const imported of nodeData.imports) {
          if (!visited.has(imported)) {
            dfs(imported, [...path]);
          } else if (recStack.has(imported)) {
            // Found a cycle
            const cycleStart = path.indexOf(imported);
            cycles.push(path.slice(cycleStart));
          }
        }
      }

      recStack.delete(node);
    };

    for (const node of this.nodes.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }
}
