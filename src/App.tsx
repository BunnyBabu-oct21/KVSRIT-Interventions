import React, { useState, useEffect, useMemo } from 'react';
import {
  Branch,
  Faculty,
  Intervention,
  Student,
  UserRole,
} from './types';
import {
  calculateCollegeStats,
  clearAllCollegeData,
  deleteFacultyEntity,
  deleteStudentEntity,
  getStoredFaculty,
  getStoredInterventions,
  getStoredStudents,
  saveFaculty,
  saveInterventions,
  saveStudents,
  seedSyntheticCollegeData,
  updateFacultyEntity,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { FacultyDashboard } from './components/FacultyDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { StudentDetailModal } from './components/StudentDetailModal';
import { AddStudentModal } from './components/AddStudentModal';
import { AddFacultyModal } from './components/AddFacultyModal';
import { InterventionModal } from './components/InterventionModal';
import { ReportModal } from './components/ReportModal';
import { CSVImportModal } from './components/CSVImportModal';
import { WhatIfModal } from './components/WhatIfModal';

export const App: React.FC = () => {
  // Navigation & Role State
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('ADMIN');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('kvsrit_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [selectedBranch, setSelectedBranch] = useState<Branch | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Primary Domain Data
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active student selection (for modals & student portal)
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  // Edit target entities
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [facultyToEdit, setFacultyToEdit] = useState<Faculty | null>(null);

  // Modal Open States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState<boolean>(false);
  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState<boolean>(false);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isCSVImportModalOpen, setIsCSVImportModalOpen] = useState<boolean>(false);
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    let loadedStudents = getStoredStudents();
    let loadedFaculty = getStoredFaculty();
    let loadedInterventions = getStoredInterventions();

    // If storage is empty, initialize synthetic college dataset
    if (!loadedStudents || loadedStudents.length === 0) {
      const seeded = seedSyntheticCollegeData();
      loadedStudents = seeded.students;
      loadedFaculty = seeded.faculty;
      loadedInterventions = seeded.interventions;
    }

    setStudents(loadedStudents);
    setFaculty(loadedFaculty);
    setInterventions(loadedInterventions);
    if (loadedStudents.length > 0) {
      setActiveStudentId(loadedStudents[0].id);
    }
    setIsLoading(false);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoading && students.length > 0) {
      saveStudents(students);
    }
  }, [students, isLoading]);

  useEffect(() => {
    if (!isLoading && faculty.length > 0) {
      saveFaculty(faculty);
    }
  }, [faculty, isLoading]);

  useEffect(() => {
    if (!isLoading && interventions.length > 0) {
      saveInterventions(interventions);
    }
  }, [interventions, isLoading]);

  // Derived Stats
  const stats = useMemo(() => {
    return calculateCollegeStats(students, interventions);
  }, [students, interventions]);

  // Active Student Object
  const activeStudent = useMemo(() => {
    if (!activeStudentId) return students[0] || null;
    return students.find((s) => s.id === activeStudentId) || students[0] || null;
  }, [students, activeStudentId]);

  // Handlers for student modal opens
  const handleOpenStudentDetail = (student: Student) => {
    setActiveStudentId(student.id);
    setIsDetailModalOpen(true);
  };

  const handleOpenIntervention = (student: Student) => {
    setActiveStudentId(student.id);
    setIsInterventionModalOpen(true);
  };

  const handleOpenReport = (student: Student) => {
    setActiveStudentId(student.id);
    setIsReportModalOpen(true);
  };

  const handleOpenWhatIf = (student: Student) => {
    setActiveStudentId(student.id);
    setIsWhatIfModalOpen(true);
  };

  // Add / Edit student handlers
  const handleOpenAddStudent = () => {
    setStudentToEdit(null);
    setIsAddStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setStudentToEdit(student);
    setIsAddStudentModalOpen(true);
  };

  // Add / Edit faculty handlers
  const handleOpenAddFaculty = () => {
    setFacultyToEdit(null);
    setIsAddFacultyModalOpen(true);
  };

  const handleOpenEditFaculty = (f: Faculty) => {
    setFacultyToEdit(f);
    setIsAddFacultyModalOpen(true);
  };

  // Save student (both Create and Update)
  const handleSaveStudent = (savedStudent: Student) => {
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === savedStudent.id);
      if (exists) {
        return prev.map((s) => (s.id === savedStudent.id ? savedStudent : s));
      }
      return [savedStudent, ...prev];
    });
    setActiveStudentId(savedStudent.id);
    setStudentToEdit(null);
  };

  // Save faculty (both Create and Update)
  const handleSaveFaculty = (savedFaculty: Faculty) => {
    setFaculty((prev) => {
      const exists = prev.some((f) => f.id === savedFaculty.id);
      if (exists) {
        return prev.map((f) => (f.id === savedFaculty.id ? savedFaculty : f));
      }
      return [...prev, savedFaculty];
    });
    // Also update any student mentor names if changed
    setStudents((prev) =>
      prev.map((s) => {
        if (s.facultyMentorId === savedFaculty.id) {
          return { ...s, facultyMentorName: savedFaculty.name };
        }
        return s;
      })
    );
    setFacultyToEdit(null);
  };

  const handleBulkImportStudents = (newStudents: Student[]) => {
    const updated = [...newStudents, ...students];
    setStudents(updated);
    if (newStudents.length > 0) {
      setActiveStudentId(newStudents[0].id);
    }
  };

  const handleSaveIntervention = (intervention: Intervention) => {
    const updatedInterventions = [intervention, ...(interventions || [])];
    setInterventions(updatedInterventions);

    // Update student intervention history reference safely
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === intervention.studentId) {
          const prevInterventions = Array.isArray(s.interventions) ? s.interventions : [];
          return {
            ...s,
            interventions: [intervention, ...prevInterventions],
          };
        }
        return s;
      })
    );
  };

  const handleDeleteStudent = (id: string) => {
    const updated = deleteStudentEntity(id);
    setStudents(updated);
    if (activeStudentId === id) {
      setActiveStudentId(updated[0]?.id || null);
    }
  };

  const handleDeleteFaculty = (id: string) => {
    const updated = deleteFacultyEntity(id);
    setFaculty(updated);
  };

  const handleResetToDemoData = () => {
    const seeded = seedSyntheticCollegeData();
    setStudents(seeded.students);
    setFaculty(seeded.faculty);
    setInterventions(seeded.interventions);
    setActiveStudentId(seeded.students[0]?.id || null);
  };

  const handleClearAllData = () => {
    clearAllCollegeData();
    setStudents([]);
    setFaculty([]);
    setInterventions([]);
    setActiveStudentId(null);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('kvsrit_admin_auth', 'true');
    } catch (e) {
      console.warn('Session storage error', e);
    }
  };

  const handleAdminLock = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('kvsrit_admin_auth');
    } catch (e) {
      console.warn('Session storage error', e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold tracking-wide">Initializing KVSRIT Early-Warning Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Top Navbar with Role Switching, Branches & Actions */}
      <Navbar
        currentUserRole={currentUserRole}
        onSelectRole={(role) => setCurrentUserRole(role)}
        stats={stats}
        students={students}
        faculty={faculty}
        activeStudentId={activeStudentId}
        onSelectStudent={(id) => {
          setActiveStudentId(id);
          const st = (students || []).find((s) => s.id === id);
          if (st) handleOpenStudentDetail(st);
        }}
        onLoadDemoData={handleResetToDemoData}
        onClearAllData={handleClearAllData}
        isAdminAuthenticated={isAdminAuthenticated}
        onLockAdmin={handleAdminLock}
      />

      {/* Main View Port based on Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUserRole === 'FACULTY' && (
          <FacultyDashboard
            students={students}
            faculty={faculty}
            interventions={interventions}
            stats={stats}
            selectedBranch={selectedBranch}
            searchQuery={searchQuery}
            onSelectBranch={(b) => setSelectedBranch(b)}
            onSearchChange={(q) => setSearchQuery(q)}
            onSelectStudent={handleOpenStudentDetail}
            onOpenIntervention={handleOpenIntervention}
            onOpenReport={handleOpenReport}
            onOpenWhatIf={handleOpenWhatIf}
            onOpenAddStudent={handleOpenAddStudent}
          />
        )}

        {currentUserRole === 'STUDENT' && (
          <StudentDashboard
            students={students}
            activeStudent={activeStudent}
            interventions={interventions}
            onSelectActiveStudent={(id) => setActiveStudentId(id)}
            onOpenWhatIf={handleOpenWhatIf}
          />
        )}

        {currentUserRole === 'ADMIN' && (
          !isAdminAuthenticated ? (
            <AdminLogin
              onSuccess={handleAdminLoginSuccess}
              onCancelToFaculty={() => setCurrentUserRole('FACULTY')}
            />
          ) : (
            <AdminDashboard
              students={students}
              faculty={faculty}
              interventions={interventions}
              stats={stats}
              onOpenAddStudent={handleOpenAddStudent}
              onOpenEditStudent={handleOpenEditStudent}
              onOpenAddFaculty={handleOpenAddFaculty}
              onOpenEditFaculty={handleOpenEditFaculty}
              onSelectStudent={handleOpenStudentDetail}
              onOpenCSVImport={() => setIsCSVImportModalOpen(true)}
              onDeleteStudent={handleDeleteStudent}
              onDeleteFaculty={handleDeleteFaculty}
              onLoadDemoData={handleResetToDemoData}
              onClearAllData={handleClearAllData}
              onLockAdmin={handleAdminLock}
            />
          )
        )}
      </main>

      {/* Modals */}
      <StudentDetailModal
        isOpen={isDetailModalOpen}
        student={activeStudent}
        interventions={interventions}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenInterventionModal={handleOpenIntervention}
        onOpenReportModal={handleOpenReport}
      />

      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => {
          setIsAddStudentModalOpen(false);
          setStudentToEdit(null);
        }}
        onSave={handleSaveStudent}
        facultyList={faculty}
        existingStudentsCount={students.length}
        studentToEdit={studentToEdit}
      />

      <AddFacultyModal
        isOpen={isAddFacultyModalOpen}
        onClose={() => {
          setIsAddFacultyModalOpen(false);
          setFacultyToEdit(null);
        }}
        onSave={handleSaveFaculty}
        existingFacultyCount={faculty.length}
        facultyToEdit={facultyToEdit}
      />

      <InterventionModal
        isOpen={isInterventionModalOpen}
        student={activeStudent}
        facultyList={faculty}
        onClose={() => setIsInterventionModalOpen(false)}
        onSaveIntervention={handleSaveIntervention}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        student={activeStudent}
        onClose={() => setIsReportModalOpen(false)}
      />

      <CSVImportModal
        isOpen={isCSVImportModalOpen}
        onClose={() => setIsCSVImportModalOpen(false)}
        onImport={handleBulkImportStudents}
      />

      <WhatIfModal
        isOpen={isWhatIfModalOpen}
        student={activeStudent}
        onClose={() => setIsWhatIfModalOpen(false)}
      />
    </div>
  );
};

export default App;
