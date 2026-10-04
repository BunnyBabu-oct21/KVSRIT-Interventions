import React, { useState } from 'react';
import { Download, FileSpreadsheet, Sparkles, Upload, X } from 'lucide-react';
import { Student } from '../types';
import { parseCSVToStudents } from '../services/storage';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newStudents: Student[]) => void;
}

const SAMPLE_CSV = `roll_no,name,branch,semester,attendance,internal_1,internal_2,assignment_score,lab_score,previous_cgpa,backlogs
24FH1A0581,Sanjay Reddy,CSE,5,62,44,40,55,58,6.1,2
24FH1A4282,Meghana K.,AIML,5,56,40,36,48,50,5.7,3
24FH1A6783,Varun Teja,DS,5,88,82,85,90,92,8.6,0
24FH1A0484,Rohit Goud,ECE,5,71,58,60,72,74,7.2,1
24FH1A0285,Divya Varma,EEE,5,92,90,92,95,96,9.1,0
24FH1A0186,Kalyan V.,CIVIL,5,59,42,40,50,54,5.9,2
24FH1A0387,Rakesh N.,MEC,5,85,78,80,85,88,8.2,0
24FH1A4388,Aishwarya R.,AI,5,64,48,44,58,62,6.3,1`;

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleProcessImport = () => {
    try {
      setError(null);
      const parsed = parseCSVToStudents(csvText);
      if (parsed.length === 0) {
        setError('No valid student rows could be parsed. Please verify the CSV column headers.');
        return;
      }
      onImport(parsed);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Error processing CSV input.');
    }
  };

  const downloadSampleTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'kvsrit_student_dataset_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05060b]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0a0b14] border border-[#1f2238] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1a1d30] flex items-center justify-between bg-[#0f111e]/90">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Bulk Import Student CSV Dataset
              </h2>
              <p className="text-xs text-slate-400">
                Upload or paste CSV with student academic parameters
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

        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs bg-[#05060b]/60">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">
              CSV Format Specification:
            </span>
            <button
              onClick={downloadSampleTemplate}
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 hover:underline font-bold"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download Sample CSV
            </button>
          </div>

          {/* Upload Box */}
          <div className="border-2 border-dashed border-[#1f2238] rounded-2xl p-4 text-center hover:border-cyan-500/50 bg-[#0f111a]/40 transition">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-1"
            >
              <Upload className="w-6 h-6 text-cyan-400" />
              <span className="font-bold text-slate-200">
                Click to browse .CSV file from computer
              </span>
              <span className="text-[11px] text-slate-500">or edit/paste text directly below</span>
            </label>
          </div>

          {/* Textarea */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">
              Paste or Edit CSV Contents:
            </label>
            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-3 font-mono text-[11px] bg-[#0f111a] border border-[#1f2238] text-cyan-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-xl font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1a1d30] flex items-center justify-end space-x-2 bg-[#0a0b14]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#16192b] hover:bg-[#1f233d] text-slate-300 border border-[#232742] font-semibold rounded-xl text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProcessImport}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 transition active:scale-95"
          >
            Run AI Risk Pipeline on Records
          </button>
        </div>
      </div>
    </div>
  );
};
