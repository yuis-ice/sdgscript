import { Project, SourceFile } from 'ts-morph';
import { SDGAnnotationParser } from './parser.js';
import { ResourceAnalyzer } from './analyzer.js';
import { SDGAnalysisResult, CompilerOptions } from './types.js';

/**
 * SDGScriptコンパイラ
 * TypeScriptコードをSDGs準拠性の観点から解析・変換
 */
export class SDGCompiler {
  private project: Project;
  private parser: SDGAnnotationParser;
  private analyzer: ResourceAnalyzer;
  private options: CompilerOptions;
  
  constructor(options: Partial<CompilerOptions> = {}) {
    this.options = {
      enableSDGChecks: true,
      carbonBudgetDefault: 1.0, // kWh
      strictMode: false,
      outputFormat: 'json',
      ...options
    };
    
    this.project = new Project({
      tsConfigFilePath: 'tsconfig.json'
    });
    
    this.parser = new SDGAnnotationParser();
    this.analyzer = new ResourceAnalyzer();
  }
  
  /**
   * ソースファイルを追加
   */
  addSourceFile(filePath: string): SourceFile {
    return this.project.addSourceFileAtPath(filePath);
  }
  
  /**
   * ディレクトリを再帰的に追加
   */
  addSourceFilesAtPaths(globPatterns: string[]): SourceFile[] {
    return this.project.addSourceFilesAtPaths(globPatterns);
  }
  
  /**
   * 全ソースファイルを解析
   */
  analyzeAll(): SDGAnalysisResult[] {
    const results: SDGAnalysisResult[] = [];
    
    for (const sourceFile of this.project.getSourceFiles()) {
      const fileResults = this.analyzeSourceFile(sourceFile);
      results.push(...fileResults);
    }
    
    return results;
  }
  
  /**
   * 単一ソースファイルを解析
   */
  analyzeSourceFile(sourceFile: SourceFile): SDGAnalysisResult[] {
    const results: SDGAnalysisResult[] = [];
    const annotationMap = this.parser.extractFromSourceFile(sourceFile);
    
    // 関数解析
    sourceFile.getFunctions().forEach(func => {
      const name = func.getName();
      if (name) {
        const annotations = annotationMap.get(name) || [];
        const metrics = this.analyzer.analyzeFunction(func);
        const violations = this.analyzer.detectViolations(metrics, annotations);
        
        results.push({
          functionName: name,
          filePath: sourceFile.getFilePath(),
          line: func.getStartLineNumber(),
          sdgAnnotations: annotations,
          estimatedMetrics: metrics,
          violations,
          score: this.calculateScore(metrics, violations, annotations)
        });
      }
    });
    
    // クラスメソッド解析
    sourceFile.getClasses().forEach(cls => {
      cls.getMethods().forEach(method => {
        const name = `${cls.getName()}.${method.getName()}`;
        const annotations = annotationMap.get(name) || [];
        const metrics = this.analyzer.analyzeFunction(method);
        const violations = this.analyzer.detectViolations(metrics, annotations);
        
        results.push({
          functionName: name,
          filePath: sourceFile.getFilePath(),
          line: method.getStartLineNumber(),
          sdgAnnotations: annotations,
          estimatedMetrics: metrics,
          violations,
          score: this.calculateScore(metrics, violations, annotations)
        });
      });
    });
    
    return results;
  }
  
  /**
   * SDGsスコアを計算（0-100）
   */
  private calculateScore(
    metrics: any, 
    violations: any[], 
    annotations: any[]
  ): number {
    let score = 100;
    
    // 違反によるペナルティ
    violations.forEach(violation => {
      score -= violation.severity === 'error' ? 20 : 10;
    });
    
    // エネルギー効率によるボーナス/ペナルティ
    if (metrics.energy !== undefined) {
      if (metrics.energy < 0.1) score += 10; // 低エネルギー消費
      else if (metrics.energy > 10) score -= 15; // 高エネルギー消費
    }
    
    // SDGアノテーションによるボーナス
    score += annotations.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * TypeScriptコードに変換（SDG構文を除去）
   */
  transpile(): Map<string, string> {
    const transpiled = new Map<string, string>();
    
    for (const sourceFile of this.project.getSourceFiles()) {
      // SDG関連のコメントとアノテーションを保持
      // 実際のトランスパイル処理では、SDG構文を通常のTSに変換
      const content = sourceFile.getFullText();
      transpiled.set(sourceFile.getFilePath(), content);
    }
    
    return transpiled;
  }
  
  /**
   * プロジェクトを保存
   */
  async save(): Promise<void> {
    await this.project.save();
  }
}
