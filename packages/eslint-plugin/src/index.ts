import { requireSDGAnnotation, avoidIneffficientLoops, limitNetworkCalls } from './rules.js';

export const rules = {
  'require-sdg-annotation': requireSDGAnnotation,
  'avoid-inefficient-loops': avoidIneffficientLoops,
  'limit-network-calls': limitNetworkCalls
};

export const configs = {
  recommended: {
    plugins: ['@sdgscript'],
    rules: {
      '@sdgscript/require-sdg-annotation': 'warn',
      '@sdgscript/avoid-inefficient-loops': 'warn', 
      '@sdgscript/limit-network-calls': 'warn'
    }
  },
  strict: {
    plugins: ['@sdgscript'],
    rules: {
      '@sdgscript/require-sdg-annotation': 'error',
      '@sdgscript/avoid-inefficient-loops': 'error',
      '@sdgscript/limit-network-calls': 'error'
    }
  }
};

export default {
  rules,
  configs
};
