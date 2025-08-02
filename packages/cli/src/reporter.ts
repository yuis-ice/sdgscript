import fs from 'fs-extra';
import { SDGAnalysisResult } from '@sdgscript/core';

/**
 * レポート生成機能
 */

export async function generateReport(
  results: SDGAnalysisResult[],
  outputPath: string,
  format: 'json' | 'html' | 'markdown'
): Promise<void> {
  switch (format) {
    case 'json':
      await generateJSONReport(results, outputPath);
      break;
    case 'html':
      await generateHTMLReport(results, outputPath);
      break;
    case 'markdown':
      await generateMarkdownReport(results, outputPath);
      break;
  }
}

/**
 * JSON形式のレポート生成
 */
async function generateJSONReport(results: SDGAnalysisResult[], outputPath: string): Promise<void> {
  const report = {
    timestamp: new Date().toISOString(),
    summary: generateSummary(results),
    results: results
  };
  
  await fs.writeJSON(outputPath, report, { spaces: 2 });
  console.log(`📄 JSON report saved to ${outputPath}`);
}

/**
 * HTML形式のレポート生成
 */
async function generateHTMLReport(results: SDGAnalysisResult[], outputPath: string): Promise<void> {
  const summary = generateSummary(results);
  
  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SDGScript Analysis Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 2rem; }
        .header { background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .metric { background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2rem; font-weight: bold; color: #495057; }
        .metric-label { color: #6c757d; }
        .results { margin-top: 2rem; }
        .result-item { border: 1px solid #dee2e6; margin: 1rem 0; padding: 1rem; border-radius: 8px; }
        .function-name { font-weight: bold; color: #495057; }
        .score { float: right; padding: 0.25rem 0.5rem; border-radius: 4px; color: white; }
        .score.high { background: #28a745; }
        .score.medium { background: #ffc107; }
        .score.low { background: #dc3545; }
        .violations { margin-top: 0.5rem; }
        .violation { padding: 0.25rem 0.5rem; margin: 0.25rem 0; border-radius: 4px; }
        .violation.error { background: #f8d7da; color: #721c24; }
        .violation.warning { background: #fff3cd; color: #856404; }
        .sdg-goals { margin-top: 0.5rem; }
        .sdg-goal { display: inline-block; background: #007bff; color: white; padding: 0.25rem 0.5rem; margin: 0.25rem; border-radius: 4px; font-size: 0.8rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌍 SDGScript Analysis Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <div class="metric-value">${summary.totalFunctions}</div>
            <div class="metric-label">Total Functions</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.annotatedFunctions}</div>
            <div class="metric-label">SDG Annotated</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.totalViolations}</div>
            <div class="metric-label">Violations</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.averageScore.toFixed(1)}</div>
            <div class="metric-label">Average Score</div>
        </div>
    </div>
    
    <div class="results">
        <h2>📊 Detailed Results</h2>
        ${results.map(result => `
            <div class="result-item">
                <div class="function-name">
                    ${result.functionName}
                    <span class="score ${getScoreClass(result.score)}">${result.score}/100</span>
                </div>
                <div style="color: #6c757d; font-size: 0.9rem;">
                    ${result.filePath}:${result.line}
                </div>
                
                ${result.sdgAnnotations.length > 0 ? `
                    <div class="sdg-goals">
                        ${result.sdgAnnotations.map(annotation => `
                            <span class="sdg-goal">${annotation.goal}</span>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${result.violations.length > 0 ? `
                    <div class="violations">
                        ${result.violations.map(violation => `
                            <div class="violation ${violation.severity}">
                                <strong>${violation.type}:</strong> ${violation.message}
                                ${violation.suggestion ? `<br><em>💡 ${violation.suggestion}</em>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #6c757d;">
                    Energy: ${result.estimatedMetrics.energy?.toFixed(3) || 'N/A'}kWh | 
                    Emissions: ${result.estimatedMetrics.emissions?.toFixed(1) || 'N/A'}gCO₂ |
                    Network Calls: ${result.estimatedMetrics.networkCalls || 0}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

  await fs.writeFile(outputPath, html);
  console.log(`🌐 HTML report saved to ${outputPath}`);
}

/**
 * Markdown形式のレポート生成
 */
async function generateMarkdownReport(results: SDGAnalysisResult[], outputPath: string): Promise<void> {
  const summary = generateSummary(results);
  
  const markdown = `# 🌍 SDGScript Analysis Report

Generated on ${new Date().toLocaleString()}

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total Functions | ${summary.totalFunctions} |
| SDG Annotated | ${summary.annotatedFunctions} |
| Total Violations | ${summary.totalViolations} |
| Average Score | ${summary.averageScore.toFixed(1)}/100 |

## 📋 Detailed Results

${results.map(result => `
### \`${result.functionName}\`

**File:** \`${result.filePath}:${result.line}\`  
**Score:** ${result.score}/100

${result.sdgAnnotations.length > 0 ? `
**SDG Goals:** ${result.sdgAnnotations.map(a => `\`${a.goal}\``).join(', ')}
` : ''}

${result.violations.length > 0 ? `
**Violations:**
${result.violations.map(v => `- **${v.severity.toUpperCase()}**: ${v.message}${v.suggestion ? `\\n  💡 *${v.suggestion}*` : ''}`).join('\\n')}
` : ''}

**Resource Metrics:**
- Energy: ${result.estimatedMetrics.energy?.toFixed(3) || 'N/A'}kWh
- Emissions: ${result.estimatedMetrics.emissions?.toFixed(1) || 'N/A'}gCO₂
- Network Calls: ${result.estimatedMetrics.networkCalls || 0}
- I/O Operations: ${result.estimatedMetrics.ioOperations || 0}

---
`).join('')}`;

  await fs.writeFile(outputPath, markdown);
  console.log(`📝 Markdown report saved to ${outputPath}`);
}

/**
 * サマリー情報を生成
 */
function generateSummary(results: SDGAnalysisResult[]) {
  return {
    totalFunctions: results.length,
    annotatedFunctions: results.filter(r => r.sdgAnnotations.length > 0).length,
    totalViolations: results.reduce((sum, r) => sum + r.violations.length, 0),
    averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length || 0
  };
}

/**
 * スコアに基づくCSSクラスを取得
 */
function getScoreClass(score: number): string {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}
