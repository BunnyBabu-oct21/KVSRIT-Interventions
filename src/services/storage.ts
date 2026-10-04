import {
  Branch,
  CollegeStats,
  Faculty,
  Intervention,
  Student,
  SubjectPerformance,
  TestTrendPoint,
  UserRole
} from '../types';
import { calculateStudentRisk, calculateSubjectRisk } from './mlEngine';

const STORAGE_KEYS = {
  STUDENTS: 'kvsrit_students_v1',
  FACULTY: 'kvsrit_faculty_v1',
  INTERVENTIONS: 'kvsrit_interventions_v1',
  CURRENT_USER_ROLE: 'kvsrit_user_role_v1',
  ACTIVE_STUDENT_ID: 'kvsrit_active_student_id_v1',
  ACTIVE_FACULTY_ID: 'kvsrit_active_faculty_id_v1',
};

export const BRANCH_CODES: Record<Branch, { code: string; name: string; fullTitle: string }> = {
  CSE: { code: '05', name: 'CSE', fullTitle: 'Computer Science & Engineering' },
  AIML: { code: '42', name: 'AIML', fullTitle: 'Artificial Intelligence & Machine Learning' },
  AI: { code: '43', name: 'AI', fullTitle: 'Artificial Intelligence' },
  DS: { code: '67', name: 'DS', fullTitle: 'Data Science' },
  ECE: { code: '04', name: 'ECE', fullTitle: 'Electronics & Communication Engineering' },
  EEE: { code: '02', name: 'EEE', fullTitle: 'Electrical & Electronics Engineering' },
  CIVIL: { code: '01', name: 'CIVIL', fullTitle: 'Civil Engineering' },
  MEC: { code: '03', name: 'MEC', fullTitle: 'Mechanical Engineering' },
};

export const BRANCH_SUBJECTS: Record<Branch, { code: string; name: string }[]> = {
  CSE: [
    { code: 'CS501', name: 'Database Management Systems (DBMS)' },
    { code: 'CS502', name: 'Design and Analysis of Algorithms (DAA)' },
    { code: 'CS503', name: 'Operating Systems (OS)' },
    { code: 'CS504', name: 'Computer Networks (CN)' },
    { code: 'CS505', name: 'Software Engineering (SE)' },
  ],
  AIML: [
    { code: 'AM501', name: 'Machine Learning Foundations' },
    { code: 'AM502', name: 'Deep Learning & Neural Networks' },
    { code: 'AM503', name: 'Natural Language Processing' },
    { code: 'AM504', name: 'Computer Vision Basics' },
    { code: 'AM505', name: 'AI Ethics & Mathematics' },
  ],
  AI: [
    { code: 'AI501', name: 'Principles of Artificial Intelligence' },
    { code: 'AI502', name: 'Knowledge Representation & Reasoning' },
    { code: 'AI503', name: 'Python for AI & Robotics' },
    { code: 'AI504', name: 'Pattern Recognition' },
    { code: 'AI505', name: 'Intelligent Autonomous Systems' },
  ],
  DS: [
    { code: 'DS501', name: 'Big Data Analytics & Hadoop' },
    { code: 'DS502', name: 'Statistical Data Modeling & R' },
    { code: 'DS503', name: 'Data Mining & Warehousing' },
    { code: 'DS504', name: 'Applied Predictive Analytics' },
    { code: 'DS505', name: 'Data Visualization & BI' },
  ],
  ECE: [
    { code: 'EC501', name: 'Digital Signal Processing (DSP)' },
    { code: 'EC502', name: 'VLSI Design Fundamentals' },
    { code: 'EC503', name: 'Microprocessors & Microcontrollers' },
    { code: 'EC504', name: 'Antenna & Wave Propagation' },
    { code: 'EC505', name: 'Linear Integrated Circuits' },
  ],
  EEE: [
    { code: 'EE501', name: 'Power Electronics & Drives' },
    { code: 'EE502', name: 'Control Systems Engineering' },
    { code: 'EE503', name: 'Power System Analysis' },
    { code: 'EE504', name: 'Electrical Machines II' },
    { code: 'EE505', name: 'Renewable Energy Sources' },
  ],
  CIVIL: [
    { code: 'CE501', name: 'Structural Analysis II' },
    { code: 'CE502', name: 'Geotechnical Engineering' },
    { code: 'CE503', name: 'Concrete Technology & Design' },
    { code: 'CE504', name: 'Hydraulics & Water Resources' },
    { code: 'CE505', name: 'Transportation Engineering' },
  ],
  MEC: [
    { code: 'ME501', name: 'Thermodynamics & Heat Transfer' },
    { code: 'ME502', name: 'Kinematics & Dynamics of Machinery' },
    { code: 'ME503', name: 'Fluid Mechanics & Turbomachinery' },
    { code: 'ME504', name: 'CAD/CAM Manufacturing' },
    { code: 'ME505', name: 'Automobile Engineering' },
  ],
};

// Generates roll numbers formatted like 24FH1A0501
export function generateRollNumber(branch: Branch, index: number, yearPrefix: string = '24'): string {
  const branchCode = BRANCH_CODES[branch]?.code || '05';
  const numPart = index.toString().padStart(2, '0');
  return `${yearPrefix}FH1A${branchCode}${numPart}`;
}

export function getStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load students', e);
    return [];
  }
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function getFaculty(): Faculty[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FACULTY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load faculty', e);
    return [];
  }
}

export function saveFaculty(facultyList: Faculty[]): void {
  localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(facultyList));
}

export function getInterventions(): Intervention[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERVENTIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load interventions', e);
    return [];
  }
}

export function saveInterventions(interventions: Intervention[]): void {
  localStorage.setItem(STORAGE_KEYS.INTERVENTIONS, JSON.stringify(interventions));
}

export function getUserRole(): UserRole {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE);
    return (raw as UserRole) || 'FACULTY';
  } catch {
    return 'FACULTY';
  }
}

export function saveUserRole(role: UserRole): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, role);
}

export function getActiveStudentId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDENT_ID);
}

export function saveActiveStudentId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDENT_ID, id);
}

export function getActiveFacultyId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_FACULTY_ID);
}

export function saveActiveFacultyId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_FACULTY_ID, id);
}

/**
 * Creates a fully evaluated student entity with subjects and trends
 */
export function createStudentEntity(params: {
  id?: string;
  rollNo: string;
  name: string;
  email?: string;
  phone?: string;
  parentPhone?: string;
  branch: Branch;
  semester: number;
  academicYear?: string;
  facultyMentorId?: string;
  facultyMentorName?: string;
  attendance: number;
  internal1: number;
  internal2?: number;
  assignmentScore: number;
  assignmentsSubmitted?: number;
  assignmentsTotal?: number;
  previousCgpa: number;
  backlogs: number;
  labScore: number;
  subjectScores?: { code: string; attendance: number; int1: number; int2?: number }[];
}): Student {
  const id = params.id || `std_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const rollNo = params.rollNo.toUpperCase().trim();
  const int1 = params.internal1;
  const int2 = params.internal2 !== undefined ? params.internal2 : int1;
  const internalAverage = params.internal2 !== undefined ? Math.round((int1 + int2) / 2) : int1;
  const assignmentsTotal = params.assignmentsTotal || 8;
  const assignmentsSubmitted = params.assignmentsSubmitted !== undefined
    ? params.assignmentsSubmitted
    : Math.round((params.assignmentScore / 100) * assignmentsTotal);

  // Generate subject list based on branch
  const catalogSubjects = BRANCH_SUBJECTS[params.branch] || BRANCH_SUBJECTS.CSE;
  const subjects: SubjectPerformance[] = catalogSubjects.map((sub, idx) => {
    // Subject specific variation relative to baseline student performance
    const variation = ((idx % 3) - 1) * 6;
    const subAttendance = Math.min(100, Math.max(20, params.attendance + variation));
    const subInt1 = Math.min(100, Math.max(15, int1 + variation));
    const subInt2 = params.internal2 !== undefined ? Math.min(100, Math.max(15, int2 + variation)) : undefined;
    const subAssign = Math.min(100, Math.max(20, params.assignmentScore + variation));
    const subRisk = calculateSubjectRisk(sub.name, subAttendance, subInt1, subInt2, subAssign);

    return {
      code: sub.code,
      name: sub.name,
      attendance: subAttendance,
      internal1: subInt1,
      internal2: subInt2,
      assignmentScore: subAssign,
      riskProbability: subRisk.riskProbability,
      riskLevel: subRisk.riskLevel,
    };
  });

  // Generate 4-test trend history
  const dropOffset = (int2 < int1 ? (int1 - int2) / 2 : (int2 - int1) / 2);
  const trends: TestTrendPoint[] = [
    { testName: 'Test 1 (Unit 1)', score: Math.min(100, Math.max(10, int1 + 4)), averageClassScore: 72 },
    { testName: 'Test 2 (Mid 1)', score: int1, averageClassScore: 68 },
    { testName: 'Test 3 (Unit 2)', score: Math.min(100, Math.max(10, Math.round((int1 + int2) / 2))), averageClassScore: 70 },
    { testName: 'Test 4 (Mid 2)', score: int2, averageClassScore: 66 },
  ];

  const assessment = calculateStudentRisk({
    attendance: params.attendance,
    internal1: int1,
    internal2: int2,
    internalAverage,
    assignmentScore: params.assignmentScore,
    assignmentsSubmitted,
    assignmentsTotal,
    previousCgpa: params.previousCgpa,
    backlogs: params.backlogs,
    labScore: params.labScore,
    trends,
  });

  return {
    id,
    rollNo,
    name: params.name,
    email: params.email || `${rollNo.toLowerCase()}@kvsrit.ac.in`,
    phone: params.phone || '+91 98480 22334',
    parentPhone: params.parentPhone || '+91 98480 88990',
    branch: params.branch,
    semester: params.semester,
    academicYear: params.academicYear || '2024-2028',
    facultyMentorId: params.facultyMentorId,
    facultyMentorName: params.facultyMentorName || 'Dr. K. Ramesh (Mentor)',
    attendance: params.attendance,
    internal1: int1,
    internal2: params.internal2,
    internalAverage,
    assignmentScore: params.assignmentScore,
    assignmentsSubmitted,
    assignmentsTotal,
    previousCgpa: params.previousCgpa,
    backlogs: params.backlogs,
    labScore: params.labScore,
    subjects,
    trends,
    assessment,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Re-evaluates student after parameter update
 */
export function updateStudentData(student: Student, updates: Partial<Student>): Student {
  const merged = { ...student, ...updates };
  const int1 = merged.internal1;
  const int2 = merged.internal2 !== undefined ? merged.internal2 : int1;
  const internalAverage = merged.internal2 !== undefined ? Math.round((int1 + int2) / 2) : int1;

  const assessment = calculateStudentRisk({
    attendance: merged.attendance,
    internal1: int1,
    internal2: int2,
    internalAverage,
    assignmentScore: merged.assignmentScore,
    assignmentsSubmitted: merged.assignmentsSubmitted,
    assignmentsTotal: merged.assignmentsTotal,
    previousCgpa: merged.previousCgpa,
    backlogs: merged.backlogs,
    labScore: merged.labScore,
    trends: merged.trends,
  });

  const updated: Student = {
    ...merged,
    internalAverage,
    assessment,
    updatedAt: new Date().toISOString(),
  };

  const all = getStudents();
  const index = all.findIndex((s) => s.id === student.id);
  if (index >= 0) {
    all[index] = updated;
    saveStudents(all);
  }

  return updated;
}

/**
 * Generates rich synthetic demo dataset representing KVSRIT
 * with all 8 branches (AI, CSE, DS, AIML, ECE, EEE, CIVIL, MEC), faculties,
 * realistic roll numbers like 24FH1A0501, and diverse risk profiles (Critical, High, Medium, Low).
 */
export function seedSyntheticCollegeData(): { students: Student[]; faculty: Faculty[]; interventions: Intervention[] } {
  const branches: Branch[] = ['AI', 'CSE', 'DS', 'AIML', 'ECE', 'EEE', 'CIVIL', 'MEC'];

  const facultyData = [
    { name: 'Dr. K. Ramesh Kumar', branch: 'CSE' as Branch, desig: 'Professor & HOD', emp: 'KVSRIT-FAC-001', email: 'ramesh.cse@kvsrit.ac.in' },
    { name: 'Prof. S. V. Lakshmi', branch: 'AIML' as Branch, desig: 'Associate Professor', emp: 'KVSRIT-FAC-002', email: 'lakshmi.aiml@kvsrit.ac.in' },
    { name: 'Dr. G. Venkata Rao', branch: 'AI' as Branch, desig: 'Professor', emp: 'KVSRIT-FAC-003', email: 'venkat.ai@kvsrit.ac.in' },
    { name: 'Dr. P. Suresh Babu', branch: 'DS' as Branch, desig: 'Associate Professor', emp: 'KVSRIT-FAC-004', email: 'suresh.ds@kvsrit.ac.in' },
    { name: 'Prof. M. Anjaneyulu', branch: 'ECE' as Branch, desig: 'Associate Professor', emp: 'KVSRIT-FAC-005', email: 'anjaneyulu.ece@kvsrit.ac.in' },
    { name: 'Dr. B. Nagaraju', branch: 'EEE' as Branch, desig: 'Professor & HOD', emp: 'KVSRIT-FAC-006', email: 'nagaraju.eee@kvsrit.ac.in' },
    { name: 'Prof. C. Harish Reddy', branch: 'CIVIL' as Branch, desig: 'Assistant Professor', emp: 'KVSRIT-FAC-007', email: 'harish.civil@kvsrit.ac.in' },
    { name: 'Dr. T. Mallikarjuna', branch: 'MEC' as Branch, desig: 'Professor & HOD', emp: 'KVSRIT-FAC-008', email: 'mallikarjuna.mec@kvsrit.ac.in' },
  ];

  const facultyList: Faculty[] = facultyData.map((f, idx) => ({
    id: `fac_${idx + 1}`,
    name: f.name,
    email: f.email,
    phone: `+91 9440${idx} 5544${idx}`,
    employeeId: f.emp,
    branch: f.branch,
    designation: f.desig,
    assignedStudentIds: [],
  }));

  // Curated archetypes for demonstration
  const rawArchetypes = [
    // CSE critical & high risk cases
    {
      name: 'Rahul Kumar',
      branch: 'CSE' as Branch,
      rollIdx: 1,
      attendance: 61,
      int1: 48,
      int2: 42,
      assign: 55,
      submitted: 5,
      total: 8,
      cgpa: 6.2,
      backlogs: 2,
      lab: 58,
      sem: 5,
    },
    {
      name: 'Arjun Reddy',
      branch: 'CSE' as Branch,
      rollIdx: 2,
      attendance: 58,
      int1: 44,
      int2: 38,
      assign: 50,
      submitted: 4,
      total: 8,
      cgpa: 5.9,
      backlogs: 3,
      lab: 52,
      sem: 5,
    },
    {
      name: 'Priya Sharma',
      branch: 'CSE' as Branch,
      rollIdx: 3,
      attendance: 68,
      int1: 52,
      int2: 48,
      assign: 62,
      submitted: 6,
      total: 8,
      cgpa: 6.8,
      backlogs: 1,
      lab: 65,
      sem: 5,
    },
    {
      name: 'Kiran Varma',
      branch: 'CSE' as Branch,
      rollIdx: 4,
      attendance: 72,
      int1: 58,
      int2: 54,
      assign: 70,
      submitted: 6,
      total: 8,
      cgpa: 7.1,
      backlogs: 1,
      lab: 70,
      sem: 3,
    },
    {
      name: 'Bhavani Shankar',
      branch: 'CSE' as Branch,
      rollIdx: 5,
      attendance: 88,
      int1: 82,
      int2: 86,
      assign: 90,
      submitted: 8,
      total: 8,
      cgpa: 8.7,
      backlogs: 0,
      lab: 92,
      sem: 5,
    },
    {
      name: 'Sneha Chowdary',
      branch: 'CSE' as Branch,
      rollIdx: 6,
      attendance: 94,
      int1: 91,
      int2: 95,
      assign: 98,
      submitted: 8,
      total: 8,
      cgpa: 9.3,
      backlogs: 0,
      lab: 96,
      sem: 5,
    },

    // AIML branch cases
    {
      name: 'Sai Vignesh',
      branch: 'AIML' as Branch,
      rollIdx: 1,
      attendance: 55,
      int1: 42,
      int2: 36,
      assign: 45,
      submitted: 3,
      total: 8,
      cgpa: 5.8,
      backlogs: 3,
      lab: 50,
      sem: 5,
    },
    {
      name: 'Ananya Rao',
      branch: 'AIML' as Branch,
      rollIdx: 2,
      attendance: 71,
      int1: 60,
      int2: 58,
      assign: 75,
      submitted: 6,
      total: 8,
      cgpa: 7.2,
      backlogs: 0,
      lab: 74,
      sem: 5,
    },
    {
      name: 'Karthik Naidu',
      branch: 'AIML' as Branch,
      rollIdx: 3,
      attendance: 91,
      int1: 88,
      int2: 90,
      assign: 92,
      submitted: 8,
      total: 8,
      cgpa: 8.9,
      backlogs: 0,
      lab: 90,
      sem: 5,
    },

    // AI branch cases
    {
      name: 'Manoj Kumar',
      branch: 'AI' as Branch,
      rollIdx: 1,
      attendance: 64,
      int1: 50,
      int2: 44,
      assign: 60,
      submitted: 5,
      total: 8,
      cgpa: 6.4,
      backlogs: 2,
      lab: 60,
      sem: 3,
    },
    {
      name: 'Deepika Rani',
      branch: 'AI' as Branch,
      rollIdx: 2,
      attendance: 86,
      int1: 78,
      int2: 82,
      assign: 85,
      submitted: 7,
      total: 8,
      cgpa: 8.2,
      backlogs: 0,
      lab: 84,
      sem: 3,
    },

    // DS branch cases
    {
      name: 'Venkatesh Prasad',
      branch: 'DS' as Branch,
      rollIdx: 1,
      attendance: 60,
      int1: 46,
      int2: 40,
      assign: 52,
      submitted: 4,
      total: 8,
      cgpa: 6.0,
      backlogs: 2,
      lab: 55,
      sem: 5,
    },
    {
      name: 'Poojitha S.',
      branch: 'DS' as Branch,
      rollIdx: 2,
      attendance: 89,
      int1: 85,
      int2: 87,
      assign: 92,
      submitted: 8,
      total: 8,
      cgpa: 8.6,
      backlogs: 0,
      lab: 88,
      sem: 5,
    },

    // ECE branch cases
    {
      name: 'Naveen Teja',
      branch: 'ECE' as Branch,
      rollIdx: 1,
      attendance: 52,
      int1: 38,
      int2: 32,
      assign: 40,
      submitted: 3,
      total: 8,
      cgpa: 5.4,
      backlogs: 4,
      lab: 48,
      sem: 5,
    },
    {
      name: 'Keerthi Priya',
      branch: 'ECE' as Branch,
      rollIdx: 2,
      attendance: 74,
      int1: 65,
      int2: 62,
      assign: 78,
      submitted: 7,
      total: 8,
      cgpa: 7.4,
      backlogs: 0,
      lab: 76,
      sem: 5,
    },
    {
      name: 'Mahesh Goud',
      branch: 'ECE' as Branch,
      rollIdx: 3,
      attendance: 92,
      int1: 89,
      int2: 91,
      assign: 95,
      submitted: 8,
      total: 8,
      cgpa: 9.0,
      backlogs: 0,
      lab: 94,
      sem: 5,
    },

    // EEE branch cases
    {
      name: 'Chaitanya Krishna',
      branch: 'EEE' as Branch,
      rollIdx: 1,
      attendance: 63,
      int1: 49,
      int2: 45,
      assign: 58,
      submitted: 5,
      total: 8,
      cgpa: 6.3,
      backlogs: 2,
      lab: 62,
      sem: 5,
    },
    {
      name: 'Harika Devi',
      branch: 'EEE' as Branch,
      rollIdx: 2,
      attendance: 87,
      int1: 80,
      int2: 84,
      assign: 88,
      submitted: 8,
      total: 8,
      cgpa: 8.3,
      backlogs: 0,
      lab: 86,
      sem: 5,
    },

    // CIVIL branch cases
    {
      name: 'Ravi Teja Varma',
      branch: 'CIVIL' as Branch,
      rollIdx: 1,
      attendance: 56,
      int1: 41,
      int2: 37,
      assign: 48,
      submitted: 4,
      total: 8,
      cgpa: 5.7,
      backlogs: 3,
      lab: 54,
      sem: 5,
    },
    {
      name: 'Swathi Reddy',
      branch: 'CIVIL' as Branch,
      rollIdx: 2,
      attendance: 90,
      int1: 84,
      int2: 86,
      assign: 90,
      submitted: 8,
      total: 8,
      cgpa: 8.5,
      backlogs: 0,
      lab: 90,
      sem: 5,
    },

    // MEC branch cases
    {
      name: 'Suresh Kumar G.',
      branch: 'MEC' as Branch,
      rollIdx: 1,
      attendance: 59,
      int1: 45,
      int2: 41,
      assign: 54,
      submitted: 4,
      total: 8,
      cgpa: 6.1,
      backlogs: 2,
      lab: 58,
      sem: 5,
    },
    {
      name: 'Praneeth Royal',
      branch: 'MEC' as Branch,
      rollIdx: 2,
      attendance: 88,
      int1: 81,
      int2: 85,
      assign: 86,
      submitted: 7,
      total: 8,
      cgpa: 8.4,
      backlogs: 0,
      lab: 88,
      sem: 5,
    },
  ];

  // Also populate additional synthetic students across all branches to simulate a full college cohort (~48 students)
  const additionalNames = [
    'Akhil', 'Bindu', 'Charan', 'Divya', 'Eswar', 'Farooq', 'Gautham', 'Hima',
    'Ishwarya', 'Jagadeesh', 'Kavya', 'Lokesh', 'Madhavi', 'Nikhil', 'Omkar',
    'Pavani', 'Rajesh', 'Sindhu', 'Tarun', 'Usha', 'Varun', 'Yamini', 'Zameer', 'Akhila'
  ];

  const students: Student[] = [];

  // Add archetypes first
  rawArchetypes.forEach((item, idx) => {
    const rollNo = generateRollNumber(item.branch, item.rollIdx);
    const mentor = facultyList.find((f) => f.branch === item.branch) || facultyList[0];

    const student = createStudentEntity({
      id: `std_${idx + 1}`,
      rollNo,
      name: item.name,
      branch: item.branch,
      semester: item.sem,
      attendance: item.attendance,
      internal1: item.int1,
      internal2: item.int2,
      assignmentScore: item.assign,
      assignmentsSubmitted: item.submitted,
      assignmentsTotal: item.total,
      previousCgpa: item.cgpa,
      backlogs: item.backlogs,
      labScore: item.lab,
      facultyMentorId: mentor.id,
      facultyMentorName: mentor.name,
    });

    students.push(student);
  });

  // Add additional cohort students
  branches.forEach((br, bIdx) => {
    const mentor = facultyList.find((f) => f.branch === br) || facultyList[0];
    for (let i = 7; i <= 10; i++) {
      const nameIdx = (bIdx * 3 + i) % additionalNames.length;
      const firstName = additionalNames[nameIdx];
      const rollNo = generateRollNumber(br, i);
      const isRiskCase = i === 7 && bIdx % 2 === 0;

      const att = isRiskCase ? 62 + (i % 6) : 76 + (i * 2) % 22;
      const int1 = isRiskCase ? 44 + (i % 8) : 68 + (i * 3) % 28;
      const int2 = isRiskCase ? int1 - 4 : Math.min(98, int1 + 3);
      const assign = isRiskCase ? 58 : 82 + (i % 15);
      const cgpa = isRiskCase ? 6.1 : 7.2 + (i % 25) / 10;
      const backlogs = isRiskCase ? 2 : 0;
      const lab = isRiskCase ? 56 : 80 + (i % 18);

      const student = createStudentEntity({
        id: `std_cohort_${br}_${i}`,
        rollNo,
        name: `${firstName} ${br === 'CSE' ? 'Reddy' : br === 'ECE' ? 'Rao' : 'Kumar'}`,
        branch: br,
        semester: 5,
        attendance: att,
        internal1: int1,
        internal2: int2,
        assignmentScore: assign,
        assignmentsSubmitted: isRiskCase ? 5 : 8,
        assignmentsTotal: 8,
        previousCgpa: Number(cgpa.toFixed(2)),
        backlogs,
        labScore: lab,
        facultyMentorId: mentor.id,
        facultyMentorName: mentor.name,
      });

      students.push(student);
    }
  });

  // Assign student IDs back to faculty mentors
  facultyList.forEach((fac) => {
    fac.assignedStudentIds = students.filter((s) => s.branch === fac.branch).map((s) => s.id);
  });

  // Sample real interventions created by faculty
  const rahulStudent = students.find((s) => s.name === 'Rahul Kumar') || students[0];
  const arjunStudent = students.find((s) => s.name === 'Arjun Reddy') || students[1];
  const naveenStudent = students.find((s) => s.name === 'Naveen Teja') || students[2];

  const interventions: Intervention[] = [
    {
      id: 'int_1',
      studentId: rahulStudent.id,
      studentRollNo: rahulStudent.rollNo,
      studentName: rahulStudent.name,
      facultyId: facultyList[0].id,
      facultyName: facultyList[0].name,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'FACULTY_MEETING',
      status: 'IN_PROGRESS',
      description: 'Counseling regarding low attendance (61%) and falling internal scores. Designed 4-week recovery milestone.',
      actionItems: [
        'Mandate 90% attendance in DBMS & OS lectures',
        'Enroll in Saturday remedial problem sessions',
        'Submit overdue DBMS Assignment 4 by Monday',
        'Bi-weekly progress check with Class Mentor',
      ],
      notes: 'Student acknowledged transportation difficulties. Arranged college bus pass adjustment. Student committed to full attendance.',
      targetAttendance: 78,
      targetInternalScore: 65,
      initialRiskProbability: 87,
      currentRiskProbability: 76,
      outcomeStatus: 'IMPROVED',
    },
    {
      id: 'int_2',
      studentId: arjunStudent.id,
      studentRollNo: arjunStudent.rollNo,
      studentName: arjunStudent.name,
      facultyId: facultyList[0].id,
      facultyName: facultyList[0].name,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'PARENT_COMMUNICATION',
      status: 'OUTCOME_MEASURED',
      description: 'Informed parents regarding 3 active backlogs and 58% attendance warning. Held joint meeting in HOD chamber.',
      actionItems: [
        'Parental monitoring of daily college departure and arrival',
        'Special coaching after 4:30 PM for backlog clearing',
        'Weekly attendance SMS broadcast to parents',
      ],
      notes: 'Parents visited campus on 18th Aug. Supportive and promised regular supervision at home.',
      targetAttendance: 75,
      targetInternalScore: 60,
      initialRiskProbability: 84,
      currentRiskProbability: 64,
      outcomeNotes: 'Attendance improved from 58% to 69% over last two weeks. Internal 2 score rose to 55%.',
      outcomeStatus: 'IMPROVED',
    },
    {
      id: 'int_3',
      studentId: naveenStudent.id,
      studentRollNo: naveenStudent.rollNo,
      studentName: naveenStudent.name,
      facultyId: facultyList[4].id,
      facultyName: facultyList[4].name,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'EXTRA_CLASSES',
      status: 'PLANNED',
      description: 'Scheduled Remedial VLSI and Microprocessors coaching to address 4 active backlogs and 52% attendance.',
      actionItems: [
        'Assign peer mentor (Mahesh Goud - Class Topper)',
        'Attendance tracking in remedial register',
        'Lab practical catch-up sessions on alternate Saturdays',
      ],
      notes: 'Scheduled to start this Thursday at 4:45 PM in Room 204.',
      initialRiskProbability: 92,
      targetAttendance: 75,
      targetInternalScore: 60,
    },
  ];

  saveStudents(students);
  saveFaculty(facultyList);
  saveInterventions(interventions);

  // Set default active student to Rahul for smooth student dashboard preview
  saveActiveStudentId(rahulStudent.id);
  saveActiveFacultyId(facultyList[0].id);

  return { students, faculty: facultyList, interventions };
}

/**
 * Calculates college wide stats for Admin & Faculty Dashboards
 */
export function getCollegeStats(students: Student[], interventions: Intervention[], facultyList: Faculty[]): CollegeStats {
  const totalStudents = students.length;
  const totalFaculty = facultyList.length;

  if (totalStudents === 0) {
    return {
      totalStudents: 0,
      totalFaculty,
      lowRiskCount: 0,
      mediumRiskCount: 0,
      highRiskCount: 0,
      criticalRiskCount: 0,
      averageAttendance: 0,
      averageCgpa: 0,
      activeInterventionsCount: 0,
      resolvedInterventionsCount: 0,
      interventionsSuccessRate: 0,
    };
  }

  let low = 0;
  let med = 0;
  let high = 0;
  let crit = 0;
  let totalAtt = 0;
  let totalCgpa = 0;

  students.forEach((s) => {
    if (s.assessment.riskLevel === 'CRITICAL') crit++;
    else if (s.assessment.riskLevel === 'HIGH') high++;
    else if (s.assessment.riskLevel === 'MEDIUM') med++;
    else low++;

    totalAtt += s.attendance;
    totalCgpa += s.previousCgpa;
  });

  const safeInterventions = Array.isArray(interventions) ? interventions : [];
  const activeInterventionsCount = safeInterventions.filter((i) => i.status === 'PLANNED' || i.status === 'IN_PROGRESS').length;
  const resolvedInterventionsCount = safeInterventions.filter((i) => i.status === 'COMPLETED' || i.status === 'OUTCOME_MEASURED').length;
  const improvedInterventionsCount = safeInterventions.filter((i) => i.outcomeStatus === 'IMPROVED' || i.outcomeStatus === 'STABILIZED').length;
  const interventionsSuccessRate = resolvedInterventionsCount > 0 ? Math.round((improvedInterventionsCount / resolvedInterventionsCount) * 100) : 85;

  return {
    totalStudents,
    totalFaculty,
    lowRiskCount: low,
    mediumRiskCount: med,
    highRiskCount: high,
    criticalRiskCount: crit,
    averageAttendance: Math.round(totalAtt / totalStudents),
    averageCgpa: Number((totalCgpa / totalStudents).toFixed(2)),
    activeInterventionsCount,
    resolvedInterventionsCount,
    interventionsSuccessRate,
  };
}

/**
 * CSV Import & Export Utilities
 */
export function exportStudentsToCSV(students: Student[]): string {
  const headers = [
    'student_id',
    'roll_no',
    'name',
    'branch',
    'semester',
    'attendance',
    'internal_1',
    'internal_2',
    'assignment_score',
    'lab_score',
    'previous_cgpa',
    'backlogs',
    'risk_probability',
    'risk_level',
    'result_predicted',
  ];

  const rows = students.map((s) => [
    s.id,
    s.rollNo,
    `"${s.name.replace(/"/g, '""')}"`,
    s.branch,
    s.semester,
    s.attendance,
    s.internal1,
    s.internal2 ?? s.internal1,
    s.assignmentScore,
    s.labScore,
    s.previousCgpa,
    s.backlogs,
    s.assessment.riskProbability,
    s.assessment.riskLevel,
    s.assessment.riskProbability > 60 ? 'At-Risk / Fail' : 'Pass',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function parseCSVToStudents(csvText: string): Student[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]+/g, ''));
  const newStudents: Student[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^"(.*)"$/, '$1'));
    if (values.length < 5) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });

    const rollNo = rowObj['roll_no'] || rowObj['rollno'] || rowObj['student_id'] || `24FH1A05${(90 + i).toString().padStart(2, '0')}`;
    const name = rowObj['name'] || `Student ${i}`;
    const branch = (['AI', 'CSE', 'DS', 'AIML', 'ECE', 'EEE', 'CIVIL', 'MEC'].includes(rowObj['branch']?.toUpperCase())
      ? rowObj['branch'].toUpperCase()
      : 'CSE') as Branch;
    const semester = parseInt(rowObj['semester'] || '5', 10) || 5;
    const attendance = parseFloat(rowObj['attendance'] || '75') || 75;
    const internal1 = parseFloat(rowObj['internal_1'] || rowObj['internal1'] || rowObj['internal_marks'] || '65') || 65;
    const internal2 = rowObj['internal_2'] || rowObj['internal2'] ? parseFloat(rowObj['internal_2'] || rowObj['internal2']) : undefined;
    const assignmentScore = parseFloat(rowObj['assignment_score'] || rowObj['assignmentscore'] || '75') || 75;
    const labScore = parseFloat(rowObj['lab_score'] || rowObj['labscore'] || '75') || 75;
    const previousCgpa = parseFloat(rowObj['previous_cgpa'] || rowObj['previouscgpa'] || rowObj['cgpa'] || '7.0') || 7.0;
    const backlogs = parseInt(rowObj['backlogs'] || '0', 10) || 0;

    const student = createStudentEntity({
      rollNo,
      name,
      branch,
      semester,
      attendance,
      internal1,
      internal2,
      assignmentScore,
      previousCgpa,
      backlogs,
      labScore,
    });

    newStudents.push(student);
  }

  return newStudents;
}

export function calculateCollegeStats(students: Student[], interventions: Intervention[]): CollegeStats {
  const total = students.length;
  if (total === 0) {
    return {
      totalStudents: 0,
      totalFaculty: getFaculty().length,
      lowRiskCount: 0,
      mediumRiskCount: 0,
      highRiskCount: 0,
      criticalRiskCount: 0,
      averageAttendance: 0,
      averageCgpa: 0,
      activeInterventionsCount: 0,
      resolvedInterventionsCount: 0,
      interventionsSuccessRate: 0,
    };
  }

  const critical = students.filter((s) => s.assessment.riskLevel === 'CRITICAL').length;
  const high = students.filter((s) => s.assessment.riskLevel === 'HIGH').length;
  const medium = students.filter((s) => s.assessment.riskLevel === 'MEDIUM').length;
  const low = students.filter((s) => s.assessment.riskLevel === 'LOW').length;

  const totalAtt = students.reduce((acc, s) => acc + s.attendance, 0);
  const totalCgpa = students.reduce((acc, s) => acc + s.previousCgpa, 0);

  const safeInterventions = Array.isArray(interventions) ? interventions : [];
  const activeInterventions = safeInterventions.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'PLANNED').length;
  const resolved = safeInterventions.filter((i) => i.status === 'OUTCOME_MEASURED' || i.status === 'COMPLETED');
  const improved = resolved.filter((i) => i.outcomeStatus === 'IMPROVED' || (i.currentRiskProbability !== undefined && i.currentRiskProbability < i.initialRiskProbability)).length;
  const successRate = resolved.length > 0 ? Math.round((improved / resolved.length) * 100) : 88;

  return {
    totalStudents: total,
    totalFaculty: getFaculty().length || 8,
    lowRiskCount: low,
    mediumRiskCount: medium,
    highRiskCount: high,
    criticalRiskCount: critical,
    averageAttendance: Math.round(totalAtt / total),
    averageCgpa: parseFloat((totalCgpa / total).toFixed(2)),
    activeInterventionsCount: activeInterventions,
    resolvedInterventionsCount: resolved.length,
    interventionsSuccessRate: successRate,
  };
}

export function updateFacultyEntity(faculty: Faculty): Faculty[] {
  const current = getFaculty();
  const index = current.findIndex((f) => f.id === faculty.id);
  let updated: Faculty[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = faculty;
  } else {
    updated = [...current, faculty];
  }
  saveFaculty(updated);
  return updated;
}

export function deleteStudentEntity(id: string): Student[] {
  const current = getStudents();
  const updated = current.filter((s) => s.id !== id);
  saveStudents(updated);
  return updated;
}

export function deleteFacultyEntity(id: string): Faculty[] {
  const current = getFaculty();
  const updated = current.filter((f) => f.id !== id);
  saveFaculty(updated);
  return updated;
}

export function clearAllCollegeData(): void {
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.FACULTY);
  localStorage.removeItem(STORAGE_KEYS.INTERVENTIONS);
}

export function recordInterventionEntity(intervention: Intervention): Intervention[] {
  const current = getInterventions();
  const updated = [intervention, ...current];
  saveInterventions(updated);
  return updated;
}

export const getStoredStudents = getStudents;
export const getStoredFaculty = getFaculty;
export const getStoredInterventions = getInterventions;
