import React, { useState } from 'react';
import { StudentRecord, CounselorRecord, User } from '../types';
import { 
  Users, 
  DollarSign, 
  UserCheck, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  ExternalLink,
  Edit2,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  FileText
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  students: StudentRecord[];
  counselors: CounselorRecord[];
  onAddStudent: () => void;
  onUpdateStudentFee: (studentId: string, status: 'Paid' | 'Pending' | 'Overdue', paidAmount: number) => void;
  onSelectStudentDetail: (student: StudentRecord) => void;
  onSyncNotion: () => void;
  isSyncing: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  students,
  counselors,
  onAddStudent,
  onUpdateStudentFee,
  onSelectStudentDetail,
  onSyncNotion,
  isSyncing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCounselorFilter, setSelectedCounselorFilter] = useState('all');
  const [selectedFeeFilter, setSelectedFeeFilter] = useState('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');

  // Stats Calculations
  const totalStudents = students.length;
  const totalCounselors = counselors.length;
  const totalFeeCollected = students.reduce((sum, s) => sum + (s.feePaid || 0), 0);
  const totalPendingFee = students.reduce((sum, s) => sum + Math.max(0, (s.feeAmount || 0) - (s.feePaid || 0)), 0);
  const paidCount = students.filter((s) => s.feeStatus === 'Paid').length;
  const overdueCount = students.filter((s) => s.feeStatus === 'Overdue').length;

  // Filter Logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCounselor =
      selectedCounselorFilter === 'all' || s.counselorId === selectedCounselorFilter;

    const matchesFee =
      selectedFeeFilter === 'all' || s.feeStatus === selectedFeeFilter;

    const matchesCourse =
      selectedCourseFilter === 'all' || s.course === selectedCourseFilter;

    return matchesSearch && matchesCounselor && matchesFee && matchesCourse;
  });

  const coursesList = Array.from(new Set(students.map((s) => s.course)));

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner & Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              👑 Level 1 Super-Admin Access
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Administrator Oversight Portal
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Complete cross-system management. Oversee all {totalCounselors} counselors, {totalStudents} students, tuition fee collections, and Notion database sync.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSyncNotion}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isSyncing ? 'Syncing Notion...' : 'Sync Notion'}</span>
            </button>

            <button
              onClick={onAddStudent}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Enrolled</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalStudents}</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Across all courses and tracks</p>
        </div>

        {/* Fees Collected */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fees Collected</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">${totalFeeCollected.toLocaleString()}</span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">{paidCount} students fully paid</p>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Tuition</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">${totalPendingFee.toLocaleString()}</span>
            <span className="text-xs text-rose-400 font-medium">({overdueCount} overdue)</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Outstanding payment balance</p>
        </div>

        {/* Counselors Count */}
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Counselors</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalCounselors}</span>
            <span className="text-xs text-slate-400">Teachers</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Managing assigned student groups</p>
        </div>

      </div>

      {/* Counselors Distribution Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            Counselors Hierarchy & Allocation
          </h2>
          <span className="text-xs text-slate-400">Level 2 Group Managers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {counselors.map((counselor) => {
            const assignedCount = students.filter((s) => s.counselorId === counselor.id).length;
            return (
              <div
                key={counselor.id}
                className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex items-center gap-3.5 hover:border-slate-600 transition"
              >
                <img
                  src={counselor.avatar}
                  alt={counselor.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/20"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-100 truncate">{counselor.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{counselor.specialization}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {assignedCount} Students Assigned
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Filter & Student Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table Filter Controls */}
        <div className="p-5 border-b border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              All Student Database Records ({filteredStudents.length})
            </h2>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, roll no, email..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter by:
            </div>

            {/* Counselor Filter */}
            <select
              value={selectedCounselorFilter}
              onChange={(e) => setSelectedCounselorFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Counselors</option>
              {counselors.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Fee Status Filter */}
            <select
              value={selectedFeeFilter}
              onChange={(e) => setSelectedFeeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Fee Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>

            {/* Course Filter */}
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Courses</option>
              {coursesList.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Roll No / Student</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Assigned Counselor</th>
                <th className="py-3.5 px-4">Fee Status</th>
                <th className="py-3.5 px-4">Amount / Paid</th>
                <th className="py-3.5 px-4">Progress</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No student records matching current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const feeRemaining = student.feeAmount - student.feePaid;
                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              {student.fullName}
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                {student.rollNo}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {student.course}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                          {student.counselorName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {student.feeStatus === 'Paid' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        )}
                        {student.feeStatus === 'Pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {student.feeStatus === 'Overdue' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100">
                          ${student.feePaid} <span className="text-slate-500 font-normal">/ ${student.feeAmount}</span>
                        </div>
                        {feeRemaining > 0 && (
                          <div className="text-[10px] text-amber-400">
                            ${feeRemaining} remaining
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="w-24">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-semibold">
                            <span>{student.academicProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${student.academicProgress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectStudentDetail(student)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                            title="View Full Profile & Notes"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          
                          {student.feeStatus !== 'Paid' && (
                            <button
                              onClick={() => onUpdateStudentFee(student.id, 'Paid', student.feeAmount)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 border border-emerald-500/30 transition"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
