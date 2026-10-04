import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle,
  Database,
  Download,
  Edit2,
  Eye,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Layers,
  Lock,
  LogOut,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Branch, CollegeStats, Faculty, Intervention, RiskLevel, Student } from '../types';
import { BRANCH_CODES, exportStudentsToCSV } from '../services/storage';
import { DEFAULT_MODEL_WEIGHTS, MLModelWeights, getRiskBadgeColor } from '../services/mlEngine';

interface AdminDashboardProps {
  students: Student[];
  faculty: Faculty[];
  interventions?: Intervention[];
  stats: CollegeStats;
  onOpenAddStudent: () => void;
  onOpenEditStudent?: (student: Student) => void;
  onOpenAddFaculty: () => void;
  onOpenEditFaculty?: (faculty: Faculty) => void;
  onSelectStudent?: (student: Student) => void;
  onOpenCSVImport: () => void;
  onDeleteStudent: (id: string) => void;
  onDeleteFaculty: (id: string) => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  onLockAdmin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  faculty,
  interventions = [],
  stats,
  onOpenAddStudent,
  onOpenEditStudent,
  onOpenAddFaculty,
  onOpenEditFaculty,
  onSelectStudent,
  onOpenCSVImport,
  onDeleteStudent,
  onDeleteFaculty,
  onLoadDemoData,
  onClearAllData,
  onLockAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'FACULTY' | 'ANALYTICS' | 'MODEL_CONFIG' | 'INTERVENTIONS'>('STUDENTS');
  const [modelWeights, setModelWeights] = useState<MLModelWeights>(DEFAULT_MODEL_WEIGHTS);
  const [weightsSavedMessage, setWeightsSavedMessage] = useState(false);

  // Student filtering states
  const [studentSearch, setStudentSearch] = useState('');
  const [studentBranchFilter, setStudentBranchFilter] = useState<string>('ALL');
  const [studentRiskFilter, setStudentRiskFilter] = useState<string>('ALL');
  const [studentSemFilter, setStudentSemFilter] = useState<string>('ALL');
  const [studentViewMode, setStudentViewMode] = useState<'TABLE' | 'GRID'>('TABLE');

  // Faculty filtering states
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyBranchFilter, setFacultyBranchFilter] = useState<string>('ALL');
  const [selectedFacultyMentees, setSelectedFacultyMentees] = useState<Faculty | null>(null);

  // Delete confirmations
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [deletingFacultyId, setDeletingFacultyId] = useState<string | null>(null);

  const branches: Branch[] = ['AI', 'CSE', 'DS', 'AIML', 'ECE', 'EEE', 'CIVIL', 'MEC'];

  // Branch-wise Analytics Calculation
  const branchAnalytics = branches.map((br) => {
    const branchStudents = students.filter((s) => s.branch === br);
    const count = branchStudents.length;
    const critical = branchStudents.filter((s) => s.assessment.riskLevel === 'CRITICAL').length;
    const high = branchStudents.filter((s) => s.assessment.riskLevel === 'HIGH').length;
    const medium = branchStudents.filter((s) => s.assessment.riskLevel === 'MEDIUM').length;
    const low = branchStudents.filter((s) => s.assessment.riskLevel === 'LOW').length;
    const avgAttendance = count > 0 ? Math.round(branchStudents.reduce((a, s) => a + s.attendance, 0) / count) : 0;
    const avgInternal = count > 0 ? Math.round(branchStudents.reduce((a, s) => a + s.internalAverage, 0) / count) : 0;

    return {
      branch: br,
      fullName: BRANCH_CODES[br].name,
      total: count,
      critical,
      high,
      medium,
      low,
      avgAttendance,
      avgInternal,
      atRiskPercent: count > 0 ? Math.round(((critical + high) / count) * 100) : 0,
    };
  });

  // Pie chart data for risk distribution
  const riskPieData = [
    { name: 'Low Risk', value: stats.lowRiskCount, color: '#10b981' },
    { name: 'Medium Risk', value: stats.mediumRiskCount, color: '#f59e0b' },
    { name: 'High Risk', value: stats.highRiskCount, color: '#f97316' },
    { name: 'Critical Risk', value: stats.criticalRiskCount, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  const handleExport = () => {
    const csvContent = exportStudentsToCSV(students);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kvsrit_college_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveWeights = () => {
    setWeightsSavedMessage(true);
    setTimeout(() => setWeightsSavedMessage(false), 3000);
  };

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search
      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchRoll = s.rollNo.toLowerCase().includes(q);
        const matchEmail = s.email ? s.email.toLowerCase().includes(q) : false;
        const matchPhone = s.phone ? s.phone.includes(q) : false;
        const matchMentor = s.facultyMentorName ? s.facultyMentorName.toLowerCase().includes(q) : false;
        if (!matchName && !matchRoll && !matchEmail && !matchPhone && !matchMentor) return false;
      }
      // Branch filter
      if (studentBranchFilter !== 'ALL' && s.branch !== studentBranchFilter) {
        return false;
      }
      // Risk filter
      if (studentRiskFilter !== 'ALL' && s.assessment.riskLevel !== studentRiskFilter) {
        return false;
      }
      // Sem filter
      if (studentSemFilter !== 'ALL' && s.semester.toString() !== studentSemFilter) {
        return false;
      }
      return true;
    });
  }, [students, studentSearch, studentBranchFilter, studentRiskFilter, studentSemFilter]);

  // Filtered faculty list
  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      if (facultySearch.trim()) {
        const q = facultySearch.toLowerCase();
        const matchName = f.name.toLowerCase().includes(q);
        const matchEmpId = f.employeeId.toLowerCase().includes(q);
        const matchEmail = f.email.toLowerCase().includes(q);
        const matchDesig = f.designation.toLowerCase().includes(q);
        if (!matchName && !matchEmpId && !matchEmail && !matchDesig) return false;
      }
      if (facultyBranchFilter !== 'ALL' && f.branch !== facultyBranchFilter) {
        return false;
      }
      return true;
    });
  }, [faculty, facultySearch, facultyBranchFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Shield className="w-3.5 h-3.5 mr-1" />
                KVSRIT Institutional Governance & Admin Portal
              </div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Group: KVSRIT (Authenticated)
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Faculty & Student Entity Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Complete oversight across all 8 branches: Add, update, remove, and monitor students and faculty with real-time ML risk evaluations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddStudent}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Student
            </button>
            <button
              onClick={onOpenAddFaculty}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition active:scale-95"
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              Add Faculty
            </button>
            <button
              onClick={onOpenCSVImport}
              className="inline-flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Upload className="w-4 h-4 mr-1" />
              Import CSV
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
            {onLockAdmin && (
              <button
                onClick={onLockAdmin}
                className="inline-flex items-center px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition"
                title="Lock Admin Portal and require Group Code + Password to access again"
              >
                <Lock className="w-4 h-4 mr-1.5 text-rose-400" />
                Lock Portal
              </button>
            )}
          </div>
        </div>

        {/* Quick Institutional Summary Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-indigo-900/50">
          <div className="bg-slate-900/60 rounded-xl p-3 border border-indigo-900/30">
            <div className="text-slate-400 text-[11px] font-semibold uppercase">Total Students</div>
            <div className="text-xl sm:text-2xl font-black text-white">{students.length}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-indigo-900/30">
            <div className="text-slate-400 text-[11px] font-semibold uppercase">Faculty Mentors</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-300">{faculty.length}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-indigo-900/30">
            <div className="text-slate-400 text-[11px] font-semibold uppercase">Critical Risk</div>
            <div className="text-xl sm:text-2xl font-black text-rose-400">{stats.criticalRiskCount}</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 border border-indigo-900/30">
            <div className="text-slate-400 text-[11px] font-semibold uppercase">Active Interventions</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">{interventions.length}</div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('STUDENTS')}
          className={`pb-2.5 px-4 border-b-2 transition flex items-center ${
            activeTab === 'STUDENTS'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <GraduationCap className="w-4 h-4 mr-1.5" />
          All Students ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('FACULTY')}
          className={`pb-2.5 px-4 border-b-2 transition flex items-center ${
            activeTab === 'FACULTY'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Users className="w-4 h-4 mr-1.5" />
          All Faculty ({faculty.length})
        </button>
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`pb-2.5 px-4 border-b-2 transition flex items-center ${
            activeTab === 'ANALYTICS'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-1.5" />
          Branch Analytics (8)
        </button>
        <button
          onClick={() => setActiveTab('INTERVENTIONS')}
          className={`pb-2.5 px-4 border-b-2 transition flex items-center ${
            activeTab === 'INTERVENTIONS'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <UserCheck className="w-4 h-4 mr-1.5" />
          Interventions ({interventions.length})
        </button>
        <button
          onClick={() => setActiveTab('MODEL_CONFIG')}
          className={`pb-2.5 px-4 border-b-2 transition flex items-center ${
            activeTab === 'MODEL_CONFIG'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Sliders className="w-4 h-4 mr-1.5" />
          ML Model Weights
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL STUDENTS (CRUD WITH FULL DETAILS & ML INDICATORS) */}
      {/* ========================================================================= */}
      {activeTab === 'STUDENTS' && (
        <div className="space-y-4">
          {/* Filters and Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student by Roll No, Name, Email, Phone, or Mentor..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Action and Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Branch filter */}
                <select
                  value={studentBranchFilter}
                  onChange={(e) => setStudentBranchFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="ALL">All Branches (8)</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b} - {BRANCH_CODES[b]?.name}
                    </option>
                  ))}
                </select>

                {/* Risk filter */}
                <select
                  value={studentRiskFilter}
                  onChange={(e) => setStudentRiskFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="CRITICAL">🔴 Critical Risk</option>
                  <option value="HIGH">🟠 High Risk</option>
                  <option value="MEDIUM">🟡 Medium Risk</option>
                  <option value="LOW">🟢 Low Risk</option>
                </select>

                {/* Semester filter */}
                <select
                  value={studentSemFilter}
                  onChange={(e) => setStudentSemFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="ALL">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s.toString()}>
                      Sem {s}
                    </option>
                  ))}
                </select>

                {/* Add button */}
                <button
                  onClick={onOpenAddStudent}
                  className="inline-flex items-center px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Student
                </button>
              </div>
            </div>

            {/* Results count & active filter tags */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div>
                Showing <strong className="text-slate-800 dark:text-slate-200">{filteredStudents.length}</strong> of{' '}
                <strong>{students.length}</strong> enrolled students
              </div>

              {(studentSearch || studentBranchFilter !== 'ALL' || studentRiskFilter !== 'ALL' || studentSemFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setStudentSearch('');
                    setStudentBranchFilter('ALL');
                    setStudentRiskFilter('ALL');
                    setStudentSemFilter('ALL');
                  }}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>

          {/* Students Data Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Student Details</th>
                    <th className="py-3 px-3">Branch / Sem</th>
                    <th className="py-3 px-3">Mentor</th>
                    <th className="py-3 px-3 text-center">Attendance</th>
                    <th className="py-3 px-3 text-center">Internal 1/2</th>
                    <th className="py-3 px-3 text-center">Assignments</th>
                    <th className="py-3 px-3 text-center">CGPA / BL</th>
                    <th className="py-3 px-3 text-center">Lab</th>
                    <th className="py-3 px-3 text-center">ML Risk</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                          <p className="text-sm font-semibold">No students match your filter criteria.</p>
                          <button
                            onClick={onOpenAddStudent}
                            className="text-xs text-cyan-600 font-bold hover:underline"
                          >
                            + Add a new student record
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const badge = getRiskBadgeColor(s.assessment.riskLevel);
                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group"
                        >
                          {/* Student Identity */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                              <span>{s.name}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-[11px]">
                                {s.rollNo}
                              </span>
                              {s.phone && (
                                <span className="text-[10px] text-slate-400 flex items-center">
                                  <Phone className="w-2.5 h-2.5 mr-0.5" />
                                  {s.phone}
                                </span>
                              )}
                            </div>
                            {s.email && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
                                {s.email}
                              </div>
                            )}
                          </td>

                          {/* Branch & Sem */}
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {s.branch}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-1">Sem {s.semester}</div>
                          </td>

                          {/* Mentor */}
                          <td className="py-3 px-3">
                            <div className="text-slate-800 dark:text-slate-200 font-medium text-xs truncate max-w-[130px]">
                              {s.facultyMentorName || 'Unassigned'}
                            </div>
                          </td>

                          {/* Attendance */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                                s.attendance < 75
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {s.attendance}%
                            </span>
                          </td>

                          {/* Internals */}
                          <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300">
                            <div className="font-semibold">
                              {s.internal1}% {s.internal2 !== undefined ? `| ${s.internal2}%` : ''}
                            </div>
                            <div className="text-[10px] text-slate-400">Avg: {s.internalAverage}%</div>
                          </td>

                          {/* Assignments */}
                          <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300">
                            <div className="font-semibold">{s.assignmentScore}%</div>
                            <div className="text-[10px] text-slate-400">
                              {s.assignmentsSubmitted}/{s.assignmentsTotal} done
                            </div>
                          </td>

                          {/* CGPA / Backlogs */}
                          <td className="py-3 px-3 text-center">
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {s.previousCgpa?.toFixed(2) || 'N/A'}
                            </div>
                            {s.backlogs > 0 ? (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                                {s.backlogs} BL
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-semibold">0 BL</span>
                            )}
                          </td>

                          {/* Lab */}
                          <td className="py-3 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                            {s.labScore !== undefined ? `${s.labScore}%` : 'N/A'}
                          </td>

                          {/* ML Risk Badge */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase inline-flex items-center ${badge.bg} ${badge.text}`}
                            >
                              {s.assessment.riskLevel} ({s.assessment.riskProbability}%)
                            </span>
                          </td>

                          {/* Actions Column (Inspect, Edit, Delete) */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              {/* Inspect / View Student Details */}
                              {onSelectStudent && (
                                <button
                                  onClick={() => onSelectStudent(s)}
                                  className="p-1.5 text-slate-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 rounded-lg transition"
                                  title="Inspect Student AI Health & Insights"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Edit / Update Student */}
                              {onOpenEditStudent && (
                                <button
                                  onClick={() => onOpenEditStudent(s)}
                                  className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition"
                                  title="Edit / Update Student Details & Indicators"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete Student */}
                              {deletingStudentId === s.id ? (
                                <div className="flex items-center space-x-1 bg-rose-50 dark:bg-rose-950/60 p-1 rounded-lg border border-rose-200 dark:border-rose-800">
                                  <button
                                    onClick={() => {
                                      onDeleteStudent(s.id);
                                      setDeletingStudentId(null);
                                    }}
                                    className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeletingStudentId(null)}
                                    className="px-1.5 py-0.5 text-slate-400 hover:text-slate-600 text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingStudentId(s.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                                  title="Remove / Delete Student Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ALL FACULTY MENTORS (CRUD WITH DETAILS & MENTEE ALLOCATION) */}
      {/* ========================================================================= */}
      {activeTab === 'FACULTY' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search faculty mentor by Name, Employee ID, Email, or Designation..."
                  value={facultySearch}
                  onChange={(e) => setFacultySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Branch Filter & Add Faculty */}
              <div className="flex items-center space-x-2">
                <select
                  value={facultyBranchFilter}
                  onChange={(e) => setFacultyBranchFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Departments (8)</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b} Department
                    </option>
                  ))}
                </select>

                <button
                  onClick={onOpenAddFaculty}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Add Faculty Mentor
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div>
                Showing <strong className="text-slate-800 dark:text-slate-200">{filteredFaculty.length}</strong> of{' '}
                <strong>{faculty.length}</strong> registered faculty members
              </div>

              {(facultySearch || facultyBranchFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setFacultySearch('');
                    setFacultyBranchFilter('ALL');
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Faculty Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFaculty.map((f) => {
              const mentees = students.filter(
                (s) => s.facultyMentorId === f.id || (!s.facultyMentorId && s.branch === f.branch)
              );
              const atRiskMentees = mentees.filter(
                (s) => s.assessment.riskLevel === 'CRITICAL' || s.assessment.riskLevel === 'HIGH'
              );

              return (
                <div
                  key={f.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-indigo-500/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center font-black text-sm">
                          {f.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                            {f.employeeId}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {f.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{f.designation}</p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {f.branch}
                      </span>
                    </div>

                    {/* Contact details */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Mail className="w-3 h-3 mr-1 text-slate-400" /> Email:
                        </span>
                        <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-[170px]">
                          {f.email}
                        </span>
                      </div>
                      {f.phone && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-slate-400" /> Phone:
                          </span>
                          <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">
                            {f.phone}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Assigned Mentees:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {mentees.length} Students
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Flagged At-Risk:</span>
                        <span className={`font-bold ${atRiskMentees.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {atRiskMentees.length} Students
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Inspect Mentees, Edit, Delete) */}
                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedFacultyMentees(f)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      View Mentees ({mentees.length})
                    </button>

                    <div className="flex items-center space-x-1">
                      {onOpenEditFaculty && (
                        <button
                          onClick={() => onOpenEditFaculty(f)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition"
                          title="Edit Faculty Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {deletingFacultyId === f.id ? (
                        <div className="flex items-center space-x-1 bg-rose-50 dark:bg-rose-950/60 p-1 rounded-lg border border-rose-200 dark:border-rose-800">
                          <button
                            onClick={() => {
                              onDeleteFaculty(f.id);
                              setDeletingFacultyId(null);
                            }}
                            className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeletingFacultyId(null)}
                            className="px-1.5 py-0.5 text-slate-400 hover:text-slate-600 text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingFacultyId(f.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                          title="Remove Faculty Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal to view specific faculty's mentees */}
          {selectedFacultyMentees && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0a0b14] border border-[#1f2238] rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#1f2238] pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Mentees Assigned to {selectedFacultyMentees.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {selectedFacultyMentees.employeeId} • {selectedFacultyMentees.branch} - {selectedFacultyMentees.designation}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFacultyMentees(null)}
                    className="p-1 rounded-lg hover:bg-[#16192b] text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                  {students
                    .filter(
                      (s) =>
                        s.facultyMentorId === selectedFacultyMentees.id ||
                        (!s.facultyMentorId && s.branch === selectedFacultyMentees.branch)
                    )
                    .map((st) => {
                      const badge = getRiskBadgeColor(st.assessment.riskLevel);
                      return (
                        <div
                          key={st.id}
                          className="p-3 bg-[#0f111e] border border-[#1f2238] rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-cyan-400">{st.rollNo}</span>
                              <strong className="text-white">{st.name}</strong>
                              <span className="text-slate-400">({st.branch} Sem {st.semester})</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-3">
                              <span>Attendance: <strong>{st.attendance}%</strong></span>
                              <span>Internals: <strong>{st.internalAverage}%</strong></span>
                              <span>CGPA: <strong>{st.previousCgpa}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${badge.bg} ${badge.text}`}>
                              {st.assessment.riskLevel}
                            </span>
                            {onSelectStudent && (
                              <button
                                onClick={() => {
                                  setSelectedFacultyMentees(null);
                                  onSelectStudent(st);
                                }}
                                className="p-1 text-slate-400 hover:text-cyan-400"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BRANCH ANALYTICS (CROSS-DEPARTMENTAL MATRICES) */}
      {/* ========================================================================= */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Distribution Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                College-Wide Risk Distribution
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Proportion of students in each early warning bracket
              </p>

              {riskPieData.length > 0 ? (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {riskPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-60 flex items-center justify-center text-xs text-slate-400">
                  No student data loaded yet
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                {riskPieData.map((d) => (
                  <div key={d.name} className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {d.name}: <strong>{d.value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Risk Comparison Bar Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                At-Risk Students by Branch (AI, CSE, DS, AIML, ECE, EEE, CIVIL, MEC)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Comparing Critical & High risk cases across engineering departments
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="branch" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="critical" name="Critical 🔴" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="high" name="High 🟠" fill="#f97316" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="medium" name="Medium 🟡" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="low" name="Low 🟢" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Department Breakdown Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Branch-Level Risk & Attendance Summary
              </h3>
              <span className="text-xs text-slate-400">All 8 KVSRIT Engineering Disciplines</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-5">Branch Code</th>
                    <th className="py-3 px-4">Department Name</th>
                    <th className="py-3 px-4">Enrolled</th>
                    <th className="py-3 px-4">Avg Attendance</th>
                    <th className="py-3 px-4">Avg Internal</th>
                    <th className="py-3 px-4">🔴 Critical</th>
                    <th className="py-3 px-4">🟠 High</th>
                    <th className="py-3 px-4">At-Risk Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {branchAnalytics.map((b) => (
                    <tr key={b.branch} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-5 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {b.branch}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {BRANCH_CODES[b.branch as Branch]?.fullTitle}
                      </td>
                      <td className="py-3 px-4 font-bold">{b.total}</td>
                      <td className="py-3 px-4">
                        <span className={b.avgAttendance < 75 ? 'text-rose-600 font-bold' : ''}>
                          {b.avgAttendance}%
                        </span>
                      </td>
                      <td className="py-3 px-4">{b.avgInternal}%</td>
                      <td className="py-3 px-4 text-rose-600 font-bold">{b.critical}</td>
                      <td className="py-3 px-4 text-orange-600 font-bold">{b.high}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            b.atRiskPercent > 35
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}
                        >
                          {b.atRiskPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INTERVENTIONS AUDIT */}
      {/* ========================================================================= */}
      {activeTab === 'INTERVENTIONS' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Institutional Intervention Success Audit
                </h3>
                <p className="text-xs text-slate-400">
                  Measuring whether faculty counseling, remedial classes, and assignment recovery actually improved student outcomes.
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-emerald-600">
                  {stats.interventionsSuccessRate}%
                </div>
                <div className="text-[11px] text-slate-400">Recovery Success Rate</div>
              </div>
            </div>

            <div className="space-y-3">
              {interventions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No interventions logged yet. Faculty can log counseling actions directly from their dashboard.
                </div>
              ) : (
                interventions.map((intv) => (
                  <div
                    key={intv.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{intv.studentRollNo}</span>
                        <strong className="text-slate-900 dark:text-white">{intv.studentName}</strong>
                        <span className="text-slate-400">• Mentor: {intv.facultyName}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">
                        {intv.description}
                      </p>
                      {intv.outcomeNotes && (
                        <p className="text-emerald-700 dark:text-emerald-300 font-medium mt-1">
                          Outcome: {intv.outcomeNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold ${
                          intv.status === 'OUTCOME_MEASURED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {intv.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ML MODEL TUNING */}
      {/* ========================================================================= */}
      {activeTab === 'MODEL_CONFIG' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Random Forest & Scoring Feature Weights Configuration
                </h3>
                <p className="text-xs text-slate-400">
                  Calibrate the importance weights of each academic indicator in the early-warning prediction pipeline.
                </p>
              </div>

              <button
                onClick={handleSaveWeights}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                <Save className="w-4 h-4 mr-1.5" />
                Save & Recalibrate Model
              </button>
            </div>

            {weightsSavedMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold">
                ✓ Model weights updated successfully! Student risk distributions recalibrated.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Attendance Weight:</span>
                  <span className="text-indigo-600">{Math.round(modelWeights.attendanceWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={Math.round(modelWeights.attendanceWeight * 100)}
                  onChange={(e) =>
                    setModelWeights({ ...modelWeights, attendanceWeight: parseInt(e.target.value, 10) / 100 })
                  }
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Internal Exams Weight:</span>
                  <span className="text-indigo-600">{Math.round(modelWeights.internalsWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={Math.round(modelWeights.internalsWeight * 100)}
                  onChange={(e) =>
                    setModelWeights({ ...modelWeights, internalsWeight: parseInt(e.target.value, 10) / 100 })
                  }
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Previous Semester CGPA Weight:</span>
                  <span className="text-indigo-600">{Math.round(modelWeights.previousCgpaWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={Math.round(modelWeights.previousCgpaWeight * 100)}
                  onChange={(e) =>
                    setModelWeights({ ...modelWeights, previousCgpaWeight: parseInt(e.target.value, 10) / 100 })
                  }
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Assignment Submissions Weight:</span>
                  <span className="text-indigo-600">{Math.round(modelWeights.assignmentWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={Math.round(modelWeights.assignmentWeight * 100)}
                  onChange={(e) =>
                    setModelWeights({ ...modelWeights, assignmentWeight: parseInt(e.target.value, 10) / 100 })
                  }
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Backlogs Penalty Weight:</span>
                  <span className="text-indigo-600">{Math.round(modelWeights.backlogsWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={Math.round(modelWeights.backlogsWeight * 100)}
                  onChange={(e) =>
                    setModelWeights({ ...modelWeights, backlogsWeight: parseInt(e.target.value, 10) / 100 })
                  }
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Lab & Practical Weight:</span>
                  <span className="text-indigo-600">{Math.round(modelWeights.labWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={Math.round(modelWeights.labWeight * 100)}
                  onChange={(e) =>
                    setModelWeights({ ...modelWeights, labWeight: parseInt(e.target.value, 10) / 100 })
                  }
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone: Wipe / Reset Data */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div>
          <button
            onClick={onLoadDemoData}
            className="inline-flex items-center px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset to KVSRIT Demo Dataset
          </button>
        </div>
        <div>
          <button
            onClick={onClearAllData}
            className="inline-flex items-center px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear All Stored Data
          </button>
        </div>
      </div>
    </div>
  );
};
