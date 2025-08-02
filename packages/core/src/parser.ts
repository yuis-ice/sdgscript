import { Node, JSDoc, SourceFile, FunctionDeclaration, MethodDeclaration, ArrowFunction } from 'ts-morph';
import { SDGAnnotation, SDGGoal, ImpactCategory, ImpactLevel } from './types.js';

/**
 * SDGアノテーションパーサー
 * JSDocコメントからSDGs関連の情報を抽出
 */
export class SDGAnnotationParser {
  
  /**
   * JSDocからSDGアノテーションを解析
   */
  parseSDGAnnotations(jsDocs: JSDoc[]): SDGAnnotation[] {
    const annotations: SDGAnnotation[] = [];
    
    for (const jsDoc of jsDocs) {
      const tags = jsDoc.getTags();
      let currentAnnotation: Partial<SDGAnnotation> = {};
      
      for (const tag of tags) {
        const tagName = tag.getTagName();
        const comment = tag.getCommentText();
        
        switch (tagName) {
          case 'sdg':
            const goalMatch = comment?.match(/(Goal\d+)/);
            if (goalMatch) {
              const goalKey = goalMatch[1] as keyof typeof SDGGoal;
              if (SDGGoal[goalKey]) {
                currentAnnotation.goal = SDGGoal[goalKey];
              }
            }
            break;
            
          case 'carbonBudget':
            const budgetMatch = comment?.match(/(\d+(?:\.\d+)?)\s*kWh/);
            if (budgetMatch) {
              currentAnnotation.carbonBudget = parseFloat(budgetMatch[1]);
            }
            break;
            
          case 'impact':
            const impactMatch = comment?.match(/(\w+)\s+(\w+)/);
            if (impactMatch) {
              const [, category, level] = impactMatch;
              currentAnnotation.impact = {
                category: category as ImpactCategory,
                level: level as ImpactLevel
              };
            }
            break;
            
          case 'description':
            currentAnnotation.description = comment || '';
            break;
            
          case 'tags':
            currentAnnotation.tags = comment?.split(',').map(t => t.trim()) || [];
            break;
        }
      }
      
      if (currentAnnotation.goal) {
        annotations.push(currentAnnotation as SDGAnnotation);
      }
    }
    
    return annotations;
  }
  
  /**
   * 関数・メソッドからSDGアノテーションを取得
   */
  extractFromFunction(node: FunctionDeclaration | MethodDeclaration | ArrowFunction): SDGAnnotation[] {
    const jsDocs = node.getJsDocs();
    return this.parseSDGAnnotations(jsDocs);
  }
  
  /**
   * ソースファイル全体からSDGアノテーションを収集
   */
  extractFromSourceFile(sourceFile: SourceFile): Map<string, SDGAnnotation[]> {
    const annotationMap = new Map<string, SDGAnnotation[]>();
    
    // 関数宣言
    sourceFile.getFunctions().forEach(func => {
      const name = func.getName();
      if (name) {
        const annotations = this.extractFromFunction(func);
        if (annotations.length > 0) {
          annotationMap.set(name, annotations);
        }
      }
    });
    
    // クラスメソッド
    sourceFile.getClasses().forEach(cls => {
      cls.getMethods().forEach(method => {
        const name = `${cls.getName()}.${method.getName()}`;
        const annotations = this.extractFromFunction(method);
        if (annotations.length > 0) {
          annotationMap.set(name, annotations);
        }
      });
    });
    
    // アロー関数（変数宣言から）
    sourceFile.getVariableDeclarations().forEach(varDecl => {
      const initializer = varDecl.getInitializer();
      if (initializer && Node.isArrowFunction(initializer)) {
        const name = varDecl.getName();
        const annotations = this.extractFromFunction(initializer);
        if (annotations.length > 0) {
          annotationMap.set(name, annotations);
        }
      }
    });
    
    return annotationMap;
  }
}
