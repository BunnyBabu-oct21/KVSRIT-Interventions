import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  FileText,
  HelpCircle,
  Lightbulb,
  Phone,
  Printer,
  RefreshCw,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  X
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Intervention, Student } from '../types';
import { getRiskBadgeColor, simulateWhatIf } from '../services/mlEngine';

interface StudentDetailModalProps {
  isOpen?: boolean;
  student: Student | null;
  interventions?: Intervention[];
  onClose: () => void;
  onOpenInterventionModal: (student: Student) => void;
  onOpenReportModal: (student: Student) => void;
  onUpdateStudent?: (student: Student, updates: Partial<Student>) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen = true,
  student,
  interventions = [],
  onClose,
  onOpenInterventionModal,
  onOpenReportModal,
  onUpdateStudent,
}) => {
  if (!isOpen || !student) return null;

  // Active tab inside student inspector
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SUBJECTS' | 'WHAT_IF' | 'INTERVENTIONS'>('OVERVIEW');

  // What-If Simulation State
  const [simAttendance, setSimAttendance] = useState<number>(student.attendance);
  const [simInternalAvg, setSimInternalAvg] = useState<number>(student.internalAverage);
  const [simAssignmentScore, setSimAssignmentScore] = useState<number>(student.assignmentScore);
  const [simBacklogs, setSimBacklogs] = useState<number>(student.backlogs);

  const colors = getRiskBadgeColor(student.assessment.riskLevel);
  const studentInterventions = interventions.filter((i) => i.studentId === student.id);

  // Real-time What-If Calculation
  const simulationResult = simulateWhatIf(student, {
    attendance: simAttendance,
    internalAverage: simInternalAvg,
    assignmentScore: simAssignmentScore,
    backlogs: simBacklogs,
  });

  const simBadgeColors = getRiskBadgeColor(simulationResult.predictedRiskLevel);

  const resetWhatIf = () => {
    setSimAttendance(student.attendance);
    setSimInternalAvg(student.internalAverage);
    setSimAssignmentScore(student.assignmentScore);
    setSimBacklogs(student.backlogs);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05060b]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0a0b14] border border-[#1f2238] rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1a1d30] flex items-center justify-between bg-[#0f111e]/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-lg">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white">
                  {student.name}
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#16192b] text-cyan-300 border border-[#232742] font-bold">
                  {student.rollNo}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {student.branch} • Semester {student.semester}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Mentor: {student.facultyMentorName || 'Assigned Department Faculty'} • KVSRIT
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenReportModal(student)}
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#16192b] hover:bg-[#1f233d] text-slate-300 border border-[#232742] transition"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Print AI Report
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#16192b] text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 px-6 pt-3 border-b border-[#1a1d30] bg-[#0a0b14] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'OVERVIEW'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Explainable AI Overview
          </button>
          <button
            onClick={() => setActiveTab('SUBJECTS')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'SUBJECTS'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Subject-Level Risk ({student.subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('WHAT_IF')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center ${
              activeTab === 'WHAT_IF'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 mr-1" />
            What-If Simulator
          </button>
          <button
            onClick={() => setActiveTab('INTERVENTIONS')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center ${
              activeTab === 'INTERVENTIONS'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 mr-1" />
            Interventions & Action Plan ({studentInterventions.length})
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#05060b]/60">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Top Banner: Risk Level & Probability */}
              <div
                className={`rounded-2xl p-5 border ${colors.border} ${colors.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{colors.icon}</span>
                    <h3 className={`text-lg font-black tracking-tight ${colors.text}`}>
                      {student.assessment.riskLevel} RISK PREDICTED — {student.assessment.riskProbability}%
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Early-warning machine learning model predicts high probability of academic detention or semester failure without timely faculty intervention.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenInterventionModal(student)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition"
                  >
                    <UserCheck className="w-4 h-4 mr-1.5" />
                    Record Intervention
                  </button>
                </div>
              </div>

              {/* Grid: 6 Core Parameter Snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-[#0f111a] p-3.5 rounded-xl border border-[#1f2238]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Attendance</div>
                  <div
                    className={`text-lg font-extrabold mt-1 ${
                      student.attendance < 75 ? 'text-rose-400' : 'text-white'
                    }`}
                  >
                    {student.attendance}%
                  </div>
                  <div className="text-[10px] text-slate-500">Min 75% required</div>
                </div>

                <div className="bg-[#0f111a] p-3.5 rounded-xl border border-[#1f2238]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Internal 1</div>
                  <div className="text-lg font-extrabold text-white mt-1">
                    {student.internal1}%
                  </div>
                  <div className="text-[10px] text-slate-500">Mid assessment</div>
                </div>

                <div className="bg-[#0f111a] p-3.5 rounded-xl border border-[#1f2238]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Internal 2</div>
                  <div className="text-lg font-extrabold text-white mt-1">
                    {student.internal2 !== undefined ? `${student.internal2}%` : 'Pending'}
                  </div>
                  <div className="text-[10px] text-slate-500">Avg: {Math.round(student.internalAverage)}%</div>
                </div>

                <div className="bg-[#0f111a] p-3.5 rounded-xl border border-[#1f2238]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Assignments</div>
                  <div className="text-lg font-extrabold text-white mt-1">
                    {student.assignmentsSubmitted}/{student.assignmentsTotal}
                  </div>
                  <div className="text-[10px] text-slate-500">{student.assignmentScore}% score</div>
                </div>

                <div className="bg-[#0f111a] p-3.5 rounded-xl border border-[#1f2238]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Prior CGPA</div>
                  <div className="text-lg font-extrabold text-white mt-1">
                    {student.previousCgpa.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">Scale of 10.0</div>
                </div>

                <div className="bg-[#0f111a] p-3.5 rounded-xl border border-[#1f2238]">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Backlogs</div>
                  <div
                    className={`text-lg font-extrabold mt-1 ${
                      student.backlogs > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {student.backlogs}
                  </div>
                  <div className="text-[10px] text-slate-500">Active subjects</div>
                </div>
              </div>

              {/* Two Column: Contributing Factors (SHAP Breakdown) & "WHY?" Reasons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Feature Contribution / SHAP */}
                <div className="bg-[#0f111a] border border-[#1f2238] rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center">
                      <Sparkles className="w-4 h-4 mr-1.5 text-cyan-400" />
                      Contributing Factors (Explainable AI)
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Decomposed Risk Drivers
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {student.assessment.contributingFactors.map((factor) => (
                      <div key={factor.featureName} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">
                            {factor.displayName}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-mono text-slate-400">
                              {factor.valueDisplay}
                            </span>
                            <span className="font-bold text-white w-9 text-right">
                              {factor.contributionPercent}%
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 bg-[#16192b] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              factor.contributionPercent >= 30
                                ? 'bg-rose-500'
                                : factor.contributionPercent >= 18
                                ? 'bg-orange-500'
                                : factor.contributionPercent >= 10
                                ? 'bg-amber-500'
                                : 'bg-cyan-500'
                            }`}
                            style={{ width: `${factor.contributionPercent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1a1d30] text-[11px] text-slate-500">
                    Weights calibrated via Random Forest feature importances on engineering cohorts.
                  </div>
                </div>

                {/* 2. "WHY?" Diagnostics & Action Recommendations */}
                <div className="space-y-4">
                  {/* WHY Box */}
                  <div className="bg-[#0f111a] border border-[#1f2238] rounded-2xl p-5 shadow-sm">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center mb-3 text-rose-400">
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      Root Causes (Why at Risk?)
                    </h4>
                    <ul className="space-y-2">
                      {student.assessment.reasons.map((reason, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-xs font-medium text-slate-300"
                        >
                          <span className="text-rose-400 font-bold mr-2">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Action Box */}
                  <div className="bg-[#0f111a] border border-[#1f2238] rounded-2xl p-5 shadow-sm">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center mb-3 text-cyan-400">
                      <Lightbulb className="w-4 h-4 mr-1.5" />
                      Recommended Interventions
                    </h4>
                    <ul className="space-y-2">
                      {student.assessment.recommendedActions.map((action, idx) => (
                        <li
                          key={idx}
                          className="flex items-start text-xs font-medium text-slate-300"
                        >
                          <span className="text-cyan-400 mr-2 font-bold">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Performance Trend Analysis (Sparkline / Line Chart) */}
              <div className="bg-[#0f111a] border border-[#1f2238] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center">
                      <TrendingDown className="w-4 h-4 mr-1.5 text-indigo-400" />
                      Internal Exam Trajectory Trend
                    </h4>
                    <p className="text-xs text-slate-400">
                      Trajectory across Unit Tests and Mid Exams against Class Benchmark
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      student.assessment.trendDirection === 'CRITICAL_DROP'
                        ? 'bg-rose-950/50 text-rose-300 border border-rose-800/50'
                        : student.assessment.trendDirection === 'DECLINING'
                        ? 'bg-orange-950/50 text-orange-300 border border-orange-800/50'
                        : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50'
                    }`}
                  >
                    Trend: {student.assessment.trendDirection.replace('_', ' ')}
                  </span>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={student.trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#232742" />
                      <XAxis dataKey="testName" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f111a', borderColor: '#232742', color: '#fff', borderRadius: '0.75rem' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Student Marks (%)"
                        stroke="#38bdf8"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#38bdf8' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="averageClassScore"
                        name="Class Benchmark"
                        stroke="#64748b"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBJECT-LEVEL RISK */}
          {activeTab === 'SUBJECTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Subject-Wise Failure Risk Breakdown
                  </h3>
                  <p className="text-xs text-slate-400">
                    Individual subject-level risk calculations based on subject attendance and mid marks.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.subjects.map((sub) => {
                  const subBadge = getRiskBadgeColor(sub.riskLevel);
                  return (
                    <div
                      key={sub.code}
                      className="bg-[#0f111a] border border-[#1f2238] rounded-2xl p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-cyan-400/80">
                            {sub.code}
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            {sub.name}
                          </h4>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-black flex items-center ${subBadge.bg} ${subBadge.text} border ${subBadge.border}`}
                        >
                          <span className="mr-1">{subBadge.icon}</span>
                          {sub.riskProbability}% Risk
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 bg-[#16192b] p-2.5 rounded-xl border border-[#1f2238]">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Attendance</div>
                          <div
                            className={`font-bold ${
                              sub.attendance < 75 ? 'text-rose-400' : 'text-slate-100'
                            }`}
                          >
                            {sub.attendance}%
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Mid 1 / Mid 2</div>
                          <div className="font-bold text-slate-100">
                            {sub.internal1}% {sub.internal2 !== undefined ? `| ${sub.internal2}%` : ''}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Assignments</div>
                          <div className="font-bold text-slate-100">
                            {sub.assignmentScore}%
                          </div>
                        </div>
                      </div>

                      <div className="w-full bg-[#16192b] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            sub.riskProbability >= 80
                              ? 'bg-rose-500'
                              : sub.riskProbability >= 60
                              ? 'bg-orange-500'
                              : sub.riskProbability >= 30
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${sub.riskProbability}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: WHAT-IF SIMULATOR */}
          {activeTab === 'WHAT_IF' && (
            <div className="space-y-6">
              <div className="bg-[#121528] text-white p-5 rounded-2xl border border-indigo-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 mb-1">
                    <Sliders className="w-3.5 h-3.5 mr-1" />
                    Simulate Student Academic Recovery
                  </div>
                  <h3 className="text-lg font-bold">
                    What happens if {student.name.split(' ')[0]} improves key indicators?
                  </h3>
                  <p className="text-xs text-indigo-200/80 mt-0.5">
                    Adjust the sliders below to see real-time recalculation from the early warning ML model.
                  </p>
                </div>

                <button
                  onClick={resetWhatIf}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#1e2340] hover:bg-[#282f54] text-xs font-medium text-indigo-200 border border-indigo-500/30 transition self-start md:self-center"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Sliders
                </button>
              </div>

              {/* What-If Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Actual */}
                <div className="bg-[#0f111a] border border-[#1f2238] p-5 rounded-2xl shadow-sm text-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Current Risk</span>
                  <div className="text-3xl font-black text-rose-400 mt-1">
                    {student.assessment.riskProbability}%
                  </div>
                  <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-950/60 border border-rose-800/50 text-rose-300">
                    🔴 {student.assessment.riskLevel}
                  </div>
                </div>

                {/* Simulated Outcome */}
                <div className="bg-[#0f111a] border-2 border-indigo-500/80 p-5 rounded-2xl shadow-lg text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                    SIMULATED
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Predicted Risk</span>
                  <div className="text-3xl font-black text-indigo-400 mt-1">
                    {simulationResult.predictedRisk}%
                  </div>
                  <div
                    className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${simBadgeColors.bg} ${simBadgeColors.text}`}
                  >
                    {simBadgeColors.icon} {simulationResult.predictedRiskLevel}
                  </div>
                </div>

                {/* Risk Delta / Improvement */}
                <div className="bg-[#0f111a] border border-[#1f2238] p-5 rounded-2xl shadow-sm text-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Net Improvement</span>
                  <div
                    className={`text-3xl font-black mt-1 ${
                      simulationResult.riskDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {simulationResult.riskDelta <= 0 ? `-${simulationResult.improvementPercent}%` : `+${simulationResult.improvementPercent}%`}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    {simulationResult.verdictText}
                  </p>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="bg-[#0f111a] border border-[#1f2238] p-6 rounded-2xl space-y-5">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Adjust Indicators (What-If Parameters)
                </h4>

                {/* Slider: Attendance */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200">
                      Attendance Rate: <strong className="text-indigo-400 text-sm">{simAttendance}%</strong>
                    </span>
                    <span className="text-slate-500">Current: {student.attendance}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={simAttendance}
                    onChange={(e) => setSimAttendance(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-[#1a1d30] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Slider: Internal Marks Average */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200">
                      Internal Marks Average: <strong className="text-indigo-400 text-sm">{simInternalAvg}%</strong>
                    </span>
                    <span className="text-slate-500">Current: {Math.round(student.internalAverage)}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={simInternalAvg}
                    onChange={(e) => setSimInternalAvg(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-[#1a1d30] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Slider: Assignment Score */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200">
                      Assignment Completion: <strong className="text-indigo-400 text-sm">{simAssignmentScore}%</strong>
                    </span>
                    <span className="text-slate-500">Current: {student.assignmentScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={simAssignmentScore}
                    onChange={(e) => setSimAssignmentScore(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-[#1a1d30] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                {/* Slider: Backlogs */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200">
                      Backlogs Cleared to: <strong className="text-indigo-400 text-sm">{simBacklogs} backlogs</strong>
                    </span>
                    <span className="text-slate-500">Current: {student.backlogs}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={simBacklogs}
                    onChange={(e) => setSimBacklogs(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-[#1a1d30] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INTERVENTIONS & ACTION PLAN */}
          {activeTab === 'INTERVENTIONS' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Mentorship & Intervention History ({studentInterventions.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Track corrective actions taken and evaluate measurable outcome improvement.
                  </p>
                </div>

                <button
                  onClick={() => onOpenInterventionModal(student)}
                  className="inline-flex items-center px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition"
                >
                  <UserCheck className="w-4 h-4 mr-1.5" />
                  New Intervention
                </button>
              </div>

              {studentInterventions.length === 0 ? (
                <div className="bg-[#0f111a] border border-[#1f2238] p-8 rounded-2xl text-center space-y-3">
                  <ClipboardList className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">
                    No logged interventions for {student.name} yet.
                  </p>
                  <button
                    onClick={() => onOpenInterventionModal(student)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg"
                  >
                    Schedule First Counseling / Intervention
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentInterventions.map((intv) => (
                    <div
                      key={intv.id}
                      className="bg-[#0f111a] border border-[#1f2238] rounded-2xl p-5 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1a1d30] pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-950/60 border border-blue-800/50 text-blue-300">
                            {intv.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400">
                            By {intv.facultyName} • {new Date(intv.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold self-start ${
                            intv.status === 'OUTCOME_MEASURED'
                              ? 'bg-emerald-950/60 border border-emerald-800/50 text-emerald-300'
                              : intv.status === 'IN_PROGRESS'
                              ? 'bg-amber-950/60 border border-amber-800/50 text-amber-300'
                              : 'bg-slate-800 border border-slate-700 text-slate-300'
                          }`}
                        >
                          Status: {intv.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-medium">
                        {intv.description}
                      </p>

                      {intv.actionItems && intv.actionItems.length > 0 && (
                        <div className="bg-[#16192b] border border-[#1f2238] p-3 rounded-xl space-y-1.5">
                          <div className="text-[11px] font-bold text-slate-400 uppercase">Action Checklist</div>
                          {intv.actionItems.map((item, i) => (
                            <div key={i} className="flex items-center text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-2 flex-shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {intv.outcomeNotes && (
                        <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/50 text-xs text-emerald-300">
                          <strong>Measured Outcome:</strong> {intv.outcomeNotes} (Result:{' '}
                          {intv.outcomeStatus || 'IMPROVED'})
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#1a1d30] bg-[#0a0b14] flex items-center justify-between text-xs text-slate-500">
          <div>
            Last assessed: {new Date(student.updatedAt).toLocaleTimeString()} • Model: Random Forest Ensemble
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#16192b] hover:bg-[#1f233d] font-semibold rounded-xl text-slate-300 border border-[#232742] transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
