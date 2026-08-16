import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentRecord, CounselorRecord, FeeRecord, SystemSettings } from '../types';
import { INITIAL_STUDENTS, INITIAL_COUNSELORS, INITIAL_FEES } from '../data/mockData';
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
  Trash2,
  DollarSign,
  ArrowUpDown,
  Shield,
  Settings,
  Sparkles,
  Download,
  BookOpen,
  Mail,
  Building,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
  X,
} from 'lucide-react';

interface Props {
  activeTab: 'overview' | 'students' | 'counselors' | 'fees' | 'settings' | 'notion';
  onOpenNotionModal: () => void;
  onOpenArchitecture: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ activeTab, onOpenNotionModal, onOpenArchitecture }) => {
  const { token, switchRoleQuick } = useAuth();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [counselors, setCounselors] = useState<CounselorRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    portalName: 'Notion Student Portal',
    institutionName: 'Apex Institute of Technology & Management',
    academicTerm: 'Fall 2026 Semester',
    supportEmail: 'admissions@school.edu',
    currencySymbol: '$',
    availableCourses: [
      'Full Stack Web Development',
      'UI/UX Design Systems',
      'Data Science & Machine Learning',
      'Cyber Security Essentials',
    ],
    allowStudentFeeDownload: true,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState<string>('all');

  // Modals state
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddCounselorModal, setShowAddCounselorModal] = useState(false);
  const [editingCounselor, setEditingCounselor] = useState<CounselorRecord | null>(null);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [newCourseInput, setNewCourseInput] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Forms state
  const [newStudent, setNewStudent] = useState({
    fullName: '',
    rollNo: `STU-2026-00${Math.floor(Math.random() * 90) + 10}`,
    email: '',
    phone: '+92 300 1122334',
    course: 'Full Stack Web Development',
    counselorId: '',
    counselorName: '',
    feeStatus: 'Pending' as const,
    feeAmount: 1200,
    feePaid: 0,
    dueDate: '2026-08-30',
    enrollmentDate: '2026-08-01',
    academicProgress: 80,
    attendancePercentage: 90,
  });

  const [newCounselor, setNewCounselor] = useState({
    name: '',
    email: '',
    phone: '+92 300 7654321',
    specialization: 'STEM & Software Engineering',
  });

  useEffect(() => {
    fetchAllData();
    fetchSettings();
  }, [token]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const fetchAllData = async (retryCount = 0) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [stuRes, counsRes, feeRes] = await Promise.allSettled([
        fetch('/api/students', { headers }),
        fetch('/api/counselors', { headers }),
        fetch('/api/fees', { headers }),
      ]);

      let stuList: StudentRecord[] = [];
      let cList: CounselorRecord[] = [];
      let fList: FeeRecord[] = [];

      if (stuRes.status === 'fulfilled' && stuRes.value.ok) {
        const data = await stuRes.value.json();
        stuList = data.students || [];
      } else {
        console.warn('Students fetch not fulfilled, using fallback store');
        stuList = [...INITIAL_STUDENTS];
      }

      if (counsRes.status === 'fulfilled' && counsRes.value.ok) {
        const data = await counsRes.value.json();
        cList = data.counselors || [];
      } else {
        cList = [...INITIAL_COUNSELORS];
      }

      if (feeRes.status === 'fulfilled' && feeRes.value.ok) {
        const data = await feeRes.value.json();
        fList = data.fees || [];
      } else {
        fList = [...INITIAL_FEES];
      }

      setStudents(stuList.length > 0 ? stuList : [...INITIAL_STUDENTS]);
      setCounselors(cList.length > 0 ? cList : [...INITIAL_COUNSELORS]);
      setFees(fList.length > 0 ? fList : [...INITIAL_FEES]);

      if (cList.length > 0 && !newStudent.counselorId) {
        setNewStudent((prev) => ({
          ...prev,
          counselorId: cList[0].id,
          counselorName: cList[0].name,
        }));
      }
    } catch (e) {
      console.warn('Network issue fetching admin data, applying local data store:', e);
      setStudents([...INITIAL_STUDENTS]);
      setCounselors([...INITIAL_COUNSELORS]);
      setFees([...INITIAL_FEES]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
      }
    } catch (e) {
      console.warn('Using default system settings:', e);
    }
  };

  // CREATE STUDENT
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

      const data = await res.json();
      if (res.ok) {
        setShowAddStudentModal(false);
        fetchAllData();
        showToast(data.message || 'Student added successfully!');
        setNewStudent({
          fullName: '',
          rollNo: `STU-2026-00${Math.floor(Math.random() * 90) + 10}`,
          email: '',
          phone: '+92 300 1122334',
          course: settings.availableCourses[0] || 'Full Stack Web Development',
          counselorId: counselors[0]?.id || '',
          counselorName: counselors[0]?.name || '',
          feeStatus: 'Pending',
          feeAmount: 1200,
          feePaid: 0,
          dueDate: '2026-08-30',
          enrollmentDate: '2026-08-01',
          academicProgress: 80,
          attendancePercentage: 90,
        });
      } else {
        showToast(data.error || 'Failed to create student.', 'error');
      }
    } catch (err) {
      showToast('Network error creating student.', 'error');
    }
  };

  // UPDATE STUDENT
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
        showToast('Student record updated successfully!');
      } else {
        showToast('Failed to update student.', 'error');
      }
    } catch (err) {
      showToast('Network error updating student.', 'error');
    }
  };

  // DELETE STUDENT
  const handleDeleteStudent = async (id: string, name: string) => {
    if (!token || !window.confirm(`Are you sure you want to delete student "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchAllData();
        showToast(`Student "${name}" deleted.`);
      }
    } catch (err) {
      showToast('Failed to delete student.', 'error');
    }
  };

  // CREATE COUNSELOR
  const handleCreateCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/counselors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCounselor),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddCounselorModal(false);
        fetchAllData();
        showToast(data.message || 'Counselor created successfully with login credentials!');
        setNewCounselor({
          name: '',
          email: '',
          phone: '+92 300 7654321',
          specialization: 'STEM & Software Engineering',
        });
      } else {
        showToast(data.error || 'Failed to create counselor', 'error');
      }
    } catch (err) {
      showToast('Error creating counselor.', 'error');
    }
  };

  // UPDATE COUNSELOR
  const handleUpdateCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCounselor || !token) return;
    try {
      const res = await fetch(`/api/counselors/${editingCounselor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingCounselor),
      });
      if (res.ok) {
        setEditingCounselor(null);
        fetchAllData();
        showToast('Counselor updated successfully!');
      }
    } catch (err) {
      showToast('Error updating counselor.', 'error');
    }
  };

  // DELETE COUNSELOR
  const handleDeleteCounselor = async (id: string, name: string) => {
    if (!token || !window.confirm(`Are you sure you want to delete counselor "${name}"?`)) return;
    try {
      const res = await fetch(`/api/counselors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchAllData();
        showToast(`Counselor "${name}" removed.`);
      }
    } catch (err) {
      showToast('Failed to delete counselor.', 'error');
    }
  };

  // UPDATE FEE
  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFee || !token) return;
    try {
      const res = await fetch(`/api/fees/${editingFee.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingFee),
      });
      if (res.ok) {
        setEditingFee(null);
        fetchAllData();
        showToast('Fee payment status updated!');
      }
    } catch (err) {
      showToast('Failed to update fee record.', 'error');
    }
  };

  // QUICK MARK FEE AS PAID
  const handleQuickMarkPaid = async (fee: FeeRecord) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/fees/${fee.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paidAmount: fee.totalAmount,
          status: 'Paid',
        }),
      });
      if (res.ok) {
        fetchAllData();
        showToast(`Marked ${fee.studentName}'s fee as fully paid!`);
      }
    } catch (err) {
      showToast('Failed to update fee status.', 'error');
    }
  };

  // SAVE PORTAL SETTINGS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Portal settings saved successfully!');
      }
    } catch (err) {
      showToast('Failed to save settings.', 'error');
    }
  };

  // ADD COURSE TO LIST
  const handleAddCourse = () => {
    if (!newCourseInput.trim()) return;
    if (settings.availableCourses.includes(newCourseInput.trim())) {
      showToast('Course already exists in list.', 'error');
      return;
    }
    setSettings({
      ...settings,
      availableCourses: [...settings.availableCourses, newCourseInput.trim()],
    });
    setNewCourseInput('');
    showToast('Course added. Remember to click "Save All Settings".');
  };

  // REMOVE COURSE FROM LIST
  const handleRemoveCourse = (courseName: string) => {
    setSettings({
      ...settings,
      availableCourses: settings.availableCourses.filter((c) => c !== courseName),
    });
    showToast(`Removed "${courseName}". Click "Save All Settings" to apply.`);
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

  const filteredFees = fees.filter((f) => {
    const matchesSearch =
      f.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.studentRollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = feeStatusFilter === 'all' || f.status === feeStatusFilter;
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
      {/* Toast Notification Alert */}
      {statusMessage && (
        <div
          className={`p-3 rounded-2xl text-xs flex items-center justify-between shadow-lg transition-all animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 w-full min-w-0">
          {/* Header Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  {settings.academicTerm}
                </span>
                <span className="text-xs text-slate-400 font-mono">RBAC Security Active</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">{settings.institutionName}</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Super-Admin Control Hub: Manage students, counselors, fee schedules, and Notion database schemas with automated privacy isolation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={onOpenNotionModal}
                className="w-full sm:w-auto px-3 sm:px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Notion Setup</span>
              </button>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 sm:mb-2">
                <span className="font-semibold text-[11px] sm:text-xs">Total Enrolled</span>
                <GraduationCap className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xl sm:text-3xl font-extrabold text-white font-mono">{students.length}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 truncate">Across {settings.availableCourses.length} programs</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 sm:mb-2">
                <span className="font-semibold text-[11px] sm:text-xs">Active Counselors</span>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl sm:text-3xl font-extrabold text-white font-mono">{counselors.length}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 truncate">Assigned cohorts</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 sm:mb-2">
                <span className="font-semibold text-[11px] sm:text-xs">Tuition Collected</span>
                <CreditCard className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {settings.currencySymbol}
                {totalFeeCollected.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 truncate">Verified ledger</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5 sm:mb-2">
                <span className="font-semibold text-[11px] sm:text-xs">Pending Balance</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                {settings.currencySymbol}
                {totalFeePending.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 truncate">Outstanding dues</p>
            </div>
          </div>

          {/* Quick Snapshot Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 w-full min-w-0">
            {/* Quick Students Snapshot */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" /> Recent Students
                </h2>
                <span className="text-xs text-slate-400">Total: {students.length}</span>
              </div>
              <div className="divide-y divide-slate-800/80">
                {students.slice(0, 4).map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{s.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {s.rollNo} • {s.course}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusBadge(s.feeStatus)}`}>
                        {s.feeStatus}
                      </span>
                      <button
                        onClick={() => setEditingStudent(s)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Counselors Snapshot */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Counselors Team
                </h2>
                <button
                  onClick={() => setShowAddCounselorModal(true)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  + Add New
                </button>
              </div>
              <div className="space-y-3">
                {counselors.map((c) => {
                  const assignedCount = students.filter((s) => s.counselorId === c.id).length;
                  return (
                    <div key={c.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-white">{c.name}</p>
                        <p className="text-[11px] text-slate-400">{c.specialization}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] bg-slate-900 border border-slate-800 text-indigo-300 px-2 py-0.5 rounded-lg font-mono">
                          {assignedCount} Students
                        </span>
                        <button
                          onClick={() => switchRoleQuick('counselor', c.id)}
                          className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs"
                          title={`Open ${c.name}'s Cohort View`}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ALL STUDENTS */}
      {/* ======================================================== */}
      {activeTab === 'students' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Central Student Master Database
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Admin Super-Access: All Notion student records with assigned counselor links and fee balances
              </p>
            </div>

            <button
              onClick={() => setShowAddStudentModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Add Student
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, roll number, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Academic Courses</option>
                {settings.availableCourses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Mobile Card View (< md) */}
          <div className="md:hidden space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800">
                No student records found matching filter.
              </div>
            ) : (
              filteredStudents.map((s) => (
                <div key={s.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{s.fullName}</h3>
                      <p className="font-mono text-[11px] text-slate-400">{s.rollNo} • {s.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold shrink-0 ${getStatusBadge(s.feeStatus)}`}>
                      {s.feeStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-900">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Course</span>
                      <span className="text-slate-300 font-medium truncate block">{s.course}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Counselor</span>
                      <span className="text-emerald-400 font-medium truncate block">{s.counselorName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Progress</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${s.academicProgress}%` }} />
                        </div>
                        <span className="font-mono text-[11px] text-slate-300">{s.academicProgress}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Tuition Paid</span>
                      <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                        {settings.currencySymbol}{s.feePaid} <span className="text-slate-500">/ {settings.currencySymbol}{s.feeAmount}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => switchRoleQuick('student', s.id)}
                      className="flex-1 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-xl transition-colors flex items-center justify-center gap-1 text-xs font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Portal</span>
                    </button>
                    <button
                      onClick={() => setEditingStudent(s)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
                      title="Edit Student"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(s.id, s.fullName)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
                      title="Delete Student"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Student Desktop Table (>= md) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Student &amp; Roll No</th>
                  <th className="px-4 py-3.5">Course</th>
                  <th className="px-4 py-3.5">Assigned Counselor</th>
                  <th className="px-4 py-3.5">Progress</th>
                  <th className="px-4 py-3.5">Fee Status</th>
                  <th className="px-4 py-3.5">Paid / Total</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No student records found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-bold text-white block">{s.fullName}</span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {s.rollNo} • {s.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{s.course}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                          {s.counselorName}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${s.academicProgress}%` }} />
                          </div>
                          <span className="text-[11px] text-slate-300">{s.academicProgress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${getStatusBadge(s.feeStatus)}`}>
                          {s.feeStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className="text-emerald-400">
                          {settings.currencySymbol}
                          {s.feePaid}
                        </span>
                        <span className="text-slate-500">
                          {' '}
                          / {settings.currencySymbol}
                          {s.feeAmount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => switchRoleQuick('student', s.id)}
                            className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                            title={`Open Student Portal as ${s.fullName}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="hidden sm:inline">Open Portal</span>
                          </button>
                          <button
                            onClick={() => setEditingStudent(s)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Edit Student & Fees"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id, s.fullName)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: COUNSELORS */}
      {/* ======================================================== */}
      {activeTab === 'counselors' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-6 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" /> Counselor Team Management
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage counseling advisors, specialization tracks, and assigned cohort allocations.
              </p>
            </div>

            <button
              onClick={() => setShowAddCounselorModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" /> Add Counselor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {counselors.map((c) => {
              const assignedStudents = students.filter((s) => s.counselorId === c.id);
              return (
                <div key={c.id} className="p-4 sm:p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{c.name}</h3>
                        <p className="text-xs text-emerald-400 font-medium truncate">{c.specialization}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{c.email} • {c.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingCounselor(c)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Edit Counselor"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCounselor(c.id, c.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete Counselor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Assigned Cohort:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300 font-mono font-bold">
                      {assignedStudents.length} Students
                    </span>
                  </div>

                  {assignedStudents.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {assignedStudents.map((s) => (
                        <span key={s.id} className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                          {s.fullName} ({s.rollNo})
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => switchRoleQuick('counselor', c.id)}
                    className="w-full mt-2 py-2 px-3 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Counselor Portal ({c.name.split(' ')[0]})</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: FEE LEDGER */}
      {/* ======================================================== */}
      {activeTab === 'fees' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-6 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> Institution Fee &amp; Tuition Ledger
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Financial database tracking payments, balances, due dates, and receipts.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  const headers = 'Student Name,Roll No,Course,Total Amount,Paid Amount,Balance,Status,Due Date\n';
                  const rows = fees
                    .map((f) => `"${f.studentName}","${f.studentRollNo}","${f.course}",${f.totalAmount},${f.paidAmount},${f.balance},"${f.status}","${f.dueDate}"`)
                    .join('\n');
                  const blob = new Blob([headers + rows], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Fee_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  showToast('Fee Ledger exported as CSV!');
                }}
                className="w-full sm:w-auto px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Fee Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-500 uppercase font-semibold block">Total Revenue Expected</span>
              <p className="text-2xl font-bold text-white font-mono mt-1">
                {settings.currencySymbol}
                {(totalFeeCollected + totalFeePending).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-emerald-500 uppercase font-semibold block">Collected to Date</span>
              <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {settings.currencySymbol}
                {totalFeeCollected.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-amber-500 uppercase font-semibold block">Outstanding Pending</span>
              <p className="text-2xl font-bold text-amber-400 font-mono mt-1">
                {settings.currencySymbol}
                {totalFeePending.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ledger by student name, roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={feeStatusFilter}
                onChange={(e) => setFeeStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Fee Mobile Card View (< md) */}
          <div className="md:hidden space-y-3">
            {filteredFees.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-800">
                No fee records found.
              </div>
            ) : (
              filteredFees.map((f) => (
                <div key={f.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-sm">{f.studentName}</h3>
                      <p className="font-mono text-[11px] text-slate-400">{f.studentRollNo} • {f.course}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold shrink-0 ${getStatusBadge(f.status)}`}>
                      {f.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs py-2 border-y border-slate-900 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-sans">Total</span>
                      <span className="text-white font-semibold text-[11px]">{settings.currencySymbol}{f.totalAmount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-sans">Paid</span>
                      <span className="text-emerald-400 font-semibold text-[11px]">{settings.currencySymbol}{f.paidAmount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-sans">Balance</span>
                      <span className="text-amber-400 font-semibold text-[11px]">{settings.currencySymbol}{f.balance}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-500 font-mono">Due: {f.dueDate}</span>
                    <div className="flex items-center gap-1.5">
                      {f.status !== 'Paid' && (
                        <button
                          onClick={() => handleQuickMarkPaid(f)}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-semibold transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => setEditingFee(f)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-colors"
                        title="Edit Fee"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Fee Desktop Table (>= md) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Course</th>
                  <th className="px-4 py-3.5">Total Amount</th>
                  <th className="px-4 py-3.5">Paid</th>
                  <th className="px-4 py-3.5">Balance</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                {filteredFees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No fee records found.
                    </td>
                  </tr>
                ) : (
                  filteredFees.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-bold text-white block">{f.studentName}</span>
                          <span className="font-mono text-[11px] text-slate-400">{f.studentRollNo}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{f.course}</td>
                      <td className="px-4 py-3 font-mono text-white">
                        {settings.currencySymbol}
                        {f.totalAmount}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-400 font-semibold">
                        {settings.currencySymbol}
                        {f.paidAmount}
                      </td>
                      <td className="px-4 py-3 font-mono text-amber-400">
                        {settings.currencySymbol}
                        {f.balance}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${getStatusBadge(f.status)}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">{f.dueDate}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {f.status !== 'Paid' && (
                            <button
                              onClick={() => handleQuickMarkPaid(f)}
                              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-medium transition-colors"
                              title="Mark Fully Paid"
                            >
                              Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => setEditingFee(f)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                            title="Edit Ledger Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: PORTAL SETTINGS (Self-Service Customization) */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-6 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" /> Admin Self-Service Portal Customization
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize institution branding, semesters, academic courses, and admissions settings without touching any code.
              </p>
            </div>
            <button
              onClick={handleSaveSettings}
              className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <CheckCircle className="w-4 h-4" /> Save All Settings
            </button>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" /> Institution Name
                </label>
                <input
                  type="text"
                  value={settings.institutionName}
                  onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Current Academic Term / Semester
                </label>
                <input
                  type="text"
                  value={settings.academicTerm}
                  onChange={(e) => setSettings({ ...settings, academicTerm: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> Support / Admissions Contact Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Currency Symbol
                </label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Academic Courses Manager */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Manage Academic Programs &amp; Courses
                </label>
                <span className="text-[11px] text-slate-500">Add or remove programs available for enrollment</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence & Prompt Engineering"
                  value={newCourseInput}
                  onChange={(e) => setNewCourseInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Course
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {settings.availableCourses.map((c) => (
                  <div key={c} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-slate-200 font-medium">{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(c)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Remove Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD STUDENT */}
      {/* ======================================================== */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Go Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <h3 className="text-base font-extrabold text-white">Add New Student</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name</label>
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
                  <label className="block text-slate-300 mb-1 font-semibold">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Email (Used for Login)</label>
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
                  <label className="block text-slate-300 mb-1 font-semibold">Academic Program</label>
                  <select
                    value={newStudent.course}
                    onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {settings.availableCourses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Assign Counselor</label>
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
                  <label className="block text-slate-300 mb-1 font-semibold">Total Fee ($)</label>
                  <input
                    type="number"
                    value={newStudent.feeAmount}
                    onChange={(e) => setNewStudent({ ...newStudent, feeAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Paid Fee ($)</label>
                  <input
                    type="number"
                    value={newStudent.feePaid}
                    onChange={(e) => setNewStudent({ ...newStudent, feePaid: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Fee Status</label>
                  <select
                    value={newStudent.feeStatus}
                    onChange={(e) => setNewStudent({ ...newStudent, feeStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400">
                💡 <span className="font-semibold text-slate-300">Automatic Login Account:</span> The student will automatically be granted login access with their email and default password: <code className="text-indigo-400 font-mono">student123</code>.
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"
                >
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT STUDENT */}
      {/* ======================================================== */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Go Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <h3 className="text-base font-extrabold text-white">Edit Student &amp; Assign Counselor</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Assigned Counselor</label>
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
                        {c.name} ({c.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Academic Course</label>
                  <select
                    value={editingStudent.course}
                    onChange={(e) => setEditingStudent({ ...editingStudent, course: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    {settings.availableCourses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Total Fee ($)</label>
                  <input
                    type="number"
                    value={editingStudent.feeAmount}
                    onChange={(e) => setEditingStudent({ ...editingStudent, feeAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Paid Fee ($)</label>
                  <input
                    type="number"
                    value={editingStudent.feePaid}
                    onChange={(e) => setEditingStudent({ ...editingStudent, feePaid: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Fee Status</label>
                  <select
                    value={editingStudent.feeStatus}
                    onChange={(e) => setEditingStudent({ ...editingStudent, feeStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingStudent.academicProgress}
                    onChange={(e) => setEditingStudent({ ...editingStudent, academicProgress: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Attendance (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingStudent.attendancePercentage}
                    onChange={(e) => setEditingStudent({ ...editingStudent, attendancePercentage: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD COUNSELOR */}
      {/* ======================================================== */}
      {showAddCounselorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCounselorModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Go Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <h3 className="text-base font-extrabold text-white">Add New Counselor</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCounselorModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCounselor} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Counselor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Zainab Ali"
                  value={newCounselor.name}
                  onChange={(e) => setNewCounselor({ ...newCounselor, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Email (Login ID)</label>
                  <input
                    type="email"
                    required
                    placeholder="counselor@school.edu"
                    value={newCounselor.email}
                    onChange={(e) => setNewCounselor({ ...newCounselor, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={newCounselor.phone}
                    onChange={(e) => setNewCounselor({ ...newCounselor, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science & Career Guidance"
                  value={newCounselor.specialization}
                  onChange={(e) => setNewCounselor({ ...newCounselor, specialization: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400">
                💡 <span className="font-semibold text-slate-300">Counselor Login Password:</span> <code className="text-emerald-400 font-mono">counselor123</code> (Bcrypt encrypted hash created).
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCounselorModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                >
                  Create Counselor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT COUNSELOR */}
      {/* ======================================================== */}
      {editingCounselor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCounselor(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Go Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <h3 className="text-base font-extrabold text-white">Edit Counselor Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCounselor(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateCounselor} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Counselor Name</label>
                <input
                  type="text"
                  value={editingCounselor.name}
                  onChange={(e) => setEditingCounselor({ ...editingCounselor, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    value={editingCounselor.email}
                    onChange={(e) => setEditingCounselor({ ...editingCounselor, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Phone</label>
                  <input
                    type="text"
                    value={editingCounselor.phone}
                    onChange={(e) => setEditingCounselor({ ...editingCounselor, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Specialization Track</label>
                <input
                  type="text"
                  value={editingCounselor.specialization}
                  onChange={(e) => setEditingCounselor({ ...editingCounselor, specialization: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCounselor(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT FEE RECORD */}
      {/* ======================================================== */}
      {editingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFee(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Go Back"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <h3 className="text-base font-extrabold text-white">Update Fee Payment</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingFee(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Student: {editingFee.studentName} ({editingFee.studentRollNo})
            </p>
            <form onSubmit={handleUpdateFee} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Total Fee ($)</label>
                <input
                  type="number"
                  value={editingFee.totalAmount}
                  onChange={(e) => setEditingFee({ ...editingFee, totalAmount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Amount Paid ($)</label>
                <input
                  type="number"
                  value={editingFee.paidAmount}
                  onChange={(e) => setEditingFee({ ...editingFee, paidAmount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Status</label>
                <select
                  value={editingFee.status}
                  onChange={(e) => setEditingFee({ ...editingFee, status: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Due Date</label>
                <input
                  type="date"
                  value={editingFee.dueDate}
                  onChange={(e) => setEditingFee({ ...editingFee, dueDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingFee(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                >
                  Update Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
