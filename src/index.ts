/**
 * SDGScript - TypeScript Superset for SDGs-aware Programming
 * 
 * A comprehensive toolkit for sustainable software development aligned with
 * the United Nations Sustainable Development Goals.
 */

// Core exports - AST analysis and transformation
export * from '@sdgscript/core';

// Runtime exports - real-time monitoring and tracking  
export * from '@sdgscript/runtime';

// CLI exports - command-line interface tools
export * as cli from '@sdgscript/cli';

// ESLint exports - linting rules and developer tools
export * as eslintPlugin from '@sdgscript/eslint-plugin';

// Main compiler and runtime as default exports
export { default as SDGCompiler } from '@sdgscript/core';
export { default as runtime } from '@sdgscript/runtime';

/**
 * Version information
 */
export const version = '0.1.0';

/**
 * Supported SDG Goals
 */
export const supportedGoals = [
  'Goal1_NoPoverty',
  'Goal4_QualityEducation', 
  'Goal5_GenderEquality',
  'Goal7_AffordableEnergy',
  'Goal12_ResponsibleConsumption',
  'Goal13_ClimateAction'
] as const;
