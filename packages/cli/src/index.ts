#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { SDGCompiler, SDGAnalysisResult } from '@sdgscript/core';
import { generateReport } from './reporter.js';
import { version } from '../package.json';

const program = new Command();

program
  .name('sdgscript')
  .description('SDGScript - TypeScript superset for SDGs-aware programming')
  .version(version);

/**
 * analyze コマンド
 */
program
  .command('analyze')
  .argument('<path>', 'Path to analyze (file or directory)')
  .option('-o, --output <file>', 'Output file path', 'sdg-report.json')
  .option('-f, --format <format>', 'Output format (json|html|markdown)', 'json')
  .option('--strict', 'Enable strict mode', false)
  .option('--carbon-budget <number>', 'Default carbon budget in kWh', '1.0')
  .description('Analyze TypeScript code for SDGs compliance')
  .action(async (path: string, options) => {
    const spinner = ora('Analyzing code for SDGs compliance...').start();
    
    try {
      const compiler = new SDGCompiler({
        enableSDGChecks: true,
        strictMode: options.strict,
        carbonBudgetDefault: parseFloat(options.carbonBudget),
        outputFormat: options.format
      });
      
      // ファイルまたはディレクトリを追加
      if (path.endsWith('.ts') || path.endsWith('.tsx')) {
        compiler.addSourceFile(path);
      } else {
        compiler.addSourceFilesAtPaths([`${path}/**/*.ts`, `${path}/**/*.tsx`]);
      }
      
      const results = compiler.analyzeAll();
      
      spinner.succeed(`Analysis complete. Found ${results.length} functions/methods.`);
      
      // レポート生成
      await generateReport(results, options.output, options.format);
      
      // 結果サマリー表示
      displaySummary(results);
      
    } catch (error) {
      spinner.fail('Analysis failed');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

/**
 * build コマンド
 */
program
  .command('build')
  .argument('<input>', 'Input file or directory')
  .option('-o, --output <dir>', 'Output directory', 'dist')
  .description('Transpile SDGScript to TypeScript')
  .action(async (input: string, options) => {
    const spinner = ora('Transpiling SDGScript...').start();
    
    try {
      const compiler = new SDGCompiler();
      
      if (input.endsWith('.ts') || input.endsWith('.tsx')) {
        compiler.addSourceFile(input);
      } else {
        compiler.addSourceFilesAtPaths([`${input}/**/*.ts`, `${input}/**/*.tsx`]);
      }
      
      const transpiled = compiler.transpile();
      
      // ファイルを出力ディレクトリに保存
      // TODO: 実装詳細
      
      spinner.succeed('Transpilation complete');
      
    } catch (error) {
      spinner.fail('Transpilation failed');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

/**
 * init コマンド
 */
program
  .command('init')
  .option('--template <template>', 'Project template', 'basic')
  .description('Initialize a new SDGScript project')
  .action(async (options) => {
    const spinner = ora('Initializing SDGScript project...').start();
    
    try {
      // プロジェクトテンプレートを生成
      await initProject(options.template);
      
      spinner.succeed('Project initialized successfully');
      console.log(chalk.green('\nNext steps:'));
      console.log('  1. npm install');
      console.log('  2. npx sdgscript analyze src/');
      
    } catch (error) {
      spinner.fail('Initialization failed');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

/**
 * 結果サマリーを表示
 */
function displaySummary(results: SDGAnalysisResult[]): void {
  console.log('\n' + chalk.bold('📊 SDGs Analysis Summary'));
  console.log('─'.repeat(50));
  
  const totalFunctions = results.length;
  const annotatedFunctions = results.filter(r => r.sdgAnnotations.length > 0).length;
  const violationsCount = results.reduce((sum, r) => sum + r.violations.length, 0);
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalFunctions;
  
  console.log(`📁 Total functions analyzed: ${chalk.cyan(totalFunctions)}`);
  console.log(`📝 Functions with SDG annotations: ${chalk.green(annotatedFunctions)}`);
  console.log(`⚠️  Total violations: ${chalk.yellow(violationsCount)}`);
  console.log(`🏆 Average SDG score: ${chalk.blue(averageScore.toFixed(1))}/100`);
  
  // SDGs目標別統計
  const goalStats = new Map<string, number>();
  results.forEach(result => {
    result.sdgAnnotations.forEach(annotation => {
      const count = goalStats.get(annotation.goal) || 0;
      goalStats.set(annotation.goal, count + 1);
    });
  });
  
  if (goalStats.size > 0) {
    console.log('\n' + chalk.bold('🎯 SDGs Goals Coverage:'));
    goalStats.forEach((count, goal) => {
      console.log(`  ${goal}: ${chalk.green(count)} functions`);
    });
  }
  
  // 重要な違反を表示
  const criticalViolations = results
    .flatMap(r => r.violations.filter(v => v.severity === 'error'))
    .slice(0, 3);
  
  if (criticalViolations.length > 0) {
    console.log('\n' + chalk.bold('🚨 Critical Issues:'));
    criticalViolations.forEach(violation => {
      console.log(`  ${chalk.red('●')} ${violation.message}`);
    });
  }
}

/**
 * プロジェクト初期化
 */
async function initProject(template: string): Promise<void> {
  // TODO: テンプレートファイルの生成
  console.log(`Generating ${template} template...`);
}

program.parse();
