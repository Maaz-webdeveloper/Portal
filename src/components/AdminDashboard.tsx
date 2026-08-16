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
  Terminal,
  Copy,
  Check,
  Code,
  FileJson,
  Layers,
  Cpu,
  Printer,
  Receipt,
  Share2,
  MessageCircle,
  Calendar,
} from 'lucide-react';
import { FeeChallanModal } from './FeeChallanModal';
import { FeeReminderModal } from './FeeReminderModal';
import { InstallmentPlanModal } from './InstallmentPlanModal';

interface Props {
  activeTab: 'overview' | 'students' | 'counselors' | 'fees' | 'settings' | 'notion' | 'debug';
  onOpenNotionModal: () => void;
  onOpenArchitecture: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ activeTab, onOpenNotionModal, onOpenArchitecture }) => {
  const { token, switchRoleQuick } = useAuth();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [counselors, setCounselors] = useState<CounselorRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [debugView, setDebugView] = useState<'overview' | 'students' | 'counselors' | 'fees' | 'notion_map' | 'raw_all'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
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
  const [challanFee, setChallanFee] = useState<FeeRecord | null>(null);
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [reminderFee, setReminderFee] = useState<FeeRecord | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [installmentFee, setInstallmentFee] = useState<FeeRecord | null>(null);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
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
    if (!newStudent.fullName.trim()) {
      showToast('Student full name is required.', 'error');
      return;
    }

    const studentId = `stu-${Date.now()}`;
    const rollNo = newStudent.rollNo.trim() || `STU-2026-00${Math.floor(Math.random() * 90) + 10}`;
    const counselor = counselors.find((c) => c.id === newStudent.counselorId) || counselors[0];
    const totalFee = Number(newStudent.feeAmount) || 1200;
    const paidFee = Number(newStudent.feePaid) || 0;
    const feeStatus = newStudent.feeStatus || (paidFee >= totalFee ? 'Paid' : paidFee > 0 ? 'Partial' : 'Pending');

    const studentToAdd: StudentRecord = {
      ...newStudent,
      id: studentId,
      rollNo,
      fullName: newStudent.fullName.trim(),
      email: newStudent.email.trim() || `${newStudent.fullName.toLowerCase().replace(/\s+/g, '.')}@school.edu`,
      phone: newStudent.phone || '+92 300 1122334',
      course: newStudent.course || settings.availableCourses[0] || 'Full Stack Web Development',
      counselorId: counselor?.id || 'counselor-1',
      counselorName: counselor?.name || 'Sarah Khan',
      feeStatus,
      feeAmount: totalFee,
      feePaid: paidFee,
      dueDate: newStudent.dueDate || '2026-08-30',
      enrollmentDate: newStudent.enrollmentDate || '2026-08-01',
      academicProgress: Number(newStudent.academicProgress) || 80,
      attendancePercentage: Number(newStudent.attendancePercentage) || 90,
      lastSyncedAt: new Date().toISOString(),
      counselorNotes: [],
    };

    const feeToAdd: FeeRecord = {
      id: `fee-${studentId}`,
      studentId: studentId,
      studentRollNo: rollNo,
      studentName: studentToAdd.fullName,
      course: studentToAdd.course,
      totalAmount: totalFee,
      paidAmount: paidFee,
      balance: Math.max(0, totalFee - paidFee),
      status: feeStatus,
      dueDate: studentToAdd.dueDate,
      lastPaymentDate: paidFee > 0 ? new Date().toISOString().split('T')[0] : undefined,
    };

    // Instant optimistic state update
    setStudents((prev) => [studentToAdd, ...prev]);
    setFees((prev) => [feeToAdd, ...prev]);
    setShowAddStudentModal(false);
    showToast(`Student "${studentToAdd.fullName}" added successfully!`);

    // Reset Form
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

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch('/api/students', {
        method: 'POST',
        headers,
        body: JSON.stringify(studentToAdd),
      });
    } catch (err) {
      console.warn('Sync student in background:', err);
    }
  };

  // UPDATE STUDENT
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const totalFee = Number(editingStudent.feeAmount) || 1200;
    const paidFee = Number(editingStudent.feePaid) || 0;
    const feeStatus = editingStudent.feeStatus || (paidFee >= totalFee ? 'Paid' : paidFee > 0 ? 'Partial' : 'Pending');

    const updatedStudent: StudentRecord = {
      ...editingStudent,
      feeAmount: totalFee,
      feePaid: paidFee,
      feeStatus,
      lastSyncedAt: new Date().toISOString(),
    };

    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    setFees((prev) =>
      prev.map((f) => {
        if (f.studentId === updatedStudent.id || f.studentRollNo === updatedStudent.rollNo) {
          return {
            ...f,
            studentName: updatedStudent.fullName,
            course: updatedStudent.course,
            totalAmount: totalFee,
            paidAmount: paidFee,
            balance: Math.max(0, totalFee - paidFee),
            status: feeStatus,
          };
        }
        return f;
      })
    );

    setEditingStudent(null);
    showToast(`Updated student profile "${updatedStudent.fullName}".`);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/students/${updatedStudent.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updatedStudent),
      });
    } catch (err) {
      console.warn('Update student sync error:', err);
    }
  };

  // DELETE STUDENT
  const handleDeleteStudent = async (id: string, name: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setFees((prev) => prev.filter((f) => f.studentId !== id && f.id !== id));
    showToast(`Student "${name}" deleted.`);

    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers,
      });
    } catch (err) {
      console.warn('Delete student sync error:', err);
    }
  };

  // CREATE COUNSELOR
  const handleCreateCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounselor.name.trim() || !newCounselor.email.trim()) {
      showToast('Name and email are required for counselor.', 'error');
      return;
    }

    const counselorId = `counselor-${Date.now()}`;
    const counselorToAdd: CounselorRecord = {
      id: counselorId,
      name: newCounselor.name.trim(),
      email: newCounselor.email.trim(),
      phone: newCounselor.phone || '+92 300 7654321',
      specialization: newCounselor.specialization || 'STEM & Academic Guidance',
      assignedStudentIds: [],
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    };

    setCounselors((prev) => [...prev, counselorToAdd]);
    setShowAddCounselorModal(false);
    showToast(`Counselor "${counselorToAdd.name}" added successfully!`);

    setNewCounselor({
      name: '',
      email: '',
      phone: '+92 300 7654321',
      specialization: 'STEM & Software Engineering',
    });

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch('/api/counselors', {
        method: 'POST',
        headers,
        body: JSON.stringify(counselorToAdd),
      });
    } catch (err) {
      console.warn('Create counselor sync error:', err);
    }
  };

  // UPDATE COUNSELOR
  const handleUpdateCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCounselor) return;

    const updated = { ...editingCounselor };
    setCounselors((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setStudents((prev) =>
      prev.map((s) => (s.counselorId === updated.id ? { ...s, counselorName: updated.name } : s))
    );

    setEditingCounselor(null);
    showToast(`Counselor "${updated.name}" updated!`);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/counselors/${updated.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('Update counselor sync error:', err);
    }
  };

  // DELETE COUNSELOR
  const handleDeleteCounselor = async (id: string, name: string) => {
    setCounselors((prev) => prev.filter((c) => c.id !== id));
    showToast(`Counselor "${name}" removed.`);

    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/counselors/${id}`, {
        method: 'DELETE',
        headers,
      });
    } catch (err) {
      console.warn('Delete counselor sync error:', err);
    }
  };

  // UPDATE FEE
  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFee) return;

    const paid = Number(editingFee.paidAmount) || 0;
    const total = Number(editingFee.totalAmount) || 0;
    const balance = Math.max(0, total - paid);
    const status = editingFee.status || (balance === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Pending');

    const updatedFee: FeeRecord = {
      ...editingFee,
      paidAmount: paid,
      totalAmount: total,
      balance,
      status,
      lastPaymentDate: paid > 0 ? new Date().toISOString().split('T')[0] : editingFee.lastPaymentDate,
    };

    setFees((prev) => prev.map((f) => (f.id === updatedFee.id ? updatedFee : f)));
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === updatedFee.studentId || s.rollNo === updatedFee.studentRollNo) {
          return {
            ...s,
            feePaid: paid,
            feeAmount: total,
            feeStatus: status as any,
          };
        }
        return s;
      })
    );

    setEditingFee(null);
    showToast(`Fee ledger updated for ${updatedFee.studentName}!`);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/fees/${updatedFee.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updatedFee),
      });
    } catch (err) {
      console.warn('Fee sync error:', err);
    }
  };

  // TOGGLE FEE STATUS (Click on Paid / Pending / Overdue in Fee Ledger)
  const handleToggleFeeStatus = async (fee: FeeRecord) => {
    const isCurrentlyPaid = fee.status === 'Paid';
    const newStatus = isCurrentlyPaid ? 'Pending' : 'Paid';
    const newPaidAmount = isCurrentlyPaid ? 0 : fee.totalAmount;
    const newBalance = isCurrentlyPaid ? fee.totalAmount : 0;

    const updatedFee: FeeRecord = {
      ...fee,
      status: newStatus,
      paidAmount: newPaidAmount,
      balance: newBalance,
      lastPaymentDate: !isCurrentlyPaid ? new Date().toISOString().split('T')[0] : fee.lastPaymentDate,
    };

    setFees((prev) => prev.map((f) => (f.id === fee.id ? updatedFee : f)));
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === fee.studentId || s.rollNo === fee.studentRollNo) {
          return {
            ...s,
            feeStatus: newStatus as any,
            feePaid: newPaidAmount,
          };
        }
        return s;
      })
    );

    showToast(`${fee.studentName}'s fee marked as ${newStatus}!`);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/fees/${fee.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          paidAmount: newPaidAmount,
          status: newStatus,
        }),
      });
    } catch (err) {
      console.warn('Toggle fee status sync error:', err);
    }
  };

  // TOGGLE STUDENT FEE STATUS (Click on Paid / Pending in Student Lists)
  const handleToggleStudentFeeStatus = async (student: StudentRecord) => {
    const isCurrentlyPaid = student.feeStatus === 'Paid';
    const newStatus = isCurrentlyPaid ? 'Pending' : 'Paid';
    const newPaidAmount = isCurrentlyPaid ? 0 : student.feeAmount;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id
          ? {
              ...s,
              feeStatus: newStatus as any,
              feePaid: newPaidAmount,
            }
          : s
      )
    );

    setFees((prev) =>
      prev.map((f) => {
        if (f.studentId === student.id || f.studentRollNo === student.rollNo) {
          return {
            ...f,
            status: newStatus as any,
            paidAmount: newPaidAmount,
            balance: isCurrentlyPaid ? student.feeAmount : 0,
          };
        }
        return f;
      })
    );

    showToast(`${student.fullName}'s fee marked as ${newStatus}!`);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          feeStatus: newStatus,
          feePaid: newPaidAmount,
        }),
      });
    } catch (err) {
      console.warn('Toggle student fee status sync error:', err);
    }
  };

  // QUICK MARK FEE AS PAID
  const handleQuickMarkPaid = async (fee: FeeRecord) => {
    handleToggleFeeStatus({ ...fee, status: 'Pending' });
  };

  // SAVE INSTALLMENTS SCHEDULE
  const handleSaveInstallments = async (
    feeId: string,
    updatedPaidAmount: number,
    updatedStatus: 'Paid' | 'Partial' | 'Unpaid'
  ) => {
    const existing = fees.find((f) => f.id === feeId);
    if (!existing) return;

    const newBalance = Math.max(0, existing.totalAmount - updatedPaidAmount);
    const updatedFee: FeeRecord = {
      ...existing,
      paidAmount: updatedPaidAmount,
      balance: newBalance,
      status: updatedStatus,
    };

    // Optimistic local state update
    setFees((prev) => prev.map((f) => (f.id === feeId ? updatedFee : f)));
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === existing.studentId || s.rollNo === existing.studentRollNo) {
          return {
            ...s,
            feePaid: updatedPaidAmount,
            feeStatus: updatedStatus,
          };
        }
        return s;
      })
    );

    showToast(`Installment plan applied! Updated paid: $${updatedPaidAmount}`);

    // Persist to backend
    try {
      await fetch(`/api/fees/${feeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFee),
      });
    } catch (e) {
      console.error('Error persisting installment update', e);
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
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${key} payload to clipboard!`);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2500);
  };

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
                      <button
                        type="button"
                        onClick={() => handleToggleStudentFeeStatus(s)}
                        title="Click to toggle fee status"
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold cursor-pointer active:scale-95 transition-transform ${getStatusBadge(s.feeStatus)}`}
                      >
                        {s.feeStatus}
                      </button>
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
                    <button
                      type="button"
                      onClick={() => handleToggleStudentFeeStatus(s)}
                      title="Click to toggle Paid / Pending"
                      className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold shrink-0 cursor-pointer active:scale-95 transition-transform ${getStatusBadge(s.feeStatus)}`}
                    >
                      {s.feeStatus}
                    </button>
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
                        <button
                          type="button"
                          onClick={() => handleToggleStudentFeeStatus(s)}
                          title="Click to toggle Paid / Pending"
                          className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold cursor-pointer active:scale-95 hover:opacity-80 transition-all ${getStatusBadge(s.feeStatus)}`}
                        >
                          {s.feeStatus}
                        </button>
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
                    <button
                      type="button"
                      onClick={() => handleToggleFeeStatus(f)}
                      title="Click to toggle Paid / Pending"
                      className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold shrink-0 cursor-pointer active:scale-95 transition-transform ${getStatusBadge(f.status)}`}
                    >
                      {f.status}
                    </button>
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
                      <button
                        type="button"
                        onClick={() => {
                          setChallanFee(f);
                          setShowChallanModal(true);
                        }}
                        className="p-1.5 text-indigo-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-colors"
                        title="Print 3-Part Fee Challan"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInstallmentFee(f);
                          setShowInstallmentModal(true);
                        }}
                        className="p-1.5 text-sky-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-colors"
                        title="Installment Schedule"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReminderFee(f);
                          setShowReminderModal(true);
                        }}
                        className="p-1.5 text-emerald-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-colors"
                        title="Send Reminder"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
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
                        <button
                          type="button"
                          onClick={() => handleToggleFeeStatus(f)}
                          title="Click to toggle Paid / Pending"
                          className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold cursor-pointer active:scale-95 hover:opacity-80 transition-all ${getStatusBadge(f.status)}`}
                        >
                          {f.status}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">{f.dueDate}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setChallanFee(f);
                              setShowChallanModal(true);
                            }}
                            className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Print Official 3-Part Fee Challan / Voucher"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setInstallmentFee(f);
                              setShowInstallmentModal(true);
                            }}
                            className="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Fee Installment Plan & Milestones"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReminderFee(f);
                              setShowReminderModal(true);
                            }}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Send 1-Click WhatsApp / Email Reminder"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
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
      {/* TAB 6: DEBUG STATE & DATA FLOW INSPECTOR */}
      {/* ======================================================== */}
      {activeTab === 'debug' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Terminal className="w-4 h-4" />
                </div>
                <h1 className="text-base sm:text-lg font-extrabold text-white">
                  Local State &amp; Data Flow Inspector
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold">
                  Internal Debugger
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Inspect local in-memory records, state synchronization, and schema readiness before syncing to Notion.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={fetchAllData}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Reload from API store"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Re-fetch State</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify({ students, counselors, fees, settings }, null, 2),
                    'Full Portal State'
                  )
                }
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-600/20"
              >
                {copiedKey === 'Full Portal State' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy Full JSON</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setDebugView('students')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                debugView === 'students'
                  ? 'bg-slate-800/90 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students State</span>
                <GraduationCap className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xl font-bold font-mono text-white mt-1">{students.length}</p>
              <span className="text-[10px] text-slate-500 block mt-0.5">Records in active memory</span>
            </button>

            <button
              type="button"
              onClick={() => setDebugView('counselors')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                debugView === 'counselors'
                  ? 'bg-slate-800/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Counselors State</span>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-bold font-mono text-white mt-1">{counselors.length}</p>
              <span className="text-[10px] text-slate-500 block mt-0.5">Active counseling advisors</span>
            </button>

            <button
              type="button"
              onClick={() => setDebugView('fees')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                debugView === 'fees'
                  ? 'bg-slate-800/90 border-sky-500/50 shadow-md ring-1 ring-sky-500/30'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fee Ledger State</span>
                <CreditCard className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-xl font-bold font-mono text-white mt-1">{fees.length}</p>
              <span className="text-[10px] text-slate-500 block mt-0.5">Payment transaction items</span>
            </button>

            <button
              type="button"
              onClick={() => setDebugView('notion_map')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                debugView === 'notion_map'
                  ? 'bg-slate-800/90 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notion Schema</span>
                <Database className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">Ready</p>
              <span className="text-[10px] text-slate-500 block mt-0.5">4 Notion DB mappings validated</span>
            </button>
          </div>

          {/* Sub View Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800">
            <button
              type="button"
              onClick={() => setDebugView('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                debugView === 'overview'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>State Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setDebugView('students')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                debugView === 'students'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Students Payload ({students.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setDebugView('counselors')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                debugView === 'counselors'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Counselors Payload ({counselors.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setDebugView('fees')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                debugView === 'fees'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Fee Ledger Payload ({fees.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setDebugView('notion_map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                debugView === 'notion_map'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Notion Mapping Test</span>
            </button>
            <button
              type="button"
              onClick={() => setDebugView('raw_all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                debugView === 'raw_all'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Full Raw State JSON</span>
            </button>
          </div>

          {/* VIEW: OVERVIEW STATE MATRIX */}
          {debugView === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Students Summary Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-400" /> Students In Memory ({students.length})
                  </h3>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(students, null, 2), 'Students')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Roll No</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Fee Status</th>
                        <th className="px-3 py-2">Counselor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {students.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-800/40">
                          <td className="px-3 py-2 text-indigo-300 font-bold">{s.rollNo}</td>
                          <td className="px-3 py-2 text-white font-sans font-medium">{s.fullName}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] ${getStatusBadge(s.feeStatus)}`}>
                              {s.feeStatus}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-400 font-sans">{s.counselorName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Counselors Summary Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" /> Counselors In Memory ({counselors.length})
                  </h3>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(counselors, null, 2), 'Counselors')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">ID</th>
                        <th className="px-3 py-2">Counselor Name</th>
                        <th className="px-3 py-2">Assigned Cohort</th>
                        <th className="px-3 py-2">Specialization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {counselors.map((c) => {
                        const count = students.filter((s) => s.counselorId === c.id).length;
                        return (
                          <tr key={c.id} className="hover:bg-slate-800/40">
                            <td className="px-3 py-2 text-emerald-400">{c.id}</td>
                            <td className="px-3 py-2 text-white font-sans font-medium">{c.name}</td>
                            <td className="px-3 py-2 text-indigo-300 font-bold">{count} Students</td>
                            <td className="px-3 py-2 text-slate-400 font-sans">{c.specialization}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fee Ledger Summary Table */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-sky-400" /> Fee Ledger Entries In Memory ({fees.length})
                  </h3>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(fees, null, 2), 'Fee Ledger')}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">Student</th>
                        <th className="px-3 py-2">Course</th>
                        <th className="px-3 py-2">Total Amount</th>
                        <th className="px-3 py-2">Paid</th>
                        <th className="px-3 py-2">Balance</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {fees.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-800/40">
                          <td className="px-3 py-2 text-white font-sans font-medium">
                            {f.studentName}{' '}
                            <span className="text-[10px] text-slate-500 font-mono block">{f.studentRollNo}</span>
                          </td>
                          <td className="px-3 py-2 text-slate-300 font-sans">{f.course}</td>
                          <td className="px-3 py-2 text-white">${f.totalAmount}</td>
                          <td className="px-3 py-2 text-emerald-400 font-bold">${f.paidAmount}</td>
                          <td className="px-3 py-2 text-amber-400 font-bold">${f.balance}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] ${getStatusBadge(f.status)}`}>
                              {f.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-400">{f.dueDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: STUDENTS JSON */}
          {debugView === 'students' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-400" /> `students` Local State Array
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {students.length} objects with properties: <code>id, rollNo, fullName, email, course, counselorId, feeStatus, academicProgress</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(students, null, 2), 'Students')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copiedKey === 'Students' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Students JSON</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 max-h-[500px] overflow-auto">
                <pre className="text-[11px] font-mono text-emerald-300 leading-relaxed">
                  {JSON.stringify(students, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* VIEW: COUNSELORS JSON */}
          {debugView === 'counselors' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" /> `counselors` Local State Array
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {counselors.length} advisors with properties: <code>id, name, email, phone, specialization, assignedStudentIds</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(counselors, null, 2), 'Counselors')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copiedKey === 'Counselors' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Counselors JSON</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 max-h-[500px] overflow-auto">
                <pre className="text-[11px] font-mono text-sky-300 leading-relaxed">
                  {JSON.stringify(counselors, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* VIEW: FEES JSON */}
          {debugView === 'fees' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-sky-400" /> `fees` Local State Array
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {fees.length} ledger records with properties: <code>id, studentId, studentRollNo, studentName, totalAmount, paidAmount, balance, status, dueDate</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(fees, null, 2), 'Fee Ledger')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copiedKey === 'Fee Ledger' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Fee Ledger JSON</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 max-h-[500px] overflow-auto">
                <pre className="text-[11px] font-mono text-indigo-300 leading-relaxed">
                  {JSON.stringify(fees, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* VIEW: NOTION SCHEMA MAPPING TEST */}
          {debugView === 'notion_map' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-400" /> Notion Database 2-Way Property Schema Mapping
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verified property name translations between local JSON states and Notion Database columns.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onOpenNotionModal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Configure Notion API</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Notion DB 1: Students */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" /> 1. Students Database
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                      Mapped (7 Fields)
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>fullName</span>
                      <span className="text-emerald-400">→ Name (title)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>rollNo</span>
                      <span className="text-emerald-400">→ Roll Number (rich_text)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>course</span>
                      <span className="text-emerald-400">→ Course (select)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>counselorId</span>
                      <span className="text-emerald-400">→ Counselor (relation)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>feeStatus</span>
                      <span className="text-emerald-400">→ Fee Status (select)</span>
                    </div>
                  </div>
                </div>

                {/* Notion DB 2: Counselors */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4" /> 2. Counselors Database
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                      Mapped (5 Fields)
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>name</span>
                      <span className="text-emerald-400">→ Counselor Name (title)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>email</span>
                      <span className="text-emerald-400">→ Email Address (email)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>specialization</span>
                      <span className="text-emerald-400">→ Track (select)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>phone</span>
                      <span className="text-emerald-400">→ Phone (phone_number)</span>
                    </div>
                  </div>
                </div>

                {/* Notion DB 3: Fee Ledger */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" /> 3. Fee Ledger Database
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                      Mapped (6 Fields)
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>studentName</span>
                      <span className="text-emerald-400">→ Student (relation/title)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>totalAmount</span>
                      <span className="text-emerald-400">→ Total Fee (number)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>paidAmount</span>
                      <span className="text-emerald-400">→ Paid to Date (number)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>status</span>
                      <span className="text-emerald-400">→ Payment Status (select)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>dueDate</span>
                      <span className="text-emerald-400">→ Due Date (date)</span>
                    </div>
                  </div>
                </div>

                {/* Notion DB 4: Counseling Notes */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4" /> 4. Counseling Sessions DB
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                      Mapped (4 Fields)
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>note</span>
                      <span className="text-emerald-400">→ Session Notes (rich_text)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>authorName</span>
                      <span className="text-emerald-400">→ Counselor (select)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900/80 rounded-lg text-slate-300">
                      <span>date</span>
                      <span className="text-emerald-400">→ Session Date (date)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: RAW ALL STATE JSON */}
          {debugView === 'raw_all' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-amber-400" /> Complete Unified Portal State
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Composite dump of all 4 in-memory data stores for synchronization verification.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      JSON.stringify({ students, counselors, fees, settings }, null, 2),
                      'Unified State'
                    )
                  }
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-amber-600/20"
                >
                  {copiedKey === 'Unified State' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Complete JSON</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 max-h-[550px] overflow-auto">
                <pre className="text-[11px] font-mono text-amber-300 leading-relaxed">
                  {JSON.stringify({ students, counselors, fees, settings }, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
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

      {/* ======================================================== */}
      {/* BILLING ENHANCEMENT MODALS */}
      {/* ======================================================== */}
      {/* 1. Official 3-Part Fee Challan / Voucher Modal */}
      <FeeChallanModal
        isOpen={showChallanModal}
        onClose={() => {
          setShowChallanModal(false);
          setChallanFee(null);
        }}
        fee={challanFee}
        student={students.find((s) => s.id === challanFee?.studentId || s.rollNo === challanFee?.studentRollNo)}
        settings={settings}
      />

      {/* 2. 1-Click WhatsApp & Email Fee Reminder Modal */}
      <FeeReminderModal
        isOpen={showReminderModal}
        onClose={() => {
          setShowReminderModal(false);
          setReminderFee(null);
        }}
        fee={reminderFee}
        student={students.find((s) => s.id === reminderFee?.studentId || s.rollNo === reminderFee?.studentRollNo)}
        settings={settings}
      />

      {/* 3. Fee Installments Scheduling & Milestones Modal */}
      <InstallmentPlanModal
        isOpen={showInstallmentModal}
        onClose={() => {
          setShowInstallmentModal(false);
          setInstallmentFee(null);
        }}
        fee={installmentFee}
        student={students.find((s) => s.id === installmentFee?.studentId || s.rollNo === installmentFee?.studentRollNo)}
        settings={settings}
        onSaveInstallments={handleSaveInstallments}
      />
    </div>
  );
};
