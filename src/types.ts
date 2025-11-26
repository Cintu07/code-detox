export interface FileInfo {
  path: string;
  content: string;
  extension: string;
}

export interface ImportInfo {
  source: string;
  specifiers: string[];
  line: number;
  isUsed: boolean;
}

export interface UnusedImport {
  file: string;
  line: number;
  importName: string;
  from: string;
}

export interface UnusedFile {
  path: string;
  reason: string;
}

export interface DeadCodeIssue {
  file: string;
  line: number;
  type: 'unreachable' | 'unused-var' | 'empty-catch' | 'unused-function';
  description: string;
  code?: string;
}

export interface DependencyIssue {
  name: string;
  type: 'unused' | 'missing';
  installedVersion?: string;
}

export interface DetoxReport {
  unusedImports: UnusedImport[];
  unusedFiles: UnusedFile[];
  deadCode: DeadCodeIssue[];
  dependencyIssues: DependencyIssue[];
  scannedFiles: number;
  timestamp: Date;
}

export interface ScanOptions {
  targetPath: string;
  deep?: boolean;
  fix?: boolean;
  json?: boolean;
  include?: string[];
  exclude?: string[];
}
