import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentRecord, CounselorRecord, FeeRecord } from '../types';
import {
  Users,
  GraduationCap,
  CreditCard,
  UserCheck,
  Search,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Database,
  Edit2,
  DollarSign,
  ArrowUpDown,
  Shield,
} from 'lucide-react';

interface Props {
  activeTab: 'overview' | 'students' | 'counselors' | 'fees' | 'notion';
  onOpenNotionModal: () => void;
  onOpenArchitecture: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ activeTab, onOpenNotionModal, onOpenArchitecture }) => {
  const { token } = useAuth();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [counselors, setCounselors] = useState<CounselorRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding/editing
  const [newStudent, setNewStudent] = useState({
    fullName: '',
    rollNo: `STU-2024-00${Math.floor(Math.random() * 90) + 10}`,
    email: '',
    phone: '+92 300 1122334',
    course: 'Full Stack Web Development',
    counselorId: 'counselor-1',
    counselorName: 'Sarah Khan',
    feeStatus: 'Pending' as const,
    feeAmount: 1200,
    feePaid: 0,
    dueDate: '2026-08-30',
    enrollmentDate: '2026-08-01',
    academicProgress: 75,
    attendancePercentage: 90,
  });

  useEffect(() => {
    fetchAllData();
  }, [token]);

  const fetchAllData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [stuRes, counsRes, feeRes] = await Promise.all([
        fetch('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/counselors', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/fees', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const stuData = await stuRes.json();
      const counsData = await counsRes.json();
      const feeData = await feeRes.json();

      setStudents(stuData.students || []);
      setCounselors(counsData.counselors || []);
      setFees(feeData.fees || []);
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStudent),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchAllData();
      }
    } catch (err) {
      console.error('Error creating student', err);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !token) return;
    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingStudent),
      });

      if (res.ok) {
        setEditingStudent(null);
        fetchAllData();
      }
    } catch (err) {
      console.error('Error updating student', err);
    }
  };

  const totalFeeCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalFeePending = fees.reduce((sum, f) => sum + f.balance, 0);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || s.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Overdue':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Metric Cards (Strictly for functional overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Enrolled</span>
            <GraduationCap className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{students.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across 4 core programs</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Counselors</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{counselors.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Assigned cohorts</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Tuition Collected</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">${totalFeeCollected.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">Verified payments</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Outstanding Balance</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 font-mono">${totalFeePending.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 mt-1">Pending dues</p>
        </div>
      </div>

      {/* Main Student Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Central Student Master Database
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Unrestricted Admin Super-Access: All Notion student records and assigned counselors
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Add Student
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Academic Courses</option>
              <option value="Full Stack Web Development">Full Stack Web Dev</option>
              <option value="UI/UX Design Systems">UI/UX Design</option>
              <option value="Data Science & Machine Learning">Data Science</option>
              <option value="Cyber Security Essentials">Cyber Security</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Student &amp; Roll No</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Assigned Counselor</th>
                <th className="px-4 py-3">Fee Status</th>
                <th className="px-4 py-3">Paid / Total</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No student records found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-white block">{s.fullName}</span>
                        <span className="font-mono text-[11px] text-slate-400">{s.rollNo} • {s.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{s.course}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                        {s.counselorName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${getStatusBadge(s.feeStatus)}`}>
                        {s.feeStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className="text-emerald-400">${s.feePaid}</span>
                      <span className="text-slate-500"> / ${s.feeAmount}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingStudent(s)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Edit Student & Fees"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Counselors Directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <UserCheck className="w-4 h-4 text-emerald-400" /> Counselor Roster (Linked Notion Database)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {counselors.map((c) => {
            const assignedCount = students.filter((s) => s.counselorId === c.id).length;
            return (
              <div key={c.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{c.name}</h3>
                    <p className="text-xs text-slate-400">{c.specialization}</p>
                    <p className="text-[11px] text-slate-500">{c.email} • {c.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-slate-900 border border-slate-800 text-indigo-300 px-2.5 py-1 rounded-lg font-mono">
                    {assignedCount} Students
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Add New Student to Notion Database</h3>
            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  placeholder="e.g. Maryam Siddiqui"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Email</label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    placeholder="student@school.edu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Academic Program</label>
                  <select
                    value={newStudent.course}
                    onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="Full Stack Web Development">Full Stack Web Dev</option>
                    <option value="UI/UX Design Systems">UI/UX Design</option>
                    <option value="Data Science & Machine Learning">Data Science</option>
                    <option value="Cyber Security Essentials">Cyber Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Assign Counselor</label>
                  <select
                    value={newStudent.counselorId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const c = counselors.find((item) => item.id === id);
                      setNewStudent({
                        ...newStudent,
                        counselorId: id,
                        counselorName: c ? c.name : 'Sarah Khan',
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {counselors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Total Fee ($)</label>
                  <input
                    type="number"
                    value={newStudent.feeAmount}
                    onChange={(e) => setNewStudent({ ...newStudent, feeAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Paid Fee ($)</label>
                  <input
                    type="number"
                    value={newStudent.feePaid}
                    onChange={(e) => setNewStudent({ ...newStudent, feePaid: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Status</label>
                  <select
                    value={newStudent.feeStatus}
                    onChange={(e) => setNewStudent({ ...newStudent, feeStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium"
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Edit Student &amp; Fees Record</h3>
            <form onSubmit={handleUpdateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Counselor</label>
                  <select
                    value={editingStudent.counselorId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const c = counselors.find((item) => item.id === id);
                      setEditingStudent({
                        ...editingStudent,
                        counselorId: id,
                        counselorName: c ? c.name : editingStudent.counselorName,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {counselors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Fee Status</label>
                  <select
                    value={editingStudent.feeStatus}
                    onChange={(e) => setEditingStudent({ ...editingStudent, feeStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Paid Amount ($)</label>
                  <input
                    type="number"
                    value={editingStudent.feePaid}
                    onChange={(e) => setEditingStudent({ ...editingStudent, feePaid: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Due Date</label>
                  <input
                    type="date"
                    value={editingStudent.dueDate}
                    onChange={(e) => setEditingStudent({ ...editingStudent, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
