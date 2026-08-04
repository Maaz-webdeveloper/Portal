import React, { useState, useEffect } from 'react';
import { User, StudentRecord, CounselorRecord, NotionConfig } from './types';
import { INITIAL_USERS, INITIAL_COUNSELORS, INITIAL_STUDENTS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { CounselorDashboard } from './components/CounselorDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { NotionSetupModal } from './components/NotionSetupModal';
import { NotionSchemaGuide } from './components/NotionSchemaGuide';
import { AddStudentModal } from './components/AddStudentModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { ShieldCheck, UserCheck, GraduationCap, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default Admin
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [counselors, setCounselors] = useState<CounselorRecord[]>(INITIAL_COUNSELORS);
  const [notionConfig, setNotionConfig] = useState<NotionConfig>({
    apiKey: '',
    studentsDatabaseId: '',
    isConnected: false,
    lastSyncTime: null,
    mode: 'mock',
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [isNotionSetupOpen, setIsNotionSetupOpen] = useState(false);
  const [isSchemaGuideOpen, setIsSchemaGuideOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentRecord | null>(null);

  // Fetch Notion Config Status on Mount
  useEffect(() => {
    fetch('/api/notion/config')
      .then((res) => res.json())
      .then((data) => {
        setNotionConfig((prev) => ({
          ...prev,
          isConnected: data.isConnected,
          lastSyncTime: data.lastSyncTime,
          mode: data.mode || 'mock',
          studentsDatabaseId: data.databaseId || '',
        }));
      })
      .catch((err) => console.log('Notion config check:', err));
  }, []);

  // ROLE-SCOPED API FETCH
  // Whenever active user role changes, query backend /api/students to enforce privacy filtering
  const fetchScopedStudents = async (user: User) => {
    try {
      let url = `/api/students?role=${user.role}`;
      if (user.role === 'counselor' && user.counselorId) {
        url += `&counselorId=${user.counselorId}`;
      } else if (user.role === 'student') {
        if (user.studentRollNo) url += `&studentRollNo=${user.studentRollNo}`;
        if (user.email) url += `&email=${encodeURIComponent(user.email)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Failed fetching scoped student records:', err);
      // Fallback local filter
      if (user.role === 'admin') {
        setStudents(INITIAL_STUDENTS);
      } else if (user.role === 'counselor') {
        setStudents(INITIAL_STUDENTS.filter((s) => s.counselorId === user.counselorId));
      } else if (user.role === 'student') {
        setStudents(INITIAL_STUDENTS.filter((s) => s.rollNo === user.studentRollNo));
      }
    }
  };

  useEffect(() => {
    fetchScopedStudents(currentUser);
  }, [currentUser]);

  // Handlers
  const handleSwitchUser = (newUser: User) => {
    setCurrentUser(newUser);
    fetchScopedStudents(newUser);
  };

  const handleSyncNotion = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/notion/sync', { method: 'POST' });
      const data = await res.json();
      if (data.lastSyncTime) {
        setNotionConfig((prev) => ({ ...prev, lastSyncTime: data.lastSyncTime }));
      }
      await fetchScopedStudents(currentUser);
    } catch (err) {
      console.error('Error triggering Notion sync:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveNotionConfig = async (apiKey: string, databaseId: string, mode: 'live' | 'mock') => {
    const res = await fetch('/api/notion/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, studentsDatabaseId: databaseId, mode }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed connecting to Notion.');
    }
    setNotionConfig({
      apiKey,
      studentsDatabaseId: databaseId,
      isConnected: data.isConnected || false,
      lastSyncTime: new Date().toISOString(),
      mode,
    });
    await handleSyncNotion();
  };

  const handleAddStudent = async (newStudent: Omit<StudentRecord, 'id' | 'lastSyncedAt'>) => {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent),
    });
    const data = await res.json();
    if (data.student) {
      await fetchScopedStudents(currentUser);
    }
  };

  const handleUpdateStudentFee = async (
    studentId: string,
    status: 'Paid' | 'Pending' | 'Overdue',
    paidAmount: number
  ) => {
    const res = await fetch(`/api/students/${studentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feeStatus: status, feePaid: paidAmount }),
    });
    const data = await res.json();
    if (data.student) {
      await fetchScopedStudents(currentUser);
      if (selectedStudentDetail?.id === studentId) {
        setSelectedStudentDetail(data.student);
      }
    }
  };

  const handleAddCounselorNote = async (studentId: string, noteText: string) => {
    const res = await fetch(`/api/students/${studentId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName: currentUser.name, note: noteText }),
    });
    const data = await res.json();
    if (data.student) {
      await fetchScopedStudents(currentUser);
      if (selectedStudentDetail?.id === studentId) {
        setSelectedStudentDetail(data.student);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        notionConfig={notionConfig}
        onOpenNotionSetup={() => setIsNotionSetupOpen(true)}
        onOpenSchemaGuide={() => setIsSchemaGuideOpen(true)}
        onSyncNotion={handleSyncNotion}
        isSyncing={isSyncing}
      />

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Role Access Security Notice Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="font-semibold text-slate-200">Active Test Persona:</span>
            <span className="font-bold text-indigo-400">{currentUser.name}</span>
            <span className="text-slate-500">({currentUser.email})</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Role-Based Access Level:</span>
            <span className="font-bold uppercase tracking-wider text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Level 1: Admin Dashboard */}
        {currentUser.role === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            students={students}
            counselors={counselors}
            onAddStudent={() => setIsAddStudentOpen(true)}
            onUpdateStudentFee={handleUpdateStudentFee}
            onSelectStudentDetail={(student) => setSelectedStudentDetail(student)}
            onSyncNotion={handleSyncNotion}
            isSyncing={isSyncing}
          />
        )}

        {/* Level 2: Counselor Dashboard */}
        {currentUser.role === 'counselor' && (
          <CounselorDashboard
            currentUser={currentUser}
            students={students}
            counselorInfo={counselors.find((c) => c.id === currentUser.counselorId)}
            onAddNote={handleAddCounselorNote}
            onUpdateFee={handleUpdateStudentFee}
            onSelectStudentDetail={(student) => setSelectedStudentDetail(student)}
          />
        )}

        {/* Level 3: Student Dashboard */}
        {currentUser.role === 'student' && (
          <StudentDashboard
            currentUser={currentUser}
            studentRecord={students[0]}
          />
        )}

      </main>

      {/* Modals & Overlays */}
      <NotionSetupModal
        isOpen={isNotionSetupOpen}
        onClose={() => setIsNotionSetupOpen(false)}
        notionConfig={notionConfig}
        onSaveConfig={handleSaveNotionConfig}
      />

      <NotionSchemaGuide
        isOpen={isSchemaGuideOpen}
        onClose={() => setIsSchemaGuideOpen(false)}
      />

      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        counselors={counselors}
        onAddStudent={handleAddStudent}
      />

      <StudentDetailModal
        student={selectedStudentDetail}
        onClose={() => setSelectedStudentDetail(null)}
        counselors={counselors}
        onAddNote={handleAddCounselorNote}
        onUpdateFeeStatus={handleUpdateStudentFee}
      />

    </div>
  );
}
