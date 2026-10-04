import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  CheckCircle,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  Layers,
  Phone,
  Plus,
  Search,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Upload,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import { Branch, CollegeStats, Faculty, Intervention, RiskLevel, Student } from '../types';
import { BRANCH_CODES, exportStudentsToCSV } from '../services/storage';
import { getRiskBadgeColor } from '../services/mlEngine';

interface FacultyDashboardProps {
  students?: Student[];
  faculty?: Faculty[];
  interventions?: Intervention[];
  stats?: CollegeStats;
  selectedBranch?: string;
  searchQuery?: string;
  onSelectStudent?: (student: Student) => void;
  onOpenAddStudent?: () => void;
  onOpenAddFaculty?: () => void;
  onOpenIntervention?: (student: Student) => void;
  onOpenInterventionModal?: (student: Student) => void;
  onOpenCSVImport?: () => void;
  onOpenWhatIf?: (student: Student) => void;
  onLoadDemoData?: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  students = [],
  faculty = [],
  interventions = [],
  stats,
  selectedBranch: initialBranch = 'ALL',
  searchQuery = '',
  onSelectStudent,
  onOpenAddStudent,
  onOpenAddFaculty,
  onOpenIntervention,
  onOpenInterventionModal,
  onOpenCSVImport,
  onOpenWhatIf,
  onLoadDemoData,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<string>(initialBranch || 'ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState(searchQuery || '');
  const [sortBy, setSortBy] = useState<'risk' | 'attendance' | 'name' | 'roll'>('risk');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const branches: Branch[] = ['AI', 'CSE', 'DS', 'AIML', 'ECE', 'EEE', 'CIVIL', 'MEC'];
  const safeStudents = Array.isArray(students) ? students : [];

  const handleInterventionClick = onOpenInterventionModal || onOpenIntervention;

  // Filter students based on state
  const filteredStudents = safeStudents.filter((s) => {
    if (selectedBranch !== 'ALL' && s.branch !== selectedBranch) return false;
    if (selectedRisk !== 'ALL' && s.assessment?.riskLevel !== selectedRisk) return false;
    if (selectedSemester !== 'ALL' && s.semester?.toString() !== selectedSemester) return false;
    const effectiveSearch = searchFilter || searchQuery;
    if (effectiveSearch.trim()) {
      const q = effectiveSearch.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.rollNo?.toLowerCase().includes(q) ||
        s.branch?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'risk') {
      comparison = b.assessment.riskProbability - a.assessment.riskProbability;
    } else if (sortBy === 'attendance') {
      comparison = a.attendance - b.attendance;
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'roll') {
      comparison = a.rollNo.localeCompare(b.rollNo);
    }
    return sortOrder === 'desc' ? comparison : -comparison;
  });

  // Students requiring immediate attention (High + Critical risk)
  const priorityActionStudents = sortedStudents.filter(
    (s) => s.assessment.riskLevel === 'CRITICAL' || s.assessment.riskLevel === 'HIGH'
  );

  const handleExportCSV = () => {
    const csvContent = exportStudentsToCSV(students);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kvsrit_students_dataset_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* College Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-400" />
              KVSRIT Early Warning Intelligence v2.4
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Student Risk Monitoring Dashboard
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Continuously monitoring academic risk across {branches.length} departments (AI, CSE, DS, AIML, ECE, EEE, CIVIL, MEC) to intervene before semester results.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddStudent}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition active:scale-95"
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              Add Student
            </button>
            <button
              onClick={onOpenAddFaculty}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600/80 hover:bg-indigo-600 text-white border border-indigo-500/40 transition active:scale-95"
            >
              <Users className="w-4 h-4 mr-1.5" />
              Add Faculty
            </button>
            <button
              onClick={onOpenCSVImport}
              className="inline-flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Bulk import CSV records"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import CSV
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Export complete ML dataset"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Risk Summary Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {stats.totalStudents}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center">
            Across {branches.length} engineering streams
          </div>
        </div>

        {/* Low Risk */}
        <div
          onClick={() => setSelectedRisk(selectedRisk === 'LOW' ? 'ALL' : 'LOW')}
          className={`cursor-pointer bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-sm transition hover:scale-[1.02] ${
            selectedRisk === 'LOW' ? 'ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
              Low Risk (0–30%)
            </span>
            <span className="text-lg">🟢</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.lowRiskCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.totalStudents > 0 ? Math.round((stats.lowRiskCount / stats.totalStudents) * 100) : 0}% of cohort
          </div>
        </div>

        {/* Medium Risk */}
        <div
          onClick={() => setSelectedRisk(selectedRisk === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
          className={`cursor-pointer bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-sm transition hover:scale-[1.02] ${
            selectedRisk === 'MEDIUM' ? 'ring-2 ring-amber-500 border-amber-400 bg-amber-50/40 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
              Med Risk (30–60%)
            </span>
            <span className="text-lg">🟡</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {stats.mediumRiskCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Requires monitoring
          </div>
        </div>

        {/* High Risk */}
        <div
          onClick={() => setSelectedRisk(selectedRisk === 'HIGH' ? 'ALL' : 'HIGH')}
          className={`cursor-pointer bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-sm transition hover:scale-[1.02] ${
            selectedRisk === 'HIGH' ? 'ring-2 ring-orange-500 border-orange-400 bg-orange-50/40 dark:bg-orange-950/20' : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5"></span>
              High Risk (60–80%)
            </span>
            <span className="text-lg">🟠</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400 mt-2">
            {stats.highRiskCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Intervention advised
          </div>
        </div>

        {/* Critical Risk */}
        <div
          onClick={() => setSelectedRisk(selectedRisk === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`cursor-pointer bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 shadow-sm transition hover:scale-[1.02] ${
            selectedRisk === 'CRITICAL' ? 'ring-2 ring-rose-500 border-rose-400 bg-rose-50/40 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-ping"></span>
              Critical (80–100%)
            </span>
            <span className="text-lg">🔴</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {stats.criticalRiskCount}
          </div>
          <div className="text-xs text-rose-600 font-semibold mt-1">
            Immediate action needed
          </div>
        </div>
      </div>

      {/* If dataset is empty, show welcoming prompt with 1-click load */}
      {students.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-10 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No Students Added Yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            You can either add individual students & faculties manually, upload your CSV file, or load the pre-built KVSRIT sample dataset across AI, CSE, DS, AIML, ECE, EEE, CIVIL, and MEC.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onLoadDemoData}
              className="inline-flex items-center px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Load Synthetic College Demo Data (48 Students)
            </button>
            <button
              onClick={onOpenAddStudent}
              className="inline-flex items-center px-4 py-2.5 rounded-xl font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Student
            </button>
          </div>
        </div>
      )}

      {students.length > 0 && (
        <>
          {/* STUDENTS REQUIRING ACTION Priority Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Students Requiring Action ({priorityActionStudents.length})
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                High & Critical risk cases flagged for mentor intervention
              </span>
            </div>

            {priorityActionStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                No high or critical risk students in the selected filter!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                {priorityActionStudents.slice(0, 4).map((student) => {
                  const colors = getRiskBadgeColor(student.assessment.riskLevel);
                  return (
                    <div
                      key={student.id}
                      className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-500">
                              {student.rollNo}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                              {student.name}
                            </h3>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center ${colors.bg} ${colors.text} border ${colors.border}`}
                          >
                            <span className="mr-1">{colors.icon}</span>
                            {student.assessment.riskProbability}%
                          </span>
                        </div>

                        <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex justify-between">
                            <span>Branch & Sem:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {student.branch} • Sem {student.semester}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Attendance:</span>
                            <span
                              className={`font-semibold ${
                                student.attendance < 75 ? 'text-rose-600 font-bold' : 'text-slate-800'
                              }`}
                            >
                              {student.attendance}% {student.attendance < 75 ? '⚠️' : ''}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Internal Avg:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {Math.round(student.internalAverage)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Backlogs:</span>
                            <span
                              className={`font-semibold ${
                                student.backlogs > 0 ? 'text-rose-600 font-bold' : 'text-slate-800'
                              }`}
                            >
                              {student.backlogs} {student.backlogs > 0 ? 'backlogs' : 'None'}
                            </span>
                          </div>
                        </div>

                        {/* Top driver reason */}
                        {student.assessment.reasons[0] && (
                          <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-700 dark:text-rose-300 line-clamp-2">
                            <strong>Why:</strong> {student.assessment.reasons[0]}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                        <button
                          onClick={() => onSelectStudent(student)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold rounded-lg text-xs transition"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View AI Analysis
                        </button>
                        <button
                          onClick={() => onOpenWhatIf(student)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs transition"
                          title="Run What-If Prediction"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Complete Student Cohort Table with Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Filter Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Student Cohort Database ({sortedStudents.length} / {students.length})
                  </h2>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, roll no..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 font-medium flex items-center mr-1">
                  <Filter className="w-3.5 h-3.5 mr-1" /> Filters:
                </span>

                {/* Branch selector */}
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Branches (8)</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b} - {BRANCH_CODES[b]?.name}
                    </option>
                  ))}
                </select>

                {/* Risk selector */}
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Risk Tiers</option>
                  <option value="CRITICAL">🔴 Critical Risk (80–100%)</option>
                  <option value="HIGH">🟠 High Risk (60–80%)</option>
                  <option value="MEDIUM">🟡 Medium Risk (30–60%)</option>
                  <option value="LOW">🟢 Low Risk (0–30%)</option>
                </select>

                {/* Semester selector */}
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s.toString()}>
                      Semester {s}
                    </option>
                  ))}
                </select>

                {/* Sorting */}
                <div className="ml-auto flex items-center space-x-1">
                  <span className="text-slate-400 font-medium mr-1 hidden sm:inline">Sort:</span>
                  <button
                    onClick={() => {
                      if (sortBy === 'risk') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      else {
                        setSortBy('risk');
                        setSortOrder('desc');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg border font-medium transition ${
                      sortBy === 'risk'
                        ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Risk {sortBy === 'risk' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                  <button
                    onClick={() => {
                      if (sortBy === 'attendance') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      else {
                        setSortBy('attendance');
                        setSortOrder('asc');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg border font-medium transition ${
                      sortBy === 'attendance'
                        ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Attendance {sortBy === 'attendance' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Roll No & Name</th>
                    <th className="py-3.5 px-4">Branch/Sem</th>
                    <th className="py-3.5 px-4">Attendance</th>
                    <th className="py-3.5 px-4">Internal Marks</th>
                    <th className="py-3.5 px-4">Assignments</th>
                    <th className="py-3.5 px-4">CGPA / Backlogs</th>
                    <th className="py-3.5 px-4 text-center">Predicted Risk</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedStudents.map((student) => {
                    const colors = getRiskBadgeColor(student.assessment.riskLevel);
                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group cursor-pointer"
                        onClick={() => onSelectStudent(student)}
                      >
                        <td className="py-3 px-4 sm:px-6">
                          <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {student.rollNo}
                          </div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {student.name}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {student.branch} - Sem {student.semester}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-bold ${
                                student.attendance < 75
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {student.attendance}%
                            </span>
                            {student.attendance < 75 && (
                              <span className="text-xs text-rose-500 font-medium" title="Below 75% cutoff">
                                ⚠️
                              </span>
                            )}
                          </div>
                          {/* Mini Progress Bar */}
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                student.attendance < 75 ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${student.attendance}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {Math.round(student.internalAverage)}%
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            I1: {student.internal1}% {student.internal2 !== undefined ? `| I2: ${student.internal2}%` : ''}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {student.assignmentsSubmitted}/{student.assignmentsTotal}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {student.assignmentScore}% score
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {student.previousCgpa.toFixed(2)} CGPA
                          </div>
                          <div className="text-[11px]">
                            {student.backlogs > 0 ? (
                              <span className="text-rose-600 font-bold">{student.backlogs} Backlog(s)</span>
                            ) : (
                              <span className="text-emerald-600 font-medium">0 Backlogs</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black flex items-center ${colors.bg} ${colors.text} border ${colors.border}`}
                            >
                              <span className="mr-1">{colors.icon}</span>
                              {student.assessment.riskProbability}% • {student.assessment.riskLevel}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 sm:px-6 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectStudent?.(student)}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-semibold text-xs transition"
                            title="Inspect Explainable AI Analysis"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Inspect
                          </button>
                          <button
                            onClick={() => handleInterventionClick?.(student)}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-semibold text-xs transition"
                            title="Assign / Record Intervention"
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1" />
                            Action
                          </button>
                          <button
                            onClick={() => onOpenWhatIf(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="What-If Simulator"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
