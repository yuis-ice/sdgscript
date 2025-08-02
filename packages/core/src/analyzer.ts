import { 
  Node, 
  JSDoc, 
  SourceFile, 
  FunctionDeclaration, 
  MethodDeclaration, 
  ArrowFunction,
  CallExpression,
  ForStatement,
  WhileStatement
} from 'ts-morph';
import { ResourceMetrics, Violation, SDGAnnotation } from './types.js';

/**
 * 静的解析によるリソース使用量推定
 */
export class ResourceAnalyzer {
  
  /**
   * 関数のリソース使用量を静的に推定
   */
  analyzeFunction(node: FunctionDeclaration | MethodDeclaration | ArrowFunction): ResourceMetrics {
    const metrics: ResourceMetrics = {
      energy: 0,
      emissions: 0,
      memory: 0,
      networkCalls: 0,
      ioOperations: 0,
      computeComplexity: 1
    };
    
    // ネットワーク呼び出しの検出
    this.countNetworkCalls(node, metrics);
    
    // ループの複雑さを解析
    this.analyzeLoops(node, metrics);
    
    // I/O操作の検出
    this.countIOOperations(node, metrics);
    
    // AIモデル呼び出しの検出
    this.detectAIModelUsage(node, metrics);
    
    // エネルギー使用量を推定
    this.estimateEnergyUsage(metrics);
    
    return metrics;
  }
  
  /**
   * ネットワーク呼び出しをカウント
   */
  private countNetworkCalls(node: Node, metrics: ResourceMetrics): void {
    node.forEachDescendant(descendant => {
      if (Node.isCallExpression(descendant)) {
        const expression = descendant.getExpression();
        const text = expression.getText();
        
        // fetch, axios, http等のAPI呼び出しを検出
        if (text.includes('fetch') || 
            text.includes('axios') || 
            text.includes('http.request') ||
            text.includes('$.ajax')) {
          metrics.networkCalls = (metrics.networkCalls || 0) + 1;
        }
      }
    });
  }
  
  /**
   * ループの複雑さを解析
   */
  private analyzeLoops(node: Node, metrics: ResourceMetrics): void {
    let loopDepth = 0;
    let maxDepth = 0;
    
    node.forEachDescendant(descendant => {
      if (Node.isForStatement(descendant) || 
          Node.isWhileStatement(descendant) ||
          Node.isForInStatement(descendant) ||
          Node.isForOfStatement(descendant)) {
        loopDepth++;
        maxDepth = Math.max(maxDepth, loopDepth);
      }
    });
    
    // ネストしたループの複雑さを指数的に増加
    metrics.computeComplexity = Math.pow(10, maxDepth);
  }
  
  /**
   * I/O操作をカウント
   */
  private countIOOperations(node: Node, metrics: ResourceMetrics): void {
    node.forEachDescendant(descendant => {
      if (Node.isCallExpression(descendant)) {
        const text = descendant.getExpression().getText();
        
        // ファイルI/O操作を検出
        if (text.includes('readFile') || 
            text.includes('writeFile') ||
            text.includes('fs.') ||
            text.includes('localStorage') ||
            text.includes('sessionStorage')) {
          metrics.ioOperations = (metrics.ioOperations || 0) + 1;
        }
      }
    });
  }
  
  /**
   * AIモデル使用を検出
   */
  private detectAIModelUsage(node: Node, metrics: ResourceMetrics): void {
    node.forEachDescendant(descendant => {
      if (Node.isCallExpression(descendant)) {
        const text = descendant.getExpression().getText();
        
        // AI/ML関連のAPIを検出
        if (text.includes('tensorflow') || 
            text.includes('torch') ||
            text.includes('openai') ||
            text.includes('huggingface') ||
            text.includes('predict') ||
            text.includes('inference')) {
          // AIモデルは高エネルギー消費
          metrics.energy = (metrics.energy || 0) + 50; // kWh
          metrics.computeComplexity = (metrics.computeComplexity || 1) * 1000;
        }
      }
    });
  }
  
  /**
   * エネルギー使用量を推定
   */
  private estimateEnergyUsage(metrics: ResourceMetrics): void {
    // 基本消費量
    let baseEnergy = 0.01; // kWh
    
    // ネットワーク呼び出しによる追加
    baseEnergy += (metrics.networkCalls || 0) * 0.001;
    
    // I/O操作による追加
    baseEnergy += (metrics.ioOperations || 0) * 0.0005;
    
    // 計算複雑さによる追加
    baseEnergy += Math.log10(metrics.computeComplexity || 1) * 0.01;
    
    metrics.energy = (metrics.energy || 0) + baseEnergy;
    
    // CO2排出量を推定（電力グリッドの平均排出係数: 500gCO2/kWh）
    metrics.emissions = (metrics.energy || 0) * 500;
  }
  
  /**
   * 違反を検出
   */
  detectViolations(
    metrics: ResourceMetrics, 
    annotations: SDGAnnotation[]
  ): Violation[] {
    const violations: Violation[] = [];
    
    // カーボンバジェット超過チェック
    for (const annotation of annotations) {
      if (annotation.carbonBudget && metrics.energy && 
          metrics.energy > annotation.carbonBudget) {
        violations.push({
          type: 'carbon_budget_exceeded',
          severity: 'error',
          message: `Energy usage (${metrics.energy.toFixed(3)}kWh) exceeds carbon budget (${annotation.carbonBudget}kWh)`,
          suggestion: 'Consider optimizing algorithms or reducing network calls'
        });
      }
    }
    
    // 非効率アルゴリズム検出
    if (metrics.computeComplexity && metrics.computeComplexity > 1000) {
      violations.push({
        type: 'inefficient_algorithm',
        severity: 'warning',
        message: 'High computational complexity detected',
        suggestion: 'Consider using more efficient algorithms or caching'
      });
    }
    
    // 高インパクトコードの未注釈チェック
    if (metrics.energy && metrics.energy > 10 && annotations.length === 0) {
      violations.push({
        type: 'high_impact_no_annotation',
        severity: 'warning',
        message: 'High energy consumption function lacks SDG annotations',
        suggestion: 'Add @sdg annotation to document sustainability impact'
      });
    }
    
    return violations;
  }
}
