import React, { useState, useEffect } from 'react';
import { Edit2, Phone, UserCheck, Users, X } from 'lucide-react';
import { Branch, Faculty } from '../types';
import { BRANCH_CODES } from '../services/storage';

interface AddFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (faculty: Faculty) => void;
  existingFacultyCount?: number;
  facultyToEdit?: Faculty | null;
}

export const AddFacultyModal: React.FC<AddFacultyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingFacultyCount = 0,
  facultyToEdit = null,
}) => {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState<Branch>('CSE');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 94400 12345');
  const [employeeId, setEmployeeId] = useState('');

  const isEditMode = !!facultyToEdit;

  useEffect(() => {
    if (facultyToEdit) {
      setName(facultyToEdit.name || '');
      setBranch(facultyToEdit.branch || 'CSE');
      setDesignation(facultyToEdit.designation || 'Assistant Professor');
      setEmail(facultyToEdit.email || '');
      setPhone(facultyToEdit.phone || '+91 94400 12345');
      setEmployeeId(facultyToEdit.employeeId || '');
    } else {
      setName('');
      setBranch('CSE');
      setDesignation('Assistant Professor');
      setEmail('');
      setPhone('+91 94400 12345');
      setEmployeeId(`KVSRIT-FAC-${(existingFacultyCount + 1).toString().padStart(3, '0')}`);
    }
  }, [facultyToEdit, existingFacultyCount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const facultyRecord: Faculty = {
      id: facultyToEdit?.id || `fac_${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@kvsrit.ac.in`,
      phone: phone.trim(),
      employeeId: employeeId.trim().toUpperCase() || `KVSRIT-FAC-${(existingFacultyCount + 1).toString().padStart(3, '0')}`,
      branch,
      designation,
      assignedStudentIds: facultyToEdit?.assignedStudentIds || [],
    };

    onSave(facultyRecord);
    onClose();
  };

  const branches: Branch[] = ['AI', 'CSE', 'DS', 'AIML', 'ECE', 'EEE', 'CIVIL', 'MEC'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05060b]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0a0b14] border border-[#1f2238] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-[#1a1d30] flex items-center justify-between bg-[#0f111e]/90">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              {isEditMode ? <Edit2 className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditMode ? 'Update Faculty Details' : 'Add Faculty Mentor'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditMode ? 'Modify mentor profile, designation, and department details' : 'Register department faculty for student counseling & early intervention'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-[#05060b]/60">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Faculty Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. K. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Department / Branch *
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as Branch)}
                className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                Employee ID *
              </label>
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#0f111a] border border-[#1f2238] rounded-xl text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Designation
            </label>
            <select
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Professor">Professor</option>
              <option value="Professor & HOD">Professor & HOD</option>
              <option value="Academic Dean">Academic Dean</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="faculty@kvsrit.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+91 94400 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0f111a] border border-[#1f2238] rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#1a1d30] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#16192b] hover:bg-[#1f233d] text-slate-300 border border-[#232742] font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-500/20 transition active:scale-95"
            >
              {isEditMode ? 'Update Faculty Details' : 'Add Faculty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
