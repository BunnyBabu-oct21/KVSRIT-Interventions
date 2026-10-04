export type Branch = 'AI' | 'CSE' | 'DS' | 'AIML' | 'ECE' | 'EEE' | 'CIVIL' | 'MEC';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface SubjectPerformance {
  code: string;
  name: string;
  attendance: number; // percentage (0-100)
  internal1: number; // out of 30 or 100
  internal2?: number; // optional if not conducted yet
  assignmentScore: number; // percentage
  riskProbability: number; // 0-100
  riskLevel: RiskLevel;
}

export interface TestTrendPoint {
  testName: string; // 'I1', 'I2', 'I3', 'I4', 'Lab Mid', 'Quiz'
  score: number; // percentage (0-100)
  averageClassScore: number;
}

export interface FeatureContribution {
  featureName: string;
  displayName: string;
  valueDisplay: string;
  contributionPercent: number; // 0-100
  impactType: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  description: string;
}

export interface RiskExplanation {
  riskProbability: number; // 0-100
  riskLevel: RiskLevel;
  contributingFactors: FeatureContribution[];
  reasons: string[];
  recommendedActions: string[];
  trendDirection: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'CRITICAL_DROP';
  academicHealthScore: number; // 0-100
}

export interface Intervention {
  id: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  facultyId: string;
  facultyName: string;
  createdAt: string; // ISO date
  type: 'FACULTY_MEETING' | 'EXTRA_CLASSES' | 'ASSIGNMENT_RECOVERY' | 'PARENT_COMMUNICATION' | 'WEEKLY_MONITORING' | 'PEER_TUTORING' | 'COUNSELING';
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OUTCOME_MEASURED';
  description: string;
  actionItems: string[];
  notes: string;
  targetAttendance?: number;
  targetInternalScore?: number;
  initialRiskProbability: number;
  currentRiskProbability?: number;
  outcomeNotes?: string;
  outcomeStatus?: 'IMPROVED' | 'STABILIZED' | 'NO_CHANGE' | 'REGRESSED';
}

export interface Student {
  id: string;
  rollNo: string; // e.g. 24FH1A0501
  name: string;
  email: string;
  phone: string;
  parentPhone: string;
  branch: Branch;
  semester: number; // 1 to 8
  academicYear: string; // e.g. "2024-2028"
  facultyMentorId?: string;
  facultyMentorName?: string;

  // Core ML Input Indicators
  attendance: number; // overall percentage (0-100)
  internal1: number; // marks % (0-100)
  internal2?: number; // marks % (0-100)
  internalAverage: number; // calculated %
  assignmentScore: number; // overall % (0-100)
  assignmentsSubmitted: number;
  assignmentsTotal: number;
  previousCgpa: number; // 0.00 to 10.00
  backlogs: number; // 0, 1, 2, ...
  labScore: number; // % (0-100)

  // Subject-level breakdown
  subjects: SubjectPerformance[];

  // Historical test trends
  trends: TestTrendPoint[];

  // Cached calculated risk evaluation
  assessment: RiskExplanation;

  // Interventions logged for this student
  interventions?: Intervention[];

  // Timestamps
  updatedAt: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string; // e.g. KVSRIT-FAC-012
  branch: Branch;
  designation: string; // Assistant Professor, Assoc. Professor, Professor, HOD
  assignedStudentIds: string[];
}

export interface CollegeStats {
  totalStudents: number;
  totalFaculty: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  criticalRiskCount: number;
  averageAttendance: number;
  averageCgpa: number;
  activeInterventionsCount: number;
  resolvedInterventionsCount: number;
  interventionsSuccessRate: number; // percentage
}
