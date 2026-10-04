import React, { useState } from 'react';
import { RefreshCw, Sliders, Sparkles, TrendingDown, X } from 'lucide-react';
import { Student } from '../types';
import { getRiskBadgeColor, simulateWhatIf } from '../services/mlEngine';

interface WhatIfModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
}

export const WhatIfModal: React.FC<WhatIfModalProps> = ({ isOpen, student, onClose }) => {
  if (!isOpen || !student) return null;

  const [attendance, setAttendance] = useState<number>(student.attendance);
  const [internalAvg, setInternalAvg] = useState<number>(student.internalAverage);
  const [assignmentScore, setAssignmentScore] = useState<number>(student.assignmentScore);
  const [backlogs, setBacklogs] = useState<number>(student.backlogs);

  const currentRisk = student.assessment.riskProbability;
  const currentBadge = getRiskBadgeColor(student.assessment.riskLevel);

  const simulation = simulateWhatIf(student, {
    attendance,
    internalAverage: internalAvg,
    assignmentScore,
    backlogs,
  });

  const simBadge = getRiskBadgeColor(simulation.predictedRiskLevel);

  const handleReset = () => {
    setAttendance(student.attendance);
    setInternalAvg(student.internalAverage);
    setAssignmentScore(student.assignmentScore);
    setBacklogs(student.backlogs);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05060b]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0a0b14] border border-[#1f2238] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1a1d30] flex items-center justify-between bg-[#0f111e]/90">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                What-If AI Risk Simulator
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

        <div className="p-6 space-y-6 bg-[#05060b]/60">
          {/* Comparison Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Current */}
            <div className="p-4 bg-[#0f111a] rounded-2xl border border-[#1f2238] text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Current Risk</span>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {currentRisk}%
              </div>
              <div className="text-xs font-bold text-rose-300 mt-1">
                {currentBadge.icon} {student.assessment.riskLevel}
              </div>
            </div>

            {/* Simulated */}
            <div className="p-4 bg-[#121528] rounded-2xl border-2 border-indigo-500 text-center relative shadow-lg">
              <span className="text-[10px] font-bold uppercase text-indigo-400">Simulated Risk</span>
              <div className="text-2xl font-black text-indigo-400 mt-1">
                {simulation.predictedRisk}%
              </div>
              <div className="text-xs font-bold text-indigo-300 mt-1">
                {simBadge.icon} {simulation.predictedRiskLevel}
              </div>
            </div>

            {/* Delta */}
            <div className="p-4 bg-[#0f111a] rounded-2xl border border-[#1f2238] text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">Risk Delta</span>
              <div
                className={`text-2xl font-black mt-1 ${
                  simulation.riskDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {simulation.riskDelta <= 0 ? `-${simulation.improvementPercent}%` : `+${simulation.improvementPercent}%`}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">
                {simulation.riskDelta <= 0 ? 'Risk Reduced' : 'Risk Elevated'}
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 font-medium">
            <strong>Outcome Verdict:</strong> {simulation.verdictText}
          </div>

          {/* Sliders */}
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">
                  Target Attendance: <strong className="text-indigo-400">{attendance}%</strong>
                </span>
                <span className="text-slate-500">Current: {student.attendance}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={attendance}
                onChange={(e) => setAttendance(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-[#1a1d30] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">
                  Internal Marks Average: <strong className="text-indigo-400">{internalAvg}%</strong>
                </span>
                <span className="text-slate-500">Current: {Math.round(student.internalAverage)}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={internalAvg}
                onChange={(e) => setInternalAvg(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-[#1a1d30] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">
                  Assignment Submissions: <strong className="text-indigo-400">{assignmentScore}%</strong>
                </span>
                <span className="text-slate-500">Current: {student.assignmentScore}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={assignmentScore}
                onChange={(e) => setAssignmentScore(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-[#1a1d30] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">
                  Backlog Clearance Target: <strong className="text-indigo-400">{backlogs} active</strong>
                </span>
                <span className="text-slate-500">Current: {student.backlogs}</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                value={backlogs}
                onChange={(e) => setBacklogs(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-[#1a1d30] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1a1d30] bg-[#0a0b14] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Reset to Actuals
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-500/20 transition"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
