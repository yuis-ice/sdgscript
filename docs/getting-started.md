# 🌍 SDGScript: Getting Started Guide

## Overview

SDGScript is a TypeScript superset that helps developers write sustainable code aligned with the United Nations Sustainable Development Goals (SDGs). It provides static analysis, runtime monitoring, and development tools to promote environmental and social responsibility in programming.

## Installation

```bash
npm install -g sdgscript
```

## Basic Usage

### 1. Project Initialization

```bash
mkdir my-sdg-project
cd my-sdg-project
sdgscript init
npm install
```

### 2. Adding SDGs Annotations

```typescript
/**
 * @sdg Goal13 ClimateAction
 * @carbonBudget 1.5kWh
 * @impact environment medium
 * @description Efficiently process climate data
 */
async function processClimateData(data: ClimateRecord[]): Promise<ProcessedData> {
  // Implementation
}
```

### 3. Running Static Analysis

```bash
sdgscript analyze src/
```

### 4. Checking Reports

```bash
# JSON format
sdgscript analyze src/ --format json -o report.json

# HTML format  
sdgscript analyze src/ --format html -o report.html

# Markdown format
sdgscript analyze src/ --format markdown -o report.md
```

## アノテーション一覧

### @sdg
SDGs目標を指定します。

```typescript
/**
 * @sdg Goal7 AffordableEnergy
 */
```

### @carbonBudget
関数の想定エネルギー消費量上限を指定します。

```typescript
/**
 * @carbonBudget 2.0kWh
 */
```

### @impact
環境・社会への影響度を指定します。

```typescript
/**
 * @impact environment high
 * @impact social medium  
 */
```

## 実行時API

### withSDGContext

SDGsコンテキスト内で関数を実行し、リソース使用量を追跡します。

```typescript
import { withSDGContext } from 'sdgscript/runtime';

const result = await withSDGContext({
  goal: 'Goal13_ClimateAction',
  carbonBudget: 1.0
}, async () => {
  // 処理
  return data;
});
```

### trackResource

手動でリソース使用量を記録します。

```typescript
import { trackResource } from 'sdgscript/runtime';

trackResource('api_call', {
  networkCalls: 1,
  energy: 0.01
});
```

## ESLint統合

`.eslintrc.json`：

```json
{
  "extends": ["@typescript-eslint/recommended"],
  "plugins": ["@sdgscript/eslint-plugin"],
  "rules": {
    "@sdgscript/require-sdg-annotation": "warn",
    "@sdgscript/avoid-inefficient-loops": "error", 
    "@sdgscript/limit-network-calls": "warn"
  }
}
```

## 設定ファイル

`sdgscript.config.yaml`：

```yaml
goals:
  - Goal7_AffordableEnergy
  - Goal13_ClimateAction

budgets:
  defaultCarbonBudget: 1.0
  maxNetworkCalls: 5

analysis:
  strictMode: false
  outputFormat: "json"
```

## 次のステップ

1. [SDGs目標一覧](./sdg-goals.md)を確認
2. [実用例](./examples/)を参照
3. [APIリファレンス](./api/)を読む
4. [ベストプラクティス](./best-practices.md)を学ぶ
