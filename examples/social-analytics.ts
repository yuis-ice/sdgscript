/**
 * SDGScript Example: Social Impact Analytics
 * Goal4: Quality Education & Goal10: Reduced Inequalities
 */

import { withSDGContext, trackResource } from '@sdgscript/runtime';

/**
 * @sdg Goal4 QualityEducation
 * @carbonBudget 1.5kWh
 * @impact social high
 * @description Analyze educational accessibility data efficiently
 */
export async function analyzeEducationAccess(studentData: StudentRecord[]): Promise<AccessibilityReport> {
  return withSDGContext({
    goal: 'Goal4_QualityEducation',
    carbonBudget: 1.5,
    description: 'Educational accessibility analysis for inclusive learning'
  }, async () => {
    
    const report: AccessibilityReport = {
      totalStudents: studentData.length,
      accessibleStudents: 0,
      digitalDivideMetrics: {
        withDevice: 0,
        withInternet: 0,
        withBoth: 0
      },
      recommendations: []
    };
    
    // 効率的な単一パス処理
    for (const student of studentData) {
      if (student.hasDevice && student.hasInternet) {
        report.accessibleStudents++;
        report.digitalDivideMetrics.withBoth++;
      }
      
      if (student.hasDevice) {
        report.digitalDivideMetrics.withDevice++;
      }
      
      if (student.hasInternet) {
        report.digitalDivideMetrics.withInternet++;
      }
    }
    
    // 計算負荷を記録
    trackResource('analysis', {
      computeComplexity: studentData.length,
      energy: studentData.length * 0.00001 // kWh per record
    });
    
    // レコメンデーション生成
    generateRecommendations(report);
    
    return report;
  });
}

/**
 * @sdg Goal10 ReducedInequalities
 * @carbonBudget 0.8kWh
 * @impact social high
 * @description Generate actionable recommendations for reducing educational inequality
 */
function generateRecommendations(report: AccessibilityReport): void {
  const accessibilityRate = report.accessibleStudents / report.totalStudents;
  
  if (accessibilityRate < 0.5) {
    report.recommendations.push({
      priority: 'high',
      action: 'Implement device lending program',
      impact: 'Increase device access by 30-40%',
      sdgAlignment: 'Goal4_QualityEducation'
    });
  }
  
  if (report.digitalDivideMetrics.withInternet / report.totalStudents < 0.6) {
    report.recommendations.push({
      priority: 'high',
      action: 'Partner with ISPs for subsidized internet',
      impact: 'Improve internet access by 25-35%',
      sdgAlignment: 'Goal10_ReducedInequalities'
    });
  }
  
  if (accessibilityRate > 0.8) {
    report.recommendations.push({
      priority: 'medium',
      action: 'Develop advanced digital literacy programs',
      impact: 'Enhance learning outcomes for connected students',
      sdgAlignment: 'Goal4_QualityEducation'
    });
  }
}

/**
 * @sdg Goal5 GenderEquality
 * @carbonBudget 0.5kWh
 * @impact social medium
 * @description Analyze gender gaps in STEM education
 */
export function analyzeGenderEquity(courses: CourseEnrollment[]): GenderEquityReport {
  return withSDGContext({
    goal: 'Goal5_GenderEquality',
    carbonBudget: 0.5,
    description: 'Gender equity analysis in STEM education'
  }, () => {
    
    const stemFields = ['computer_science', 'engineering', 'mathematics', 'physics', 'chemistry'];
    const genderStats = new Map<string, { male: number; female: number; other: number }>();
    
    // STEM分野ごとの性別統計を効率的に計算
    for (const course of courses) {
      if (stemFields.includes(course.field)) {
        const stats = genderStats.get(course.field) || { male: 0, female: 0, other: 0 };
        
        switch (course.studentGender) {
          case 'male':
            stats.male++;
            break;
          case 'female':
            stats.female++;
            break;
          default:
            stats.other++;
        }
        
        genderStats.set(course.field, stats);
      }
    }
    
    trackResource('gender_analysis', {
      computeComplexity: courses.length,
      energy: courses.length * 0.00005
    });
    
    // ジェンダーギャップを計算
    const gaps = Array.from(genderStats.entries()).map(([field, stats]) => {
      const total = stats.male + stats.female + stats.other;
      const femaleRatio = stats.female / total;
      const genderGap = Math.abs(0.5 - femaleRatio); // 理想的には50:50
      
      return {
        field,
        femaleRatio,
        genderGap,
        totalStudents: total,
        needsIntervention: genderGap > 0.2
      };
    });
    
    return {
      fieldAnalysis: gaps,
      overallGenderBalance: gaps.reduce((sum, gap) => sum + gap.genderGap, 0) / gaps.length,
      interventionNeeded: gaps.filter(gap => gap.needsIntervention),
      timestamp: new Date().toISOString()
    };
  });
}

// 型定義
interface StudentRecord {
  id: string;
  age: number;
  hasDevice: boolean;
  hasInternet: boolean;
  location: string;
  socialEconomicStatus: 'low' | 'medium' | 'high';
}

interface AccessibilityReport {
  totalStudents: number;
  accessibleStudents: number;
  digitalDivideMetrics: {
    withDevice: number;
    withInternet: number;
    withBoth: number;
  };
  recommendations: Recommendation[];
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
  sdgAlignment: string;
}

interface CourseEnrollment {
  courseId: string;
  field: string;
  studentGender: string;
  level: 'undergraduate' | 'graduate';
}

interface GenderEquityReport {
  fieldAnalysis: Array<{
    field: string;
    femaleRatio: number;
    genderGap: number;
    totalStudents: number;
    needsIntervention: boolean;
  }>;
  overallGenderBalance: number;
  interventionNeeded: Array<any>;
  timestamp: string;
}
