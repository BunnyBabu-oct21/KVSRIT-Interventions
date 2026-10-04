import {
  FeatureContribution,
  RiskExplanation,
  RiskLevel,
  Student,
  SubjectPerformance,
  TestTrendPoint
} from '../types';

export interface MLModelWeights {
  attendanceWeight: number; // default ~0.35
  internalsWeight: number; // default ~0.25
  previousCgpaWeight: number; // default ~0.15
  assignmentWeight: number; // default ~0.12
  backlogsWeight: number; // default ~0.08
  labWeight: number; // default ~0.05
}

export const DEFAULT_MODEL_WEIGHTS: MLModelWeights = {
  attendanceWeight: 0.35,
  internalsWeight: 0.25,
  previousCgpaWeight: 0.15,
  assignmentWeight: 0.12,
  backlogsWeight: 0.08,
  labWeight: 0.05,
};

/**
 * Predict risk tier based on continuous probability score (0-100%)
 */
export function getRiskLevelFromProbability(prob: number): RiskLevel {
  if (prob >= 80) return 'CRITICAL';
  if (prob >= 60) return 'HIGH';
  if (prob >= 30) return 'MEDIUM';
  return 'LOW';
}

export function getRiskBadgeColor(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  dotColor: string;
  icon: string;
} {
  switch (level) {
    case 'CRITICAL':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-300 dark:border-rose-800',
        badge: 'bg-rose-600 text-white',
        dotColor: '#e11d48',
        icon: '🔴',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-300 dark:border-orange-800',
        badge: 'bg-orange-600 text-white',
        dotColor: '#ea580c',
        icon: '🟠',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-300 dark:border-amber-800',
        badge: 'bg-amber-500 text-white',
        dotColor: '#d97706',
        icon: '🟡',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-300 dark:border-emerald-800',
        badge: 'bg-emerald-600 text-white',
        dotColor: '#059669',
        icon: '🟢',
      };
  }
}

/**
 * Calculates Explainable ML Risk Probability & Feature Importance Contributions
 */
export function calculateStudentRisk(
  data: {
    attendance: number;
    internal1: number;
    internal2?: number;
    internalAverage?: number;
    assignmentScore: number;
    assignmentsSubmitted?: number;
    assignmentsTotal?: number;
    previousCgpa: number;
    backlogs: number;
    labScore: number;
    trends?: TestTrendPoint[];
  },
  weights: MLModelWeights = DEFAULT_MODEL_WEIGHTS
): RiskExplanation {
  const attendance = Math.min(100, Math.max(0, data.attendance));
  const int1 = Math.min(100, Math.max(0, data.internal1));
  const int2 = data.internal2 !== undefined ? Math.min(100, Math.max(0, data.internal2)) : int1;
  const internalAvg = data.internalAverage ?? (data.internal2 !== undefined ? (int1 + int2) / 2 : int1);
  const assignmentScore = Math.min(100, Math.max(0, data.assignmentScore));
  const cgpa = Math.min(10, Math.max(0, data.previousCgpa));
  const backlogs = Math.max(0, data.backlogs);
  const labScore = Math.min(100, Math.max(0, data.labScore));

  // Individual Risk Penalties (0 to 100 scale for each dimension)
  // 1. Attendance Risk Penalty: Highly non-linear below 75% (university standard)
  let attRisk = 0;
  if (attendance < 65) {
    attRisk = 85 + (65 - attendance) * 1.5; // very severe (up to 100)
  } else if (attendance < 75) {
    attRisk = 45 + (75 - attendance) * 4.0; // warning zone 45-85%
  } else if (attendance < 85) {
    attRisk = 15 + (85 - attendance) * 1.5; // low warning zone 15-30%
  } else {
    attRisk = Math.max(0, 10 - (attendance - 85) * 0.6);
  }
  attRisk = Math.min(100, Math.max(0, attRisk));

  // 2. Internal Marks Risk Penalty: pass threshold is ~40-50%
  let intRisk = 0;
  if (internalAvg < 40) {
    intRisk = 90 + (40 - internalAvg) * 0.25;
  } else if (internalAvg < 50) {
    intRisk = 65 + (50 - internalAvg) * 2.5;
  } else if (internalAvg < 65) {
    intRisk = 30 + (65 - internalAvg) * 2.3;
  } else if (internalAvg < 80) {
    intRisk = 10 + (80 - internalAvg) * 1.3;
  } else {
    intRisk = Math.max(0, 5 - (internalAvg - 80) * 0.25);
  }
  intRisk = Math.min(100, Math.max(0, intRisk));

  // 3. Previous CGPA Risk Penalty (Scale 0-10)
  let cgpaRisk = 0;
  if (cgpa < 5.0) {
    cgpaRisk = 95 + (5.0 - cgpa) * 1.0;
  } else if (cgpa < 6.0) {
    cgpaRisk = 65 + (6.0 - cgpa) * 30;
  } else if (cgpa < 7.0) {
    cgpaRisk = 30 + (7.0 - cgpa) * 35;
  } else if (cgpa < 8.5) {
    cgpaRisk = 10 + (8.5 - cgpa) * 13;
  } else {
    cgpaRisk = 3;
  }
  cgpaRisk = Math.min(100, Math.max(0, cgpaRisk));

  // 4. Assignments Risk
  let assignRisk = 0;
  if (assignmentScore < 50) {
    assignRisk = 80 + (50 - assignmentScore) * 0.4;
  } else if (assignmentScore < 70) {
    assignRisk = 40 + (70 - assignmentScore) * 2.0;
  } else if (assignmentScore < 85) {
    assignRisk = 15 + (85 - assignmentScore) * 1.6;
  } else {
    assignRisk = 5;
  }
  assignRisk = Math.min(100, Math.max(0, assignRisk));

  // 5. Backlogs Penalty
  let backlogRisk = 0;
  if (backlogs >= 4) {
    backlogRisk = 100;
  } else if (backlogs === 3) {
    backlogRisk = 85;
  } else if (backlogs === 2) {
    backlogRisk = 60;
  } else if (backlogs === 1) {
    backlogRisk = 35;
  } else {
    backlogRisk = 0;
  }

  // 6. Lab Score Risk
  let labRisk = 0;
  if (labScore < 50) {
    labRisk = 75 + (50 - labScore) * 0.5;
  } else if (labScore < 70) {
    labRisk = 30 + (70 - labScore) * 2.2;
  } else {
    labRisk = 5;
  }
  labRisk = Math.min(100, Math.max(0, labRisk));

  // Detect Internal Trend (e.g. falling from I1 to I2, or multiple tests)
  let trendDirection: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'CRITICAL_DROP' = 'STABLE';
  let trendMultiplier = 1.0;

  if (data.internal2 !== undefined && data.internal1 !== undefined) {
    const diff = data.internal2 - data.internal1;
    if (diff <= -15) {
      trendDirection = 'CRITICAL_DROP';
      trendMultiplier = 1.15; // 15% acceleration penalty
    } else if (diff <= -5) {
      trendDirection = 'DECLINING';
      trendMultiplier = 1.08;
    } else if (diff >= 10) {
      trendDirection = 'IMPROVING';
      trendMultiplier = 0.92;
    }
  }

  // Weighted Risk Score (0-100)
  const rawRisk =
    attRisk * weights.attendanceWeight +
    intRisk * weights.internalsWeight +
    cgpaRisk * weights.previousCgpaWeight +
    assignRisk * weights.assignmentWeight +
    backlogRisk * weights.backlogsWeight +
    labRisk * weights.labWeight;

  let riskProbability = Math.round(Math.min(99, Math.max(2, rawRisk * trendMultiplier)));

  // Ensure risk level boundaries
  const riskLevel = getRiskLevelFromProbability(riskProbability);

  // Compute explainable feature contributions (SHAP-style local decomposition)
  const rawContributions = [
    { name: 'Attendance', displayName: 'Attendance', value: `${attendance}%`, raw: attRisk * weights.attendanceWeight },
    { name: 'Internal Marks', displayName: 'Internal Marks', value: `${Math.round(internalAvg)}%`, raw: intRisk * weights.internalsWeight },
    { name: 'Previous CGPA', displayName: 'Previous Performance', value: `${cgpa.toFixed(2)} CGPA`, raw: cgpaRisk * weights.previousCgpaWeight },
    { name: 'Assignments', displayName: 'Assignments', value: `${Math.round(assignmentScore)}%`, raw: assignRisk * weights.assignmentWeight },
    { name: 'Backlogs', displayName: 'Backlogs', value: `${backlogs} subject${backlogs === 1 ? '' : 's'}`, raw: backlogRisk * weights.backlogsWeight },
    { name: 'Lab Score', displayName: 'Lab Performance', value: `${Math.round(labScore)}%`, raw: labRisk * weights.labWeight },
  ];

  const totalRawWeight = rawContributions.reduce((acc, c) => acc + c.raw, 0) || 1;
  const contributingFactors: FeatureContribution[] = rawContributions.map((item) => {
    const contributionPercent = Math.max(3, Math.round((item.raw / totalRawWeight) * 100));
    let impactType: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
    if (item.raw > 15) impactType = 'NEGATIVE';
    else if (item.raw < 5) impactType = 'POSITIVE';

    let description = '';
    if (item.name === 'Attendance') {
      description = attendance < 75 ? `Attendance (${attendance}%) is below the mandatory 75% threshold.` : `Consistent classroom attendance (${attendance}%).`;
    } else if (item.name === 'Internal Marks') {
      description = internalAvg < 50 ? `Internal assessment average (${Math.round(internalAvg)}%) is concerning.` : `Satisfactory internal exam performance (${Math.round(internalAvg)}%).`;
    } else if (item.name === 'Previous CGPA') {
      description = cgpa < 6.5 ? `Historical academic average (${cgpa.toFixed(2)}) indicates foundational gaps.` : `Strong prior semester GPA (${cgpa.toFixed(2)}).`;
    } else if (item.name === 'Assignments') {
      description = assignmentScore < 70 ? `Assignment submission/score rate (${Math.round(assignmentScore)}%) is lacking.` : `Good assignment turnaround (${Math.round(assignmentScore)}%).`;
    } else if (item.name === 'Backlogs') {
      description = backlogs > 0 ? `Has ${backlogs} active backlog(s) accumulating academic debt.` : `Zero backlogs on record.`;
    } else {
      description = labScore < 60 ? `Practical lab scores (${Math.round(labScore)}%) need attention.` : `Strong practical lab performance.`;
    }

    return {
      featureName: item.name,
      displayName: item.displayName,
      valueDisplay: item.value,
      contributionPercent,
      impactType,
      description,
    };
  });

  // Sort contributing factors descending by impact percentage
  contributingFactors.sort((a, b) => b.contributionPercent - a.contributionPercent);

  // Generate clear "WHY?" reasons
  const reasons: string[] = [];
  if (attendance < 65) {
    reasons.push(`Severely low attendance at ${attendance}% (Mandatory: 75%)`);
  } else if (attendance < 75) {
    reasons.push(`Attendance is ${attendance}%, which is below the required 75% cutoff`);
  }

  if (trendDirection === 'CRITICAL_DROP') {
    reasons.push(`Sharp downward trend in internal exams (${int1}% → ${int2}%)`);
  } else if (internalAvg < 50) {
    reasons.push(`Low internal exam average of ${Math.round(internalAvg)}%`);
  } else if (trendDirection === 'DECLINING') {
    reasons.push(`Declining internal marks trajectory across assessments`);
  }

  if (backlogs > 0) {
    reasons.push(`${backlogs} active backlog subject${backlogs > 1 ? 's' : ''} in previous semesters`);
  }

  if (data.assignmentsSubmitted !== undefined && data.assignmentsTotal !== undefined && data.assignmentsSubmitted < data.assignmentsTotal) {
    const missed = data.assignmentsTotal - data.assignmentsSubmitted;
    if (missed > 0) {
      reasons.push(`Missed ${missed} of ${data.assignmentsTotal} required assignments (${data.assignmentsSubmitted}/${data.assignmentsTotal} submitted)`);
    }
  } else if (assignmentScore < 65) {
    reasons.push(`Low assignment completion score of ${Math.round(assignmentScore)}%`);
  }

  if (cgpa < 6.0) {
    reasons.push(`Prior cumulative GPA is ${cgpa.toFixed(2)}, indicating continuous struggle`);
  }

  if (labScore < 55) {
    reasons.push(`Practical lab score is ${Math.round(labScore)}%, risking lab exam detention`);
  }

  if (reasons.length === 0) {
    reasons.push('Academic performance is stable with healthy attendance and test scores');
  }

  // Generate Personalized Action Plan Recommendations
  const recommendedActions: string[] = [];
  if (attendance < 75) {
    recommendedActions.push('⚠️ Attendance Intervention: Issue condonation alert & mandate 90% attendance for next 3 weeks');
  }
  if (internalAvg < 50 || trendDirection === 'DECLINING' || trendDirection === 'CRITICAL_DROP') {
    recommendedActions.push('📚 Extra Academic Support: Enroll in remedial tutorials for struggling subjects');
  }
  if (backlogs > 0) {
    recommendedActions.push('👨‍🏫 Faculty Mentoring: Schedule 1-on-1 mentor session to design a backlog clearance strategy');
  }
  if (assignmentScore < 70 || (data.assignmentsSubmitted !== undefined && data.assignmentsSubmitted < data.assignmentsTotal!)) {
    recommendedActions.push('📝 Assignment Recovery: Open a 7-day grace window for missed task submissions');
  }
  if (riskProbability >= 70) {
    recommendedActions.push('📞 Parent / Guardian Communication: Brief family on attendance & internal standing');
    recommendedActions.push('⏱️ Weekly Monitoring: Track weekly class presence & quiz scores');
  } else if (riskProbability >= 40) {
    recommendedActions.push('🎯 Bi-weekly Progress Review with Class Incharge');
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push('🌟 Maintain Current Momentum: Eligible for advanced project mentoring & honors track');
  }

  const academicHealthScore = Math.max(5, Math.min(100, Math.round(100 - riskProbability * 0.95)));

  return {
    riskProbability,
    riskLevel,
    contributingFactors,
    reasons,
    recommendedActions,
    trendDirection,
    academicHealthScore,
  };
}

/**
 * Predicts Subject-Specific Risk
 */
export function calculateSubjectRisk(
  subjectName: string,
  attendance: number,
  internal1: number,
  internal2?: number,
  assignmentScore: number = 75
): { riskProbability: number; riskLevel: RiskLevel; recommendation: string } {
  const intAvg = internal2 !== undefined ? (internal1 + internal2) / 2 : internal1;
  let risk = 0;

  if (attendance < 65) risk += 45;
  else if (attendance < 75) risk += 25;
  else if (attendance < 85) risk += 10;

  if (intAvg < 40) risk += 45;
  else if (intAvg < 55) risk += 30;
  else if (intAvg < 70) risk += 15;

  if (assignmentScore < 60) risk += 15;
  else if (assignmentScore < 75) risk += 8;

  const riskProbability = Math.min(99, Math.max(5, Math.round(risk)));
  const riskLevel = getRiskLevelFromProbability(riskProbability);

  let recommendation = 'Performance is on track.';
  if (riskLevel === 'CRITICAL') {
    recommendation = `Urgent: Attend faculty office hours for ${subjectName} and submit makeup tutorial sheet.`;
  } else if (riskLevel === 'HIGH') {
    recommendation = `Attend upcoming remedial classes for ${subjectName} and practice past paper problems.`;
  } else if (riskLevel === 'MEDIUM') {
    recommendation = `Aim for 80%+ in the next internal test and maintain regular attendance in ${subjectName}.`;
  }

  return { riskProbability, riskLevel, recommendation };
}

/**
 * What-If Simulation Engine:
 * Predicts risk outcome when changing parameters (e.g. attendance from 62% to 80%)
 */
export function simulateWhatIf(
  currentStudent: Student,
  adjustments: {
    attendance?: number;
    internalAverage?: number;
    assignmentScore?: number;
    previousCgpa?: number;
    backlogs?: number;
    labScore?: number;
  }
): {
  currentRisk: number;
  currentRiskLevel: RiskLevel;
  predictedRisk: number;
  predictedRiskLevel: RiskLevel;
  riskDelta: number; // e.g. -33%
  improvementPercent: number; // e.g. 33%
  verdictText: string;
} {
  const currentRisk = currentStudent.assessment.riskProbability;
  const currentRiskLevel = currentStudent.assessment.riskLevel;

  const simData = {
    attendance: adjustments.attendance ?? currentStudent.attendance,
    internal1: adjustments.internalAverage ?? currentStudent.internalAverage,
    internal2: adjustments.internalAverage ?? currentStudent.internalAverage,
    internalAverage: adjustments.internalAverage ?? currentStudent.internalAverage,
    assignmentScore: adjustments.assignmentScore ?? currentStudent.assignmentScore,
    previousCgpa: adjustments.previousCgpa ?? currentStudent.previousCgpa,
    backlogs: adjustments.backlogs ?? currentStudent.backlogs,
    labScore: adjustments.labScore ?? currentStudent.labScore,
  };

  const newAssessment = calculateStudentRisk(simData);
  const predictedRisk = newAssessment.riskProbability;
  const predictedRiskLevel = newAssessment.riskLevel;
  const riskDelta = predictedRisk - currentRisk;
  const improvementPercent = Math.abs(riskDelta);

  let verdictText = '';
  if (riskDelta < -20) {
    verdictText = `Significant turnaround! Risk drops by ${improvementPercent}% into ${predictedRiskLevel} risk zone.`;
  } else if (riskDelta < -5) {
    verdictText = `Positive improvement. Risk decreases by ${improvementPercent}%.`;
  } else if (riskDelta > 15) {
    verdictText = `Warning: This scenario elevates student into ${predictedRiskLevel} risk territory (+${improvementPercent}%).`;
  } else {
    verdictText = `Minimal overall change in risk classification.`;
  }

  return {
    currentRisk,
    currentRiskLevel,
    predictedRisk,
    predictedRiskLevel,
    riskDelta,
    improvementPercent,
    verdictText,
  };
}
