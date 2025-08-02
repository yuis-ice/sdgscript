/**
 * SDGScript Example: Climate Data Processing
 * Goal13: Climate Action focused implementation
 */

import { withSDGContext, trackResource, createSDGFetch } from '@sdgscript/runtime';

// SDGを考慮したfetch関数
const sdgFetch = createSDGFetch();

/**
 * @sdg Goal13 ClimateAction
 * @carbonBudget 2.0kWh
 * @impact environment high
 * @description Process weather data with energy efficiency in mind
 */
export async function processClimateData(locations: string[]): Promise<ClimateData[]> {
  return withSDGContext({
    goal: 'Goal13_ClimateAction',
    carbonBudget: 2.0,
    description: 'Climate data processing for carbon footprint analysis'
  }, async () => {
    
    const results: ClimateData[] = [];
    
    // バッチ処理でAPI呼び出しを最小化
    const batchSize = 5;
    for (let i = 0; i < locations.length; i += batchSize) {
      const batch = locations.slice(i, i + batchSize);
      
      // 並列処理で効率化
      const batchPromises = batch.map(async (location) => {
        trackResource('api_call', { 
          networkCalls: 1, 
          energy: 0.01 // kWh per API call
        });
        
        const response = await sdgFetch(`/api/climate/${location}`);
        const data = await response.json() as ClimateData;
        
        return data;
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // レート制限を考慮した適切な遅延
      if (i + batchSize < locations.length) {
        await delay(100); // 100ms delay
      }
    }
    
    return results;
  });
}

/**
 * @sdg Goal7 AffordableEnergy
 * @carbonBudget 0.5kWh  
 * @impact environment medium
 * @description Efficiently calculate carbon emissions
 */
export function calculateEmissions(data: ClimateData[]): EmissionSummary {
  return withSDGContext({
    goal: 'Goal7_AffordableEnergy',
    carbonBudget: 0.5
  }, () => {
    
    // メモリ効率的な計算
    let totalEmissions = 0;
    let processedCount = 0;
    
    // forEach よりもシンプルなforループでエネルギー効率を向上
    for (const item of data) {
      totalEmissions += item.co2Level;
      processedCount++;
    }
    
    trackResource('computation', {
      computeComplexity: processedCount,
      energy: processedCount * 0.0001 // kWh per calculation
    });
    
    return {
      totalEmissions,
      averageEmissions: totalEmissions / processedCount,
      processedCount,
      timestamp: new Date().toISOString()
    };
  });
}

/**
 * @sdg Goal12 ResponsibleConsumption
 * @carbonBudget 0.1kWh
 * @impact social medium
 * @description Cache results to reduce redundant processing
 */
export class EfficientDataCache {
  private cache = new Map<string, any>();
  private maxSize = 100; // メモリ使用量を制限
  
  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    return withSDGContext({
      goal: 'Goal12_ResponsibleConsumption',
      carbonBudget: 0.1,
      description: 'Responsible data caching to reduce resource consumption'
    }, async () => {
      
      if (this.cache.has(key)) {
        trackResource('cache_hit', { energy: 0.0001 });
        return this.cache.get(key);
      }
      
      // キャッシュサイズを制限
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      trackResource('cache_miss', { 
        energy: 0.01,
        ioOperations: 1 
      });
      
      const result = await fetcher();
      this.cache.set(key, result);
      
      return result;
    });
  }
}

// 型定義
interface ClimateData {
  location: string;
  temperature: number;
  humidity: number;
  co2Level: number;
  timestamp: string;
}

interface EmissionSummary {
  totalEmissions: number;
  averageEmissions: number;
  processedCount: number;
  timestamp: string;
}

// ユーティリティ関数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
