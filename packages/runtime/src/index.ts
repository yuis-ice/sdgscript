import { SDGGoal, ResourceMetrics } from '@sdgscript/core';

/**
 * 実行時SDGsコンテキスト
 */
export interface SDGContext {
  goal: SDGGoal | string;
  carbonBudget?: number; // kWh
  description?: string;
  startTime?: number;
  maxDuration?: number; // ms
}

/**
 * リソース使用量トラッカー
 */
export class ResourceTracker {
  private static instance: ResourceTracker;
  private activeContexts: Map<string, SDGContext> = new Map();
  private metrics: Map<string, ResourceMetrics> = new Map();
  private listeners: Set<(event: TrackingEvent) => void> = new Set();
  
  static getInstance(): ResourceTracker {
    if (!ResourceTracker.instance) {
      ResourceTracker.instance = new ResourceTracker();
    }
    return ResourceTracker.instance;
  }
  
  /**
   * イベントリスナーを追加
   */
  addEventListener(listener: (event: TrackingEvent) => void): void {
    this.listeners.add(listener);
  }
  
  /**
   * イベントリスナーを削除
   */
  removeEventListener(listener: (event: TrackingEvent) => void): void {
    this.listeners.delete(listener);
  }
  
  /**
   * イベントを発火
   */
  private emit(event: TrackingEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('Error in tracking event listener:', error);
      }
    });
  }
  
  /**
   * SDGコンテキストを開始
   */
  startContext(id: string, context: SDGContext): void {
    context.startTime = Date.now();
    this.activeContexts.set(id, context);
    this.metrics.set(id, {
      energy: 0,
      emissions: 0,
      memory: 0,
      networkCalls: 0,
      ioOperations: 0,
      computeComplexity: 1
    });
    
    this.emit({
      type: 'context_started',
      contextId: id,
      context,
      timestamp: Date.now()
    });
  }
  
  /**
   * SDGコンテキストを終了
   */
  endContext(id: string): ResourceMetrics | null {
    const context = this.activeContexts.get(id);
    const metrics = this.metrics.get(id);
    
    if (!context || !metrics) {
      return null;
    }
    
    const duration = Date.now() - (context.startTime || 0);
    
    // カーボンバジェット超過チェック
    if (context.carbonBudget && metrics.energy && metrics.energy > context.carbonBudget) {
      this.emit({
        type: 'carbon_budget_exceeded',
        contextId: id,
        context,
        metrics,
        timestamp: Date.now()
      });
    }
    
    this.emit({
      type: 'context_ended',
      contextId: id,
      context,
      metrics,
      duration,
      timestamp: Date.now()
    });
    
    this.activeContexts.delete(id);
    this.metrics.delete(id);
    
    return metrics;
  }
  
  /**
   * リソース使用量を記録
   */
  trackResource(contextId: string, resourceType: string, usage: Partial<ResourceMetrics>): void {
    const metrics = this.metrics.get(contextId);
    if (!metrics) {
      console.warn(`No active context found for ID: ${contextId}`);
      return;
    }
    
    // メトリクスを累積
    if (usage.energy) metrics.energy = (metrics.energy || 0) + usage.energy;
    if (usage.emissions) metrics.emissions = (metrics.emissions || 0) + usage.emissions;
    if (usage.memory) metrics.memory = Math.max(metrics.memory || 0, usage.memory);
    if (usage.networkCalls) metrics.networkCalls = (metrics.networkCalls || 0) + usage.networkCalls;
    if (usage.ioOperations) metrics.ioOperations = (metrics.ioOperations || 0) + usage.ioOperations;
    
    this.emit({
      type: 'resource_tracked',
      contextId,
      resourceType,
      usage,
      totalMetrics: { ...metrics },
      timestamp: Date.now()
    });
  }
  
  /**
   * アクティブなコンテキスト一覧を取得
   */
  getActiveContexts(): Map<string, SDGContext> {
    return new Map(this.activeContexts);
  }
  
  /**
   * 現在のメトリクスを取得
   */
  getCurrentMetrics(contextId: string): ResourceMetrics | null {
    return this.metrics.get(contextId) || null;
  }
}

/**
 * トラッキングイベント
 */
export interface TrackingEvent {
  type: 'context_started' | 'context_ended' | 'resource_tracked' | 'carbon_budget_exceeded';
  contextId: string;
  context?: SDGContext;
  metrics?: ResourceMetrics;
  resourceType?: string;
  usage?: Partial<ResourceMetrics>;
  totalMetrics?: ResourceMetrics;
  duration?: number;
  timestamp: number;
}

/**
 * SDGコンテキスト内で関数を実行
 */
export async function withSDGContext<T>(
  context: SDGContext,
  fn: () => Promise<T> | T
): Promise<T> {
  const contextId = `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tracker = ResourceTracker.getInstance();
  
  tracker.startContext(contextId, context);
  
  try {
    // パフォーマンス監視開始
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    const result = await fn();
    
    // パフォーマンス監視終了
    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const duration = endTime - startTime;
    const memoryUsed = Math.max(0, endMemory - startMemory) / (1024 * 1024); // MB
    
    // 実行時間とメモリ使用量を記録
    tracker.trackResource(contextId, 'execution', {
      memory: memoryUsed,
      energy: duration * 0.000001 // 非常に簡易的な推定
    });
    
    return result;
  } finally {
    tracker.endContext(contextId);
  }
}

/**
 * リソース使用量を手動で記録
 */
export function trackResource(resourceType: string, usage: Partial<ResourceMetrics>): void {
  const tracker = ResourceTracker.getInstance();
  const activeContexts = tracker.getActiveContexts();
  
  // アクティブなすべてのコンテキストに記録
  for (const [contextId] of activeContexts) {
    tracker.trackResource(contextId, resourceType, usage);
  }
}

/**
 * ネットワーク呼び出しを監視するフェッチラッパー
 */
export function createSDGFetch(originalFetch: typeof fetch = fetch) {
  return async function sdgFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const startTime = performance.now();
    
    try {
      const response = await originalFetch(input, init);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // ネットワーク呼び出しとレスポンスサイズを推定
      const estimatedEnergy = duration * 0.00001; // 簡易的な推定
      
      trackResource('network', {
        networkCalls: 1,
        energy: estimatedEnergy,
        emissions: estimatedEnergy * 500 // gCO2
      });
      
      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      trackResource('network_error', {
        networkCalls: 1,
        energy: duration * 0.00001
      });
      
      throw error;
    }
  };
}

// デフォルトエクスポート
export default {
  withSDGContext,
  trackResource,
  ResourceTracker,
  createSDGFetch
};
