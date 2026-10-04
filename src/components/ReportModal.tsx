import React from 'react';
import { Download, GraduationCap, Printer, Sparkles, X } from 'lucide-react';
import { Student } from '../types';
import { BRANCH_CODES } from '../services/storage';

interface ReportModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, student, onClose }) => {
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05060b]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white text-slate-900 border border-[#1f2238] rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Controls Topbar (Excluded in Print) */}
        <div className="px-6 py-3.5 border-b border-[#1a1d30] bg-[#0a0b14] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Official KVSRIT Early Warning & Intervention Dossier</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#16192b] text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div id="printable-report" className="p-8 overflow-y-auto space-y-6 bg-white text-slate-900">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                Dr. K.V. Subba Reddy Institute of Technology (KVSRIT)
              </h1>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Department of {BRANCH_CODES[student.branch]?.fullTitle} ({student.branch})
              </p>
              <p className="text-[11px] text-slate-500">
                Autonomous Institution • Affiliated to JNTUA • AICTE Approved
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black rounded uppercase">
                AI Early-Warning Assessment
              </span>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Student Profile Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Student Name</span>
              <strong className="text-slate-900 text-sm">{student.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Roll Number</span>
              <strong className="text-slate-900 text-sm font-mono">{student.rollNo}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Branch & Semester</span>
              <strong className="text-slate-900">{student.branch} • Sem {student.semester}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Faculty Mentor</span>
              <strong className="text-slate-900">{student.facultyMentorName || 'Assigned Mentor'}</strong>
            </div>
          </div>

          {/* AI Risk Score Banner */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Predicted Semester Risk Status
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                {student.assessment.riskLevel} RISK CLASSIFICATION ({student.assessment.riskProbability}%)
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-300">Academic Health Score</span>
              <div className="text-2xl font-black text-emerald-400">
                {student.assessment.academicHealthScore} / 100
              </div>
            </div>
          </div>

          {/* Parameter Matrix Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Continuous Indicator Evaluation Matrix
            </h3>
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2 border border-slate-200">Indicator</th>
                  <th className="p-2 border border-slate-200">Observed Value</th>
                  <th className="p-2 border border-slate-200">Institutional Benchmark</th>
                  <th className="p-2 border border-slate-200">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-slate-200 font-semibold">Attendance Rate</td>
                  <td className="p-2 border border-slate-200">{student.attendance}%</td>
                  <td className="p-2 border border-slate-200">75% (Mandatory)</td>
                  <td className="p-2 border border-slate-200">
                    <span className={student.attendance < 75 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                      {student.attendance < 75 ? '⚠️ Below Threshold' : '✓ Normal'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-200 font-semibold">Internal Assessments</td>
                  <td className="p-2 border border-slate-200">
                    I1: {student.internal1}% {student.internal2 !== undefined ? `| I2: ${student.internal2}%` : ''} (Avg: {Math.round(student.internalAverage)}%)
                  </td>
                  <td className="p-2 border border-slate-200">50% Minimum</td>
                  <td className="p-2 border border-slate-200">
                    <span className={student.internalAverage < 50 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                      {student.internalAverage < 50 ? '⚠️ Remedial Required' : '✓ Satisfactory'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-200 font-semibold">Assignment Turnaround</td>
                  <td className="p-2 border border-slate-200">{student.assignmentsSubmitted} of {student.assignmentsTotal} ({student.assignmentScore}%)</td>
                  <td className="p-2 border border-slate-200">80% Submissions</td>
                  <td className="p-2 border border-slate-200">
                    <span className={student.assignmentScore < 70 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                      {student.assignmentScore < 70 ? '⚠️ Pending Tasks' : '✓ Completed'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-200 font-semibold">Prior Academic Performance</td>
                  <td className="p-2 border border-slate-200">{student.previousCgpa.toFixed(2)} CGPA</td>
                  <td className="p-2 border border-slate-200">6.50 CGPA</td>
                  <td className="p-2 border border-slate-200 font-medium">Standard</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-200 font-semibold">Accumulated Backlogs</td>
                  <td className="p-2 border border-slate-200">{student.backlogs} Active Backlog(s)</td>
                  <td className="p-2 border border-slate-200">0 Backlogs</td>
                  <td className="p-2 border border-slate-200">
                    <span className={student.backlogs > 0 ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                      {student.backlogs > 0 ? '⚠️ Backlog Clearance Required' : '✓ Clean Record'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Contributing Factors & Diagnostics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold uppercase text-[11px] text-slate-700 mb-2">
                Identified Risk Drivers
              </h4>
              <ul className="space-y-1.5">
                {student.assessment.reasons.map((r, i) => (
                  <li key={i} className="flex items-start text-slate-800">
                    <span className="text-rose-600 font-bold mr-1.5">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold uppercase text-[11px] text-slate-700 mb-2">
                Prescribed Faculty Action Plan
              </h4>
              <ul className="space-y-1.5">
                {student.assessment.recommendedActions.map((a, i) => (
                  <li key={i} className="flex items-start text-slate-800">
                    <span className="text-blue-600 font-bold mr-1.5">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sign-off Section */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs text-slate-600">
            <div className="border-t border-slate-400 pt-2 font-medium">
              Student Signature
            </div>
            <div className="border-t border-slate-400 pt-2 font-medium">
              Faculty Mentor Signature
            </div>
            <div className="border-t border-slate-400 pt-2 font-medium">
              Head of Department (HOD)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
