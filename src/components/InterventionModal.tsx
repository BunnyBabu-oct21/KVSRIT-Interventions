import React, { useState } from 'react';
import { Check, CheckCircle2, FileText, Plus, Sparkles, Trash2, UserCheck, X } from 'lucide-react';
import { Faculty, Intervention, Student } from '../types';

interface InterventionModalProps {
  isOpen: boolean;
  student: Student | null;
  facultyList: Faculty[];
  onClose: () => void;
  onSaveIntervention: (intervention: Intervention) => void;
}

export const InterventionModal: React.FC<InterventionModalProps> = ({
  isOpen,
  student,
  facultyList = [],
  onClose,
  onSaveIntervention,
}) => {
  if (!isOpen || !student) return null;

  const [type, setType] = useState<Intervention['type']>('FACULTY_MEETING');
  const [status, setStatus] = useState<Intervention['status']>('IN_PROGRESS');
  const [facultyId, setFacultyId] = useState<string>(facultyList?.[0]?.id || 'fac_1');
  const [description, setDescription] = useState<string>(
    `Mentoring session to review ${student.name?.split(' ')?.[0] || 'student'}'s academic standing (${student.assessment?.riskProbability || 0}% risk), low attendance (${student.attendance}%), and falling test trajectory.`
  );
  const [targetAttendance, setTargetAttendance] = useState<number>(78);
  const [targetInternalScore, setTargetInternalScore] = useState<number>(65);
  const [notes, setNotes] = useState<string>('Student committed to daily attendance and completing makeup tutorial sheets.');
  const [actionItems, setActionItems] = useState<string[]>([
    'Mandate 90% attendance in core lectures for next 3 weeks',
    'Submit overdue assignments by upcoming Monday',
    'Bi-weekly progress check with class mentor',
  ]);
  const [newActionItem, setNewActionItem] = useState<string>('');
  const [outcomeStatus, setOutcomeStatus] = useState<'IMPROVED' | 'STABILIZED' | 'NO_CHANGE' | 'REGRESSED'>('IMPROVED');
  const [outcomeNotes, setOutcomeNotes] = useState<string>('');

  const handleAddActionItem = () => {
    if (newActionItem.trim()) {
      setActionItems([...actionItems, newActionItem.trim()]);
      setNewActionItem('');
    }
  };

  const handleRemoveActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedFaculty = (facultyList || []).find((f) => f.id === facultyId) || facultyList[0];

    const newIntervention: Intervention = {
      id: `int_${Date.now()}`,
      studentId: student.id,
      studentRollNo: student.rollNo,
      studentName: student.name,
      facultyId: assignedFaculty?.id || 'fac_1',
      facultyName: assignedFaculty?.name || 'Assigned Faculty',
      createdAt: new Date().toISOString(),
      type,
      status,
      description,
      actionItems,
      notes,
      targetAttendance,
      targetInternalScore,
      initialRiskProbability: student.assessment.riskProbability,
      currentRiskProbability: status === 'OUTCOME_MEASURED' ? Math.max(15, student.assessment.riskProbability - 20) : student.assessment.riskProbability,
      outcomeNotes: outcomeNotes.trim() || undefined,
      outcomeStatus: status === 'OUTCOME_MEASURED' ? outcomeStatus : undefined,
    };

    onSaveIntervention(newIntervention);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05060b]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0a0b14] border border-[#1f2238] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1a1d30] flex items-center justify-between bg-[#0f111e]/90">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Record Early-Warning Intervention
              </h2>
              <p className="text-xs text-slate-400">
                Student: <strong className="text-slate-200">{student.name}</strong> ({student.rollNo} • {student.branch})
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#05060b]/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Intervention Strategy Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Intervention['type'])}
                className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="FACULTY_MEETING">👨‍🏫 Faculty Meeting & Counseling</option>
                <option value="EXTRA_CLASSES">📚 Extra Remedial Classes</option>
                <option value="ASSIGNMENT_RECOVERY">📝 Assignment Recovery Grace Window</option>
                <option value="PARENT_COMMUNICATION">📞 Parent / Guardian Communication</option>
                <option value="WEEKLY_MONITORING">⏱️ Weekly Progress Tracking</option>
                <option value="PEER_TUTORING">🤝 Peer Tutoring Assignment</option>
                <option value="COUNSELING">🧠 Motivation & Stress Counseling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lifecycle Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Intervention['status'])}
                className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="PLANNED">Planned (Scheduled)</option>
                <option value="IN_PROGRESS">In Progress (Active Recovery)</option>
                <option value="COMPLETED">Completed</option>
                <option value="OUTCOME_MEASURED">Outcome Measured (Resolved)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Faculty Mentor / Counselor *
            </label>
            <select
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.designation} - {f.branch})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Intervention Objective & Description *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Target Benchmarks */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#0f111a] rounded-xl border border-[#1f2238]">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Target Attendance (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={targetAttendance}
                onChange={(e) => setTargetAttendance(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-1.5 text-xs bg-[#16192b] border border-[#1f2238] text-white rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Target Internal Marks (%)
              </label>
              <input
                type="number"
                min="40"
                max="100"
                value={targetInternalScore}
                onChange={(e) => setTargetInternalScore(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-1.5 text-xs bg-[#16192b] border border-[#1f2238] text-white rounded-lg font-bold"
              />
            </div>
          </div>

          {/* Action Items Checklist */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Prescribed Action Checklist ({actionItems.length})
            </label>
            <div className="space-y-1.5">
              {actionItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-[#0f111a] rounded-lg border border-[#1f2238] text-xs text-slate-200"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveActionItem(index)}
                    className="text-slate-400 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                placeholder="Add custom action step..."
                value={newActionItem}
                onChange={(e) => setNewActionItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddActionItem();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-[#0f111a] border border-[#1f2238] text-slate-200 rounded-xl placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddActionItem}
                className="px-3 py-1.5 bg-[#16192b] hover:bg-[#1f233d] text-slate-200 border border-[#232742] text-xs font-semibold rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* If outcome measured, allow notes */}
          {status === 'OUTCOME_MEASURED' && (
            <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/50 space-y-2">
              <label className="block text-xs font-bold text-emerald-300">
                Measurable Outcome Evaluation
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={outcomeStatus}
                  onChange={(e) => setOutcomeStatus(e.target.value as any)}
                  className="px-2.5 py-1 text-xs bg-[#0f111a] border border-emerald-700/60 rounded-lg font-semibold text-emerald-300"
                >
                  <option value="IMPROVED">✓ Improved (Risk Reduced)</option>
                  <option value="STABILIZED">✓ Stabilized</option>
                  <option value="NO_CHANGE">No Measurable Change</option>
                  <option value="REGRESSED">Regressed</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="e.g. Attendance improved from 61% to 75% in 2 weeks. Internal 2 score rose to 68%."
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#0f111a] border border-emerald-700/60 text-slate-200 rounded-lg"
              />
            </div>
          )}

          <div className="pt-3 border-t border-[#1a1d30] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#16192b] hover:bg-[#1f233d] text-slate-300 border border-[#232742] font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 transition active:scale-95"
            >
              Save Intervention
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
