import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Heart,
  HelpCircle,
  Layers,
  Lightbulb,
  ListTodo,
  Phone,
  RefreshCw,
  Sliders,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users
} from 'lucide-react';
import { Intervention, Student } from '../types';
import { getRiskBadgeColor, simulateWhatIf } from '../services/mlEngine';

interface StudentDashboardProps {
  students: Student[];
  activeStudent: Student | null;
  interventions?: Intervention[];
  onSelectActiveStudent: (studentId: string) => void;
  onOpenWhatIf: (student: Student) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  students,
  activeStudent,
  interventions = [],
  onSelectActiveStudent,
  onOpenWhatIf,
}) => {
  const currentStudent = activeStudent || students[0];

  // Self What-If Interactive Sandbox in Student Portal
  const [targetAttendance, setTargetAttendance] = useState<number>(currentStudent?.attendance || 75);
  const [targetInternalScore, setTargetInternalScore] = useState<number>(Math.round(currentStudent?.internalAverage || 65));

  if (!currentStudent) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-[#0a0b14] rounded-3xl border border-[#1f2238]">
        <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">No Student Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please add or select a student to view the student success dashboard.</p>
      </div>
    );
  }

  const colors = getRiskBadgeColor(currentStudent.assessment?.riskLevel || 'LOW');
  const studentInterventions = (interventions || []).filter((i) => i.studentId === currentStudent.id);

  // Self what-if calculation
  const sim = simulateWhatIf(currentStudent, {
    attendance: targetAttendance,
    internalAverage: targetInternalScore,
  });

  // Calculate classes required to reach 75%
  // Assuming 60 total conducted classes so far
  const totalConducted = 60;
  const currentAttended = Math.round(((currentStudent.attendance || 0) / 100) * totalConducted);
  // Formula: (currentAttended + X) / (totalConducted + X) = 0.75 => 0.25 * X = 0.75 * totalConducted - currentAttended
  const classesNeededTo75 = Math.max(
    0,
    Math.ceil((0.75 * totalConducted - currentAttended) / 0.25)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Profile & Student Selector Switcher */}
      <div className="bg-gradient-to-r from-[#0a1f18] via-[#0c2e22] to-[#0a0b14] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/20">
              {currentStudent.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-1">
                Student Success Portal • KVSRIT
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome, {currentStudent.name?.split(' ')?.[0] || 'Student'} 👋
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-emerald-200/80 font-medium">
                <span className="font-mono bg-[#16192b] px-2 py-0.5 rounded font-bold text-white border border-[#1f2238]">
                  {currentStudent.rollNo}
                </span>
                <span>• {currentStudent.branch} (Sem {currentStudent.semester})</span>
                <span>• Mentor: {currentStudent.facultyMentorName || 'Faculty Incharge'}</span>
              </div>
            </div>
          </div>

          {/* Quick Student Switcher for Demonstration */}
          <div className="bg-[#0a0b14]/90 border border-[#1f2238] p-3 rounded-2xl flex flex-col space-y-1.5 self-start md:self-auto min-w-[220px]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Switch Student View
            </span>
            <select
              value={currentStudent.id}
              onChange={(e) => onSelectActiveStudent(e.target.value)}
              className="px-3 py-1.5 bg-[#16192b] border border-[#1f2238] rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rollNo} - {s.branch}) [{s.assessment?.riskLevel || 'LOW'}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main 2-Column Academic Health & Indicators Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic Health & Key Indicators */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Health Card */}
          <div className="bg-[#0a0b14] border border-[#1f2238] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Academic Health Index
                </span>
                <h3 className="text-xl font-black text-slate-100 mt-0.5">
                  Overall Standing: {currentStudent.assessment?.academicHealthScore ?? 75}%
                </h3>
              </div>

              <div
                className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black self-start ${colors.bg} ${colors.text} border ${colors.border}`}
              >
                <span className="mr-1.5">{colors.icon}</span>
                Current Risk: {currentStudent.assessment.riskLevel} ({currentStudent.assessment.riskProbability}%)
              </div>
            </div>

            {/* Visual Health Meter Progress */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-600 dark:text-slate-400">Continuous Evaluation Health</span>
                <span className="text-emerald-600">{currentStudent.assessment.academicHealthScore} / 100</span>
              </div>
              <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    currentStudent.assessment.academicHealthScore >= 70
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : currentStudent.assessment.academicHealthScore >= 45
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-rose-600 to-orange-500'
                  }`}
                  style={{ width: `${currentStudent.assessment.academicHealthScore}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {currentStudent.assessment.riskLevel === 'LOW'
                ? 'Excellent academic health! You are consistently on track for first-class graduation and placement clearance.'
                : currentStudent.assessment.riskLevel === 'MEDIUM'
                ? 'Moderate performance with warning indicators. Following your recovery checklist will quickly boost you to the green zone.'
                : 'Immediate action required. Please connect with your mentor to clear backlogs and recover required attendance.'}
            </p>
          </div>

          {/* 4 Key Indicators Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Attendance */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Attendance</span>
                {currentStudent.attendance < 75 ? (
                  <span className="text-xs text-rose-500 font-bold">⚠️ Low</span>
                ) : (
                  <span className="text-xs text-emerald-500 font-bold">👍 Good</span>
                )}
              </div>
              <div
                className={`text-2xl font-black mt-2 ${
                  currentStudent.attendance < 75 ? 'text-rose-600' : 'text-slate-900 dark:text-white'
                }`}
              >
                {currentStudent.attendance}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {currentStudent.attendance < 75
                  ? `Attend next ${classesNeededTo75 || 5} classes`
                  : 'Above 75% threshold'}
              </div>
            </div>

            {/* Internal Average */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Internal Avg</span>
                {currentStudent.internalAverage >= 60 ? (
                  <span className="text-xs text-emerald-500 font-bold">👍 Good</span>
                ) : (
                  <span className="text-xs text-amber-500 font-bold">⚠️ Needs boost</span>
                )}
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {Math.round(currentStudent.internalAverage)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                I1: {currentStudent.internal1}% {currentStudent.internal2 !== undefined ? `| I2: ${currentStudent.internal2}%` : ''}
              </div>
            </div>

            {/* Assignments */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Assignments</span>
                <span className="text-xs text-blue-500 font-bold">
                  {currentStudent.assignmentsSubmitted}/{currentStudent.assignmentsTotal}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {currentStudent.assignmentScore}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {currentStudent.assignmentsTotal - currentStudent.assignmentsSubmitted > 0
                  ? `${currentStudent.assignmentsTotal - currentStudent.assignmentsSubmitted} pending submission`
                  : 'All tasks up to date'}
              </div>
            </div>

            {/* Backlogs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Backlogs</span>
                {currentStudent.backlogs > 0 ? (
                  <span className="text-xs text-rose-500 font-bold">Active</span>
                ) : (
                  <span className="text-xs text-emerald-500 font-bold">Clear</span>
                )}
              </div>
              <div
                className={`text-2xl font-black mt-2 ${
                  currentStudent.backlogs > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {currentStudent.backlogs}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                CGPA: {currentStudent.previousCgpa.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Subject-Wise Performance Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Subject-Wise Standing & Risk
                </h3>
                <p className="text-xs text-slate-500">
                  Track individual subject scores and see where to allocate your study time.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {currentStudent.subjects.map((sub) => {
                const subBadge = getRiskBadgeColor(sub.riskLevel);
                return (
                  <div
                    key={sub.code}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-400">{sub.code}</span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {sub.name}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>
                          Attendance:{' '}
                          <strong
                            className={sub.attendance < 75 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}
                          >
                            {sub.attendance}%
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Mid 1: <strong>{sub.internal1}%</strong>
                        </span>
                        {sub.internal2 !== undefined && (
                          <>
                            <span>•</span>
                            <span>
                              Mid 2: <strong>{sub.internal2}%</strong>
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>
                          Assignments: <strong>{sub.assignmentScore}%</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center ${subBadge.bg} ${subBadge.text} border ${subBadge.border}`}
                      >
                        <span className="mr-1">{subBadge.icon}</span>
                        {sub.riskProbability}% Risk
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: "Areas to Improve" & Personalized Recovery Roadmap */}
        <div className="space-y-6">
          {/* Areas to Improve Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Areas to Improve
              </h3>
            </div>

            <div className="space-y-2.5">
              {currentStudent.attendance < 75 && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50 flex items-start space-x-2.5">
                  <span className="text-rose-500 text-sm">📌</span>
                  <div className="text-xs">
                    <div className="font-bold text-rose-800 dark:text-rose-300">
                      Attendance Shortfall ({currentStudent.attendance}%)
                    </div>
                    <p className="text-rose-700/80 dark:text-rose-400 mt-0.5">
                      Must attend next {classesNeededTo75 || 5} continuous lecture hours to reach mandatory 75% eligibility cutoff.
                    </p>
                  </div>
                </div>
              )}

              {currentStudent.subjects
                .filter((s) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH')
                .map((sub) => (
                  <div
                    key={sub.code}
                    className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-start space-x-2.5"
                  >
                    <span className="text-amber-500 text-sm">📌</span>
                    <div className="text-xs">
                      <div className="font-bold text-amber-800 dark:text-amber-300">
                        {sub.name}
                      </div>
                      <p className="text-amber-700/80 dark:text-amber-400 mt-0.5">
                        High risk predicted ({sub.riskProbability}%). Review unit 2 notes and attend remedial tutorial.
                      </p>
                    </div>
                  </div>
                ))}

              {currentStudent.backlogs > 0 && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900/50 flex items-start space-x-2.5">
                  <span className="text-indigo-500 text-sm">📌</span>
                  <div className="text-xs">
                    <div className="font-bold text-indigo-800 dark:text-indigo-300">
                      {currentStudent.backlogs} Backlog Subject(s)
                    </div>
                    <p className="text-indigo-700/80 dark:text-indigo-400 mt-0.5">
                      Enroll in evening backlog coaching sessions to prepare for supplementary examinations.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Recovery Roadmap */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Personalized Recovery Goals
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    → Attend Next 5 Consecutive Classes
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Will raise overall presence by +4.2% towards safe zone.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    → Complete Pending Subject Assignments
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Submit to faculty mentor before end of week.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    → Practice 30 min/day on Weak Topics
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Focus on previous semester question papers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Self What-If Simulator Widget */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-indigo-700/50 space-y-4">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold">
                Goal Calculator (Self What-If)
              </h3>
            </div>
            <p className="text-xs text-indigo-200">
              See how your risk score drops if you improve your attendance & test scores.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Target Attendance:</span>
                  <strong className="text-indigo-300">{targetAttendance}%</strong>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={targetAttendance}
                  onChange={(e) => setTargetAttendance(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Target Internal Score:</span>
                  <strong className="text-indigo-300">{targetInternalScore}%</strong>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={targetInternalScore}
                  onChange={(e) => setTargetInternalScore(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>
            </div>

            {/* Calculated Goal Outcome */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-indigo-500/30 flex items-center justify-between text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Target Risk</div>
                <div className="text-lg font-black text-indigo-300">
                  {sim.predictedRisk}% ({sim.predictedRiskLevel})
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase">Drop</div>
                <div className="text-sm font-bold text-emerald-400">
                  {sim.riskDelta <= 0 ? `-${sim.improvementPercent}%` : `+${sim.improvementPercent}%`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
