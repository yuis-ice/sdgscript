import { ESLintUtils } from '@typescript-eslint/utils';
import { SDGAnnotationParser } from '@sdgscript/core';

/**
 * SDG annotation required for high-impact functions
 */
export const requireSDGAnnotation = ESLintUtils.RuleCreator(
  name => `https://sdgscript.dev/rules/${name}`
)({
  name: 'require-sdg-annotation',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require SDG annotations for functions with high environmental impact',
      recommended: 'warn'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          energyThreshold: {
            type: 'number',
            default: 1.0
          },
          networkCallThreshold: {
            type: 'number', 
            default: 5
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      missingSDGAnnotation: 'Function with high environmental impact should have SDG annotation',
      addSDGAnnotation: 'Add @sdg annotation to document sustainability impact'
    }
  },
  defaultOptions: [
    {
      energyThreshold: 1.0,
      networkCallThreshold: 5
    }
  ],
  create(context, [options]) {
    const parser = new SDGAnnotationParser();
    
    function checkFunction(node: any) {
      // JSDoc コメントからSDGアノテーションをチェック
      const jsDocs = node.parent?.leadingComments || [];
      const hasSDGAnnotation = jsDocs.some((comment: any) => 
        comment.value.includes('@sdg') || comment.value.includes('@carbonBudget')
      );
      
      if (hasSDGAnnotation) {
        return; // 既にアノテーションがある場合はスキップ
      }
      
      // 関数の内容を簡易的に解析
      const sourceCode = context.getSourceCode();
      const functionText = sourceCode.getText(node);
      
      // 高インパクトな処理を検出
      const hasNetworkCalls = /fetch|axios|http\.|ajax/.test(functionText);
      const hasAIModels = /tensorflow|torch|openai|huggingface|predict/.test(functionText);
      const hasHeavyCompute = /for\s*\([^)]*[^)]*\)\s*{[^}]*for\s*\(/.test(functionText); // ネストしたループ
      
      if (hasNetworkCalls || hasAIModels || hasHeavyCompute) {
        context.report({
          node,
          messageId: 'missingSDGAnnotation',
          fix(fixer) {
            // 自動修正: 基本的なSDGアノテーションを追加
            const sdgComment = `/**
 * @sdg Goal13 ClimateAction
 * @carbonBudget 1.0kWh
 * @impact environment medium
 */
`;
            return fixer.insertTextBefore(node, sdgComment);
          }
        });
      }
    }
    
    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
      MethodDefinition: checkFunction
    };
  }
});

/**
 * Warn about inefficient loops that could be optimized
 */
export const avoidIneffficientLoops = ESLintUtils.RuleCreator(
  name => `https://sdgscript.dev/rules/${name}`
)({
  name: 'avoid-inefficient-loops',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn about nested loops and inefficient iterations that increase energy consumption',
      recommended: 'warn'
    },
    schema: [],
    messages: {
      nestedLoops: 'Nested loops increase computational complexity and energy usage',
      arrayInLoop: 'Array methods in loops can be inefficient - consider using map/filter/reduce',
      objectInLoop: 'Object property access in loops should be cached for better performance'
    }
  },
  defaultOptions: [],
  create(context) {
    let loopDepth = 0;
    
    function enterLoop() {
      loopDepth++;
    }
    
    function exitLoop() {
      loopDepth--;
    }
    
    function checkLoop(node: any) {
      if (loopDepth > 1) {
        context.report({
          node,
          messageId: 'nestedLoops'
        });
      }
      
      // ループ内でのArray/Object操作をチェック
      const sourceCode = context.getSourceCode();
      const loopBody = sourceCode.getText(node);
      
      if (/\.(forEach|map|filter|find|some|every)\s*\(/.test(loopBody)) {
        context.report({
          node,
          messageId: 'arrayInLoop'
        });
      }
      
      if (/\w+\.\w+/.test(loopBody) && !/const\s+\w+\s*=/.test(loopBody)) {
        context.report({
          node,
          messageId: 'objectInLoop'
        });
      }
    }
    
    return {
      ForStatement: (node: any) => {
        enterLoop();
        checkLoop(node);
      },
      'ForStatement:exit': exitLoop,
      WhileStatement: (node: any) => {
        enterLoop();
        checkLoop(node);
      },
      'WhileStatement:exit': exitLoop,
      ForInStatement: (node: any) => {
        enterLoop();
        checkLoop(node);
      },
      'ForInStatement:exit': exitLoop,
      ForOfStatement: (node: any) => {
        enterLoop();
        checkLoop(node);
      },
      'ForOfStatement:exit': exitLoop
    };
  }
});

/**
 * Limit network calls in a single function
 */
export const limitNetworkCalls = ESLintUtils.RuleCreator(
  name => `https://sdgscript.dev/rules/${name}`
)({
  name: 'limit-network-calls',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Limit the number of network calls in a single function for better energy efficiency',
      recommended: 'warn'
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxCalls: {
            type: 'number',
            default: 3
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      tooManyNetworkCalls: 'Function has {{count}} network calls, consider batching or caching (max: {{max}})',
      considerBatching: 'Consider batching multiple API calls or using caching strategies'
    }
  },
  defaultOptions: [{ maxCalls: 3 }],
  create(context, [options]) {
    function checkFunction(node: any) {
      const sourceCode = context.getSourceCode();
      const functionText = sourceCode.getText(node);
      
      // ネットワーク呼び出しをカウント
      const networkCallPatterns = [
        /fetch\s*\(/g,
        /axios\.(get|post|put|delete|patch)\s*\(/g,
        /http\.request\s*\(/g,
        /\$\.ajax\s*\(/g
      ];
      
      let totalCalls = 0;
      networkCallPatterns.forEach(pattern => {
        const matches = functionText.match(pattern);
        totalCalls += matches ? matches.length : 0;
      });
      
      if (totalCalls > options.maxCalls) {
        context.report({
          node,
          messageId: 'tooManyNetworkCalls',
          data: {
            count: totalCalls,
            max: options.maxCalls
          }
        });
      }
    }
    
    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
      MethodDefinition: checkFunction
    };
  }
});
