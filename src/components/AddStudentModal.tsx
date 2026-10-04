import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, Edit2, Plus, Sparkles, User, X } from 'lucide-react';
import { Branch, Faculty, Student } from '../types';
import { calculateStudentRisk, getRiskBadgeColor } from '../services/mlEngine';
import { BRANCH_CODES, createStudentEntity, generateRollNumber, updateStudentData } from '../services/storage';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  facultyList?: Faculty[];
  existingStudentsCount?: number;
  studentToEdit?: Student | null;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  facultyList = [],
  existingStudentsCount = 0,
  studentToEdit = null,
}) => {
  const [branch, setBranch] = useState<Branch>('CSE');
  const [rollNo, setRollNo] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [semester, setSemester] = useState<number>(5);
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [facultyMentorId, setFacultyMentorId] = useState<string>('');

  // Core indicators
  const [attendance, setAttendance] = useState<number>(65);
  const [internal1, setInternal1] = useState<number>(48);
  const [internal2, setInternal2] = useState<number>(42);
  const [hasInternal2, setHasInternal2] = useState<boolean>(true);
  const [assignmentScore, setAssignmentScore] = useState<number>(60);
  const [assignmentsSubmitted, setAssignmentsSubmitted] = useState<number>(5);
  const [assignmentsTotal, setAssignmentsTotal] = useState<number>(8);
  const [previousCgpa, setPreviousCgpa] = useState<number>(6.2);
  const [backlogs, setBacklogs] = useState<number>(2);
  const [labScore, setLabScore] = useState<number>(60);

  const isEditMode = !!studentToEdit;

  useEffect(() => {
    if (studentToEdit) {
      setBranch(studentToEdit.branch || 'CSE');
      setRollNo(studentToEdit.rollNo || '');
      setName(studentToEdit.name || '');
      setSemester(studentToEdit.semester || 5);
      setEmail(studentToEdit.email || '');
      setPhone(studentToEdit.phone || '');
      setParentPhone(studentToEdit.parentPhone || '');
      setFacultyMentorId(studentToEdit.facultyMentorId || '');
      setAttendance(studentToEdit.attendance ?? 65);
      setInternal1(studentToEdit.internal1 ?? 48);
      setInternal2(studentToEdit.internal2 ?? 42);
      setHasInternal2(studentToEdit.internal2 !== undefined);
      setAssignmentScore(studentToEdit.assignmentScore ?? 60);
      setAssignmentsSubmitted(studentToEdit.assignmentsSubmitted ?? 5);
      setAssignmentsTotal(studentToEdit.assignmentsTotal ?? 8);
      setPreviousCgpa(studentToEdit.previousCgpa ?? 6.2);
      setBacklogs(studentToEdit.backlogs ?? 0);
      setLabScore(studentToEdit.labScore ?? 60);
    } else {
      setBranch('CSE');
      setRollNo(generateRollNumber('CSE', existingStudentsCount + 1));
      setName('');
      setSemester(5);
      setEmail('');
      setPhone('+91 98480 22334');
      setParentPhone('+91 98480 88990');
      setFacultyMentorId(facultyList[0]?.id || '');
      setAttendance(65);
      setInternal1(48);
      setInternal2(42);
      setHasInternal2(true);
      setAssignmentScore(60);
      setAssignmentsSubmitted(5);
      setAssignmentsTotal(8);
      setPreviousCgpa(6.2);
      setBacklogs(2);
      setLabScore(60);
    }
  }, [studentToEdit, existingStudentsCount, isOpen]);

  // Generate suggested roll number when branch changes in Add mode
  useEffect(() => {
    if (!isEditMode && (!rollNo || rollNo.startsWith('24FH1A'))) {
      setRollNo(generateRollNumber(branch, existingStudentsCount + 1));
    }
  }, [branch, existingStudentsCount, isEditMode]);

  if (!isOpen) return null;

  // Live Risk Calculation Preview
  const liveAssessment = calculateStudentRisk({
    attendance,
    internal1,
    internal2: hasInternal2 ? internal2 : undefined,
    assignmentScore,
    assignmentsSubmitted,
    assignmentsTotal,
    previousCgpa,
    backlogs,
    labScore,
  });

  const previewBadge = getRiskBadgeColor(liveAssessment.riskLevel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rollNo.trim()) return;

    const mentor = (facultyList || []).find((f) => f.id === facultyMentorId);

    if (studentToEdit) {
      const updated = updateStudentData(studentToEdit, {
        rollNo: rollNo.trim().toUpperCase(),
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        parentPhone: parentPhone.trim() || undefined,
        branch,
        semester,
        attendance,
        internal1,
        internal2: hasInternal2 ? internal2 : undefined,
        assignmentScore,
        assignmentsSubmitted,
        assignmentsTotal,
        previousCgpa,
        backlogs,
        labScore,
        facultyMentorId: mentor?.id || studentToEdit.facultyMentorId,
        facultyMentorName: mentor?.name || studentToEdit.facultyMentorName,
      });
      onSave(updated);
    } else {
      const newStudent = createStudentEntity({
        rollNo: rollNo.trim().toUpperCase(),
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        parentPhone: parentPhone.trim() || undefined,
        branch,
        semester,
        attendance,
        internal1,
        internal2: hasInternal2 ? internal2 : undefined,
        assignmentScore,
        assignmentsSubmitted,
        assignmentsTotal,
        previousCgpa,
        backlogs,
        labScore,
        facultyMentorId: mentor?.id,
        facultyMentorName: mentor?.name,
      });
      onSave(newStudent);
    }
    onClose();
  };

  const branches: Branch[] = ['AI', 'CSE', 'DS', 'AIML', 'ECE', 'EEE', 'CIVIL', 'MEC'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05060b]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0a0b14] border border-[#1f2238] rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1a1d30] flex items-center justify-between bg-[#0f111e]/90">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              {isEditMode ? <Edit2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isEditMode ? `Update Student: ${studentToEdit?.name}` : 'Add Student Record'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditMode ? 'Modify student academic parameters and automatically recalculate risk scores' : 'Continuous indicators will be evaluated by the ML model in real-time'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#16192b] text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 bg-[#05060b]/60">
          {/* Live Risk Output Banner */}
          <div className="p-4 rounded-2xl bg-[#0f111e] border border-[#1f2238] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl border ${previewBadge.bg} ${previewBadge.text} ${previewBadge.border}`}>
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Real-time ML Model Prediction
                </span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className={`text-sm font-black px-2.5 py-0.5 rounded-md ${previewBadge.bg} ${previewBadge.text}`}>
                    {liveAssessment.riskLevel} RISK ({liveAssessment.riskProbability}%)
                  </span>
                  <span className="text-xs text-slate-400">
                    Health: {liveAssessment.academicHealthScore}%
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400">
              Top Factor: <span className="font-semibold text-slate-200">{liveAssessment.contributingFactors[0]?.displayName || 'Attendance'}</span>
            </div>
          </div>

          {/* Section 1: Basic Student Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2"></span>
              Student Details & Mentorship
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department / Branch *
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value as Branch)}
                  className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b} - {BRANCH_CODES[b]?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#0f111a] border border-[#1f2238] rounded-xl text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current Semester *
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s} (Year {Math.ceil(s / 2)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assigned Faculty Mentor
                </label>
                <select
                  value={facultyMentorId}
                  onChange={(e) => setFacultyMentorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select Department Mentor...</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.branch} - {f.designation})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Student Email
                </label>
                <input
                  type="email"
                  placeholder="student@kvsrit.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Student Phone
                </label>
                <input
                  type="text"
                  placeholder="+91 98480 22334"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Parent Phone
                </label>
                <input
                  type="text"
                  placeholder="+91 98480 88990"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Continuous Academic Indicators */}
          <div className="space-y-3 pt-3 border-t border-[#1a1d30]">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
              Academic Performance Indicators (ML Features)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0f111a] p-4 rounded-2xl border border-[#1f2238]">
              {/* Attendance */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Biometric Attendance</span>
                  <span className={`font-bold ${attendance < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {attendance}% {attendance < 75 ? '(Condonation Risk)' : '(Eligible)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={attendance}
                  onChange={(e) => setAttendance(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Internal 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Internal Mid-1 Score</span>
                  <span className="font-bold text-slate-200">{internal1}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={internal1}
                  onChange={(e) => setInternal1(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Internal 2 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-1.5 font-semibold text-slate-300">
                    <input
                      type="checkbox"
                      checked={hasInternal2}
                      onChange={(e) => setHasInternal2(e.target.checked)}
                      className="rounded accent-blue-500"
                    />
                    <span>Internal Mid-2 Conducted</span>
                  </label>
                  {hasInternal2 && <span className="font-bold text-slate-200">{internal2}%</span>}
                </div>
                {hasInternal2 && (
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={internal2}
                    onChange={(e) => setInternal2(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-500"
                  />
                )}
              </div>

              {/* Assignment Score */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">Assignment Quality Score</span>
                  <span className="font-bold text-slate-200">{assignmentScore}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={assignmentScore}
                  onChange={(e) => setAssignmentScore(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assignments Submitted
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="0"
                    max={assignmentsTotal}
                    value={assignmentsSubmitted}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10) || 0;
                      setAssignmentsSubmitted(v);
                      setAssignmentScore(Math.round((v / assignmentsTotal) * 100));
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#0f111a] border border-[#1f2238] text-slate-200 rounded-xl"
                  />
                  <span className="text-xs text-slate-500">/ {assignmentsTotal}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Prior CGPA (0-10)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={previousCgpa}
                  onChange={(e) => setPreviousCgpa(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#0f111a] border border-[#1f2238] text-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Active Backlogs
                </label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={backlogs}
                  onChange={(e) => setBacklogs(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#0f111a] border border-[#1f2238] text-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lab / Practical Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={labScore}
                  onChange={(e) => setLabScore(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#0f111a] border border-[#1f2238] text-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#1a1d30] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#16192b] hover:bg-[#1f233d] text-slate-300 border border-[#232742] font-semibold rounded-xl text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 transition active:scale-95"
            >
              {isEditMode ? 'Update & Recalculate Risk' : 'Save & Run AI Risk Model'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
