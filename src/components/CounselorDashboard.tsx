import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentRecord, FeeRecord } from '../types';
import { INITIAL_STUDENTS, INITIAL_FEES } from '../data/mockData';
import {
  Users,
  Search,
  FileEdit,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  DollarSign,
  GraduationCap,
  MessageSquare,
  Sparkles,
  CreditCard,
  ArrowLeft,
  Shield,
} from 'lucide-react';

interface Props {
  activeTab?: 'overview' | 'students' | 'counselors' | 'fees' | 'settings' | 'notion';
}

export const CounselorDashboard: React.FC<Props> = ({ activeTab = 'overview' }) => {
  const { user, token, switchRoleQuick } = useAuth();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchCohortData();
  }, [user]);

  const fetchCohortData = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const [stuRes, feeRes] = await Promise.allSettled([
        fetch('/api/students', { headers }),
        fetch('/api/fees', { headers }),
      ]);

      let stuList: StudentRecord[] = [];
      let fList: FeeRecord[] = [];

      if (stuRes.status === 'fulfilled' && stuRes.value.ok) {
        const stuData = await stuRes.value.json();
        stuList = stuData.students || [];
      } else {
        const cId = user?.counselorId || 'counselor-1';
        stuList = INITIAL_STUDENTS.filter((s) => s.counselorId === cId);
      }

      if (feeRes.status === 'fulfilled' && feeRes.value.ok) {
        const feeData = await feeRes.value.json();
        fList = feeData.fees || [];
      } else {
        const cId = user?.counselorId || 'counselor-1';
        const assignedIds = INITIAL_STUDENTS.filter((s) => s.counselorId === cId).map((s) => s.id);
        fList = INITIAL_FEES.filter((f) => assignedIds.includes(f.studentId));
      }

      setStudents(stuList);
      setFees(fList);
      if (stuList.length > 0 && !selectedStudent) {
        setSelectedStudent(stuList[0]);
      }
    } catch (e) {
      console.warn('Fallback loading counselor cohort', e);
      const cId = user?.counselorId || 'counselor-1';
      const stuList = INITIAL_STUDENTS.filter((s) => s.counselorId === cId);
      setStudents(stuList);
      if (stuList.length > 0) setSelectedStudent(stuList[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !noteText.trim() || !token) return;

    setSavingNote(true);
    try {
      const res = await fetch(`/api/students/${selectedStudent.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note: noteText }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudents((prev) =>
          prev.map((s) => (s.id === selectedStudent.id ? data.student : s))
        );
        setSelectedStudent(data.student);
        setNoteText('');
      }
    } catch (err) {
      console.error('Error adding note', err);
    } finally {
      setSavingNote(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.feeStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Overdue':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Partial':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Demo Navigation Bar with Back Arrow */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg">
        <button
          onClick={() => switchRoleQuick('admin')}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/30 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>← Back to Admin Portal (Super View)</span>
        </button>

        <div className="flex items-center gap-2 text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline text-slate-400">Current Counselor Cohort:</span>
          <span className="font-mono text-emerald-300 font-semibold">{user?.name}</span>
        </div>
      </div>

      {/* Header Profile Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
            {user?.name?.slice(0, 2).toUpperCase() || 'CS'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">{user?.name}</h1>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                Assigned Counselor
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Role Scope: Showing only students assigned to <code className="text-emerald-300 font-mono">{user?.counselorId || 'your cohort ID'}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl text-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Active Cohort</span>
            <span className="font-mono text-white font-bold">{students.length} Assigned Students</span>
          </div>
        </div>
      </div>

      {/* Cohort Fees Tab View */}
      {activeTab === 'fees' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Assigned Cohort Fee Status
          </h2>

          {/* Mobile Card List (< md) */}
          <div className="md:hidden space-y-3">
            {fees.map((f) => (
              <div key={f.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">{f.studentName}</h3>
                    <p className="font-mono text-[11px] text-slate-400">{f.studentRollNo} • {f.course}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold shrink-0 ${getStatusBadge(f.status)}`}>
                    {f.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs py-2 border-t border-slate-900 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Total</span>
                    <span className="text-white font-semibold text-[11px]">${f.totalAmount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Paid</span>
                    <span className="text-emerald-400 font-semibold text-[11px]">${f.paidAmount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Balance</span>
                    <span className="text-amber-400 font-semibold text-[11px]">${f.balance}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">Due: {f.dueDate}</div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Fee Status</th>
                  <th className="px-4 py-3">Paid Amount</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                {fees.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-white">
                      {f.studentName} <span className="font-mono text-[11px] text-slate-400 block font-normal">{f.studentRollNo}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{f.course}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${getStatusBadge(f.status)}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-400 font-bold">${f.paidAmount}</td>
                    <td className="px-4 py-3 font-mono text-amber-400">${f.balance}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{f.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* Cohort Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assigned student or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Fee Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* 2-Column Cohort Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Assigned Students List */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
                <span>Assigned Cohort ({filteredStudents.length})</span>
                <span className="text-[10px] text-emerald-400">Server Filtered</span>
              </h2>

              {loading ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                  Loading cohort...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                  No students found matching filter.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredStudents.map((stu) => {
                    const isSelected = selectedStudent?.id === stu.id;
                    return (
                      <button
                        key={stu.id}
                        onClick={() => setSelectedStudent(stu)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-slate-800/90 border-emerald-500/40 shadow-lg'
                            : 'bg-slate-900 border-slate-800/80 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-bold text-white">{stu.fullName}</p>
                            <p className="text-xs text-slate-400 font-mono">{stu.rollNo}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(stu.feeStatus)}`}>
                            {stu.feeStatus}
                          </span>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                          <span>{stu.course}</span>
                          <span className="font-mono text-emerald-400 font-bold">${stu.feePaid} / ${stu.feeAmount}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Selected Student Detail Panel */}
            <div className="lg:col-span-7">
              {selectedStudent ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">{selectedStudent.fullName}</h2>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {selectedStudent.rollNo} • {selectedStudent.email}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getStatusBadge(selectedStudent.feeStatus)}`}>
                      Fee: {selectedStudent.feeStatus}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Progress</span>
                      <span className="text-sm font-bold text-indigo-400 font-mono">{selectedStudent.academicProgress}%</span>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Attendance</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">{selectedStudent.attendancePercentage}%</span>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Balance</span>
                      <span className="text-sm font-bold text-amber-400 font-mono">
                        ${selectedStudent.feeAmount - selectedStudent.feePaid}
                      </span>
                    </div>
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="space-y-3">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Log Counseling &amp; Academic Note
                    </label>
                    <textarea
                      rows={3}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Enter observation, guidance recommendation, or academic review..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingNote || !noteText.trim()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {savingNote ? 'Saving...' : 'Add Note to Profile'}
                      </button>
                    </div>
                  </form>

                  {/* Past Counseling Session Notes */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Counseling History ({selectedStudent.counselorNotes.length})
                    </h3>
                    {selectedStudent.counselorNotes.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">No notes recorded yet for this student.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {selectedStudent.counselorNotes.map((n) => (
                          <div key={n.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
                            <div className="flex items-center justify-between text-slate-400 mb-1">
                              <span className="font-bold text-emerald-300">{n.authorName}</span>
                              <span className="text-[11px] text-slate-500">{n.date}</span>
                            </div>
                            <p className="text-slate-300">{n.note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl text-xs">
                  Select a student from your cohort on the left to view records and log counseling sessions.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
