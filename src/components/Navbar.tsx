import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Database,
  GraduationCap,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Users
} from 'lucide-react';
import { Branch, CollegeStats, Faculty, Student, UserRole } from '../types';
import { BRANCH_CODES } from '../services/storage';

interface NavbarProps {
  currentRole?: UserRole;
  currentUserRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onSelectRole?: (role: UserRole) => void;
  stats?: CollegeStats;
  students?: Student[];
  faculty?: Faculty[];
  activeStudentId?: string | null;
  onSelectStudent?: (studentId: string) => void;
  onLoadDemoData?: () => void;
  onClearData?: () => void;
  onOpenAddStudent?: () => void;
  onOpenAddFaculty?: () => void;
  onOpenCSVImport?: () => void;
  selectedBranch?: Branch | 'ALL';
  onSelectBranch?: (branch: Branch | 'ALL') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  criticalCount?: number;
  isAdminAuthenticated?: boolean;
  onLockAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentUserRole,
  onRoleChange,
  onSelectRole,
  stats,
  students = [],
  faculty = [],
  activeStudentId = null,
  onSelectStudent,
  onLoadDemoData,
  onClearData,
  onOpenAddStudent,
  onOpenAddFaculty,
  onOpenCSVImport,
  criticalCount,
  isAdminAuthenticated = false,
  onLockAdmin,
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const role = currentRole || currentUserRole || 'FACULTY';
  const handleRoleSelect = onRoleChange || onSelectRole || (() => {});

  const safeStudents = Array.isArray(students) ? students : [];

  const filteredStudents = localSearchQuery.trim() && safeStudents.length > 0
    ? safeStudents.filter(
        (s) =>
          s.name?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
          s.rollNo?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
          s.branch?.toLowerCase().includes(localSearchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const activeStudent = safeStudents.find((s) => s.id === activeStudentId) || safeStudents[0] || null;

  const lowCount = stats?.lowRiskCount ?? safeStudents.filter(s => s.assessment?.riskLevel === 'LOW').length;
  const medCount = stats?.mediumRiskCount ?? safeStudents.filter(s => s.assessment?.riskLevel === 'MEDIUM').length;
  const highCount = stats?.highRiskCount ?? safeStudents.filter(s => s.assessment?.riskLevel === 'HIGH').length;
  const critCount = criticalCount ?? stats?.criticalRiskCount ?? safeStudents.filter(s => s.assessment?.riskLevel === 'CRITICAL').length;

  return (
    <header className="sticky top-0 z-40 bg-[#0a0b14]/95 backdrop-blur-md border-b border-[#1f2238] text-white shadow-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  KVSRIT Interventions
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-3 h-3 mr-1 text-cyan-400" /> Explainable AI
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden md:block">
                AI-Powered Student Early-Warning & Academic Risk Intervention Platform
              </p>
            </div>
          </div>

          {/* Quick Search for Students */}
          <div className="relative flex-1 max-w-xs mx-4 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Roll No or Name..."
                value={localSearchQuery}
                onChange={(e) => {
                  setLocalSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full pl-9 pr-4 py-1.5 bg-[#0f111a] border border-[#1f2238] rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && filteredStudents.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0a0b14] border border-[#1f2238] rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-1.5 divide-y divide-[#1a1d30]">
                  {filteredStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (onSelectStudent) onSelectStudent(s.id);
                        setIsSearchOpen(false);
                        setLocalSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#16192b] flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <div className="font-semibold text-slate-100">{s.name}</div>
                        <div className="text-slate-400 font-mono">
                          {s.rollNo} • {s.branch} Sem-{s.semester}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.assessment?.riskLevel === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : s.assessment?.riskLevel === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : s.assessment?.riskLevel === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {s.assessment?.riskProbability ?? 0}% Risk
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            {safeStudents.length === 0 ? (
              onLoadDemoData && (
                <button
                  onClick={onLoadDemoData}
                  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-500/20 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-200 animate-pulse" />
                  Load Demo College Dataset
                </button>
              )
            ) : (
              <div className="flex items-center space-x-2">
                {onOpenAddStudent && (
                  <button
                    onClick={onOpenAddStudent}
                    className="hidden sm:inline-flex items-center px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-medium transition"
                    title="Add New Student Record"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Student
                  </button>
                )}
                {onOpenAddFaculty && (
                  <button
                    onClick={onOpenAddFaculty}
                    className="hidden sm:inline-flex items-center px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium transition"
                    title="Add Faculty Mentor"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Faculty
                  </button>
                )}
                {onLoadDemoData && (
                  <button
                    onClick={onLoadDemoData}
                    className="inline-flex items-center px-2 py-1.5 text-slate-400 hover:text-cyan-300 hover:bg-[#16192b] border border-[#1f2238] rounded-xl text-xs transition"
                    title="Reset with 48+ student college cohort across all 8 branches"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Role Tabs */}
      <div className="bg-[#05060b]/90 border-t border-[#1a1d30] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => handleRoleSelect('FACULTY')}
              className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                role === 'FACULTY'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#16192b]'
              }`}
            >
              <Users className="w-4 h-4 mr-2 text-cyan-400" />
              Faculty Dashboard
              {critCount > 0 && (
                <span className="ml-2 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                  {critCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleRoleSelect('STUDENT')}
              className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                role === 'STUDENT'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#16192b]'
              }`}
            >
              <User className="w-4 h-4 mr-2 text-emerald-400" />
              Student Portal
              {activeStudent && (
                <span className="ml-2 text-xs opacity-80 hidden md:inline">
                  ({activeStudent.name?.split(' ')?.[0]})
                </span>
              )}
            </button>

            <button
              onClick={() => handleRoleSelect('ADMIN')}
              className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                role === 'ADMIN'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#16192b]'
              }`}
            >
              <Shield className="w-4 h-4 mr-2 text-purple-400" />
              Admin Portal
              {isAdminAuthenticated ? (
                <span className="ml-2 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                  Unlocked
                </span>
              ) : (
                <span className="ml-2 px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold rounded-full">
                  Locked
                </span>
              )}
            </button>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="hidden md:flex items-center space-x-4 text-xs font-medium text-slate-300">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span>
              Low: <strong className="ml-1 text-emerald-400">{lowCount}</strong>
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5"></span>
              Med: <strong className="ml-1 text-amber-400">{medCount}</strong>
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-orange-400 mr-1.5"></span>
              High: <strong className="ml-1 text-orange-400">{highCount}</strong>
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-ping"></span>
              Crit: <strong className="ml-1 text-rose-400">{critCount}</strong>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
