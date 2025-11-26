import { parse, ParserPlugin } from '@babel/parser';
import traverseModule from '@babel/traverse';
import * as t from '@babel/types';

// Handle ESM/CJS interop
const traverse = typeof traverseModule === 'function' ? traverseModule : (traverseModule as any).default;

export class ASTParser {
  /**
   * Parse JavaScript/TypeScript code to AST
   */
  static parse(code: string, isTypeScript: boolean = false) {
    try {
      const plugins: ParserPlugin[] = [
        'jsx',
        ...(isTypeScript ? ['typescript' as ParserPlugin] : []),
        'classProperties',
        'decorators-legacy',
        'dynamicImport',
        'objectRestSpread',
        'optionalChaining',
        'nullishCoalescingOperator'
      ];
      
      return parse(code, {
        sourceType: 'module',
        plugins
      });
    } catch (error) {
      throw new Error(`Failed to parse code: ${error}`);
    }
  }

  /**
   * Extract all imports from code
   */
  static extractImports(code: string, isTypeScript: boolean = false): Array<{
    source: string;
    specifiers: string[];
    line: number;
  }> {
    const ast = this.parse(code, isTypeScript);
    const imports: Array<{ source: string; specifiers: string[]; line: number }> = [];

    traverse(ast, {
      ImportDeclaration(path: any) {
        const specifiers: string[] = [];
        
        path.node.specifiers.forEach((spec: any) => {
          if (t.isImportDefaultSpecifier(spec)) {
            specifiers.push(spec.local.name);
          } else if (t.isImportSpecifier(spec)) {
            specifiers.push(spec.local.name);
          } else if (t.isImportNamespaceSpecifier(spec)) {
            specifiers.push(spec.local.name);
          }
        });

        imports.push({
          source: path.node.source.value,
          specifiers,
          line: path.node.loc?.start.line || 0
        });
      }
    });

    return imports;
  }

  /**
   * Extract all identifiers (variable/function references)
   */
  static extractIdentifiers(code: string, isTypeScript: boolean = false): Set<string> {
    const ast = this.parse(code, isTypeScript);
    const identifiers = new Set<string>();

    traverse(ast, {
      Identifier(path: any) {
        // Skip if this is a property key or binding
        if (
          path.parent.type === 'ObjectProperty' && path.parent.key === path.node ||
          path.parent.type === 'MemberExpression' && path.parent.property === path.node && !path.parent.computed
        ) {
          return;
        }

        // Skip import/export declarations
        if (
          t.isImportSpecifier(path.parent) ||
          t.isImportDefaultSpecifier(path.parent) ||
          t.isImportNamespaceSpecifier(path.parent)
        ) {
          return;
        }

        identifiers.add(path.node.name);
      }
    });

    return identifiers;
  }

  /**
   * Find unreachable code
   */
  static findUnreachableCode(code: string, isTypeScript: boolean = false): Array<{
    line: number;
    type: string;
  }> {
    const ast = this.parse(code, isTypeScript);
    const unreachable: Array<{ line: number; type: string }> = [];

    traverse(ast, {
      Function(path: any) {
        const body = path.node.body;
        if (!t.isBlockStatement(body)) return;

        let foundReturn = false;
        for (let i = 0; i < body.body.length; i++) {
          const stmt = body.body[i];
          
          if (foundReturn) {
            unreachable.push({
              line: stmt.loc?.start.line || 0,
              type: 'unreachable-after-return'
            });
          }

          if (t.isReturnStatement(stmt) || t.isThrowStatement(stmt)) {
            foundReturn = true;
          }
        }
      }
    });

    return unreachable;
  }

  /**
   * Find unused variables
   */
  static findUnusedVariables(code: string, isTypeScript: boolean = false): Array<{
    name: string;
    line: number;
  }> {
    const ast = this.parse(code, isTypeScript);
    const unused: Array<{ name: string; line: number }> = [];

    traverse(ast, {
      VariableDeclarator(path: any) {
        if (!t.isIdentifier(path.node.id)) return;
        
        const binding = path.scope.getBinding(path.node.id.name);
        if (binding && !binding.referenced) {
          unused.push({
            name: path.node.id.name,
            line: path.node.loc?.start.line || 0
          });
        }
      },
      FunctionDeclaration(path: any) {
        if (!path.node.id) return;
        
        const binding = path.scope.getBinding(path.node.id.name);
        if (binding && !binding.referenced && path.parent.type === 'Program') {
          unused.push({
            name: path.node.id.name,
            line: path.node.loc?.start.line || 0
          });
        }
      }
    });

    return unused;
  }

  /**
   * Find empty catch blocks
   */
  static findEmptyCatchBlocks(code: string, isTypeScript: boolean = false): Array<{
    line: number;
  }> {
    const ast = this.parse(code, isTypeScript);
    const emptyCatches: Array<{ line: number }> = [];

    traverse(ast, {
      CatchClause(path: any) {
        if (path.node.body.body.length === 0) {
          emptyCatches.push({
            line: path.node.loc?.start.line || 0
          });
        }
      }
    });

    return emptyCatches;
  }

  /**
   * Extract exports
   */
  static extractExports(code: string, isTypeScript: boolean = false): string[] {
    const ast = this.parse(code, isTypeScript);
    const exports: string[] = [];

    traverse(ast, {
      ExportNamedDeclaration(path: any) {
        if (path.node.declaration) {
          if (t.isVariableDeclaration(path.node.declaration)) {
            path.node.declaration.declarations.forEach((decl: any) => {
              if (t.isIdentifier(decl.id)) {
                exports.push(decl.id.name);
              }
            });
          } else if (
            t.isFunctionDeclaration(path.node.declaration) ||
            t.isClassDeclaration(path.node.declaration)
          ) {
            if (path.node.declaration.id) {
              exports.push(path.node.declaration.id.name);
            }
          }
        }
        
        path.node.specifiers.forEach((spec: any) => {
          if (t.isExportSpecifier(spec)) {
            const exportedName = t.isIdentifier(spec.exported) 
              ? spec.exported.name 
              : spec.exported.value;
            exports.push(exportedName);
          }
        });
      },
      ExportDefaultDeclaration(path: any) {
        exports.push('default');
      }
    });

    return exports;
  }
}
