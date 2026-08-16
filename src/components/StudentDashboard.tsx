import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentRecord, FeeRecord, CollegeApplication, EssayReview, MentorSession, SystemSettings } from '../types';
import { INITIAL_STUDENTS, INITIAL_FEES } from '../data/mockData';
import {
  GraduationCap,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  BookOpen,
  Award,
  Download,
  ShieldAlert,
  ArrowLeft,
  Shield,
  Printer,
  Globe,
  FileCheck,
  Video,
  Plus,
  Send,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { FeeChallanModal } from './FeeChallanModal';
import { InstallmentPlanModal } from './InstallmentPlanModal';

export const StudentDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [studentData, setStudentData] = useState<StudentRecord | null>(null);
  const [feeRecord, setFeeRecord] = useState<FeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'essays' | 'sessions' | 'fees'>('overview');
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);

  // New application form state
  const [newUni, setNewUni] = useState('');
  const [newCountry, setNewCountry] = useState('US');
  const [newTier, setNewTier] = useState<'Reach' | 'Target' | 'Safety'>('Target');
  const [newMajor, setNewMajor] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  // New essay draft state
  const [newEssayTitle, setNewEssayTitle] = useState('');
  const [newEssayType, setNewEssayType] = useState<EssayReview['type']>('Supplemental Essay');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const [stuRes, feeRes] = await Promise.allSettled([
        fetch('/api/students', { headers }),
        fetch('/api/fees', { headers }),
      ]);

      let foundStudent: StudentRecord | null = null;
      let foundFee: FeeRecord | null = null;

      if (stuRes.status === 'fulfilled' && stuRes.value.ok) {
        const data = await stuRes.value.json();
        if (data.students && data.students.length > 0) {
          foundStudent = data.students[0];
        }
      }

      if (feeRes.status === 'fulfilled' && feeRes.value.ok) {
        const feeData = await feeRes.value.json();
        if (feeData.fees && feeData.fees.length > 0) {
          foundFee = feeData.fees[0];
        }
      }

      if (!foundStudent) {
        const fallback =
          INITIAL_STUDENTS.find(
            (s) =>
              (user?.studentRollNo && s.rollNo === user.studentRollNo) ||
              (user?.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
              (user?.linkedProfileId && s.id === user.linkedProfileId)
          ) || INITIAL_STUDENTS[0];
        foundStudent = fallback;
      }

      if (!foundFee && foundStudent) {
        foundFee = INITIAL_FEES.find((f) => f.studentId === foundStudent!.id) || INITIAL_FEES[0];
      }

      // Ensure default arrays
      if (foundStudent && !foundStudent.applications) {
        foundStudent.applications = [
          { id: 'app-1', universityName: 'Stanford University', country: 'US', tier: 'Reach', major: 'Computer Science', status: 'Drafting Essays', deadline: '2026-11-01' }
        ];
      }
      if (foundStudent && !foundStudent.essays) {
        foundStudent.essays = [
          { id: 'essay-1', title: 'Common App Personal Statement', type: 'Personal Statement (Common App)', status: 'In Review', lastUpdated: '2026-08-10', counselorFeedback: 'Great opening narrative!' }
        ];
      }
      if (foundStudent && !foundStudent.sessions) {
        foundStudent.sessions = [
          { id: 'sess-1', topic: 'Ivy League Strategy & Extracurricular Review', counselorName: foundStudent.counselorName, date: '2026-08-20', time: '04:00 PM', status: 'Scheduled', meetingLink: 'https://meet.google.com/pine-strategy-meet' }
        ];
      }

      setStudentData(foundStudent);
      setFeeRecord(foundFee);
    } catch (e) {
      console.warn('Network issue fetching student data, using local fallback:', e);
      const fallback =
        INITIAL_STUDENTS.find(
          (s) =>
            (user?.studentRollNo && s.rollNo === user.studentRollNo) ||
            (user?.email && s.email.toLowerCase() === user.email.toLowerCase())
        ) || INITIAL_STUDENTS[0];
      setStudentData(fallback);
      setFeeRecord(INITIAL_FEES.find((f) => f.studentId === fallback.id) || INITIAL_FEES[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUni || !studentData) return;
    const newApp: CollegeApplication = {
      id: `app-${Date.now()}`,
      universityName: newUni,
      country: newCountry,
      tier: newTier,
      major: newMajor || 'Undeclared',
      status: 'Planning',
      deadline: newDeadline || '2026-12-01',
    };
    const updatedApps = [...(studentData.applications || []), newApp];
    setStudentData({ ...studentData, applications: updatedApps });
    setNewUni('');
    setNewMajor('');
    setNewDeadline('');
    showToast('University application added successfully!');
  };

  const handleAddEssay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEssayTitle || !studentData) return;
    const newEssay: EssayReview = {
      id: `essay-${Date.now()}`,
      title: newEssayTitle,
      type: newEssayType,
      status: 'Drafting',
      lastUpdated: new Date().toISOString().split('T')[0],
      counselorFeedback: 'Draft submitted. Awaiting mentor review.',
    };
    const updatedEssays = [...(studentData.essays || []), newEssay];
    setStudentData({ ...studentData, essays: updatedEssays });
    setNewEssayTitle('');
    showToast('Essay draft uploaded for counselor review!');
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading Pine Admissions Portal...</p>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white">Student Record Not Found</h3>
        <p className="text-sm text-slate-400 mt-2">
          No linked record was found for roll number <strong>{user?.studentRollNo || user?.email}</strong>.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Approved':
      case 'Accepted':
      case 'Submitted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Pending':
      case 'In Review':
      case 'Drafting Essays':
      case 'Drafting':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Overdue':
      case 'Revision Needed':
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const settings: SystemSettings = {
    portalName: 'Pine Admissions Portal',
    institutionName: 'Pine Admissions & College Consulting',
    academicTerm: 'Fall 2026 / 2027 Intake',
    supportEmail: 'admissions@pineadmissions.com',
    currencySymbol: '$',
    availableCourses: ['Ivy League & US Top 20 Admissions'],
    allowStudentFeeDownload: true,
    lastUpdated: new Date().toISOString(),
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}



      {/* Student Welcome Hero Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-2xl shadow-inner">
            {studentData.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">{studentData.fullName}</h1>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold">
                {studentData.rollNo}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-2 flex-wrap font-medium">
              <span className="text-emerald-300 font-semibold">{studentData.course}</span>
              <span>•</span>
              <span>Counselor: <strong className="text-white">{studentData.counselorName}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Consulting Package</span>
            <span className="text-emerald-400 font-bold text-xs">Active Scholar • Premium</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Overview &amp; Progress</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'applications'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>College Applications ({studentData.applications?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('essays')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'essays'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Essay &amp; SOP Reviews ({studentData.essays?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'sessions'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Strategy Sessions ({studentData.sessions?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'fees'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Fees &amp; Invoices</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Academic & Consulting Progress */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Milestone Readiness
                  </h2>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{studentData.academicProgress}%</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Overall Application Readiness</span>
                      <span>{studentData.academicProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${studentData.academicProgress}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Strategy Session Attendance</span>
                      <span className="text-emerald-400 font-semibold">{studentData.attendancePercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${studentData.attendancePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" /> Pine Scholar Track
                </span>
                <span className="text-emerald-400 font-medium">Verified On-Track</span>
              </div>
            </div>

            {/* Tuition Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" /> Consulting Fee Status
                  </h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusBadge(studentData.feeStatus)}`}>
                    {studentData.feeStatus}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Fee:</span>
                    <span className="font-mono text-white font-semibold">${studentData.feeAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Paid to Date:</span>
                    <span className="font-mono text-emerald-400 font-semibold">${studentData.feePaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-300 font-medium">Balance Due:</span>
                    <span className="font-mono text-amber-400 font-bold">
                      ${(studentData.feeAmount - studentData.feePaid).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowChallanModal(true)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View Official Fee Voucher (3-Part)</span>
                </button>
              </div>
            </div>

            {/* Assigned Counselor */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" /> Assigned Senior Mentor
                  </h2>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">Expert</span>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="font-bold text-white text-sm">{studentData.counselorName}</p>
                    <p className="text-xs text-emerald-400 font-medium">Pine Admissions Senior Consultant</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" /> mentor@pineadmissions.com
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Availability: Mon - Fri
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Direct 1-on-1 mentorship active
              </div>
            </div>
          </div>

          {/* Counselor Notes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-emerald-400" /> Mentor Feedback &amp; Strategy Notes
            </h2>

            {studentData.counselorNotes.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 italic">No mentor notes recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {studentData.counselorNotes.map((note) => (
                  <div key={note.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-emerald-300">{note.authorName}</span>
                      <span className="text-slate-500 font-mono">{note.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{note.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: College Applications Roadmap */}
      {activeTab === 'applications' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-400" /> University Application Roadmap
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track your target universities across Reach, Target, and Safety tiers.
                </p>
              </div>
            </div>

            {/* Add Application Form */}
            <form onSubmit={handleAddApplication} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">University Name</label>
                <input
                  type="text"
                  placeholder="e.g. MIT, Oxford, LUMS"
                  value={newUni}
                  onChange={(e) => setNewUni(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Country</label>
                <select
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Europe">Europe</option>
                  <option value="Pakistan">Pakistan</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tier</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Reach">Reach</option>
                  <option value="Target">Target</option>
                  <option value="Safety">Safety</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Intended Major</label>
                <input
                  type="text"
                  placeholder="e.g. Data Science"
                  value={newMajor}
                  onChange={(e) => setNewMajor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add College</span>
                </button>
              </div>
            </form>

            {/* Applications List */}
            <div className="space-y-3">
              {studentData.applications && studentData.applications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentData.applications.map((app) => (
                    <div key={app.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">{app.universityName}</h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">{app.country}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">Major: <span className="text-slate-200">{app.major}</span></p>
                        </div>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${
                          app.tier === 'Reach' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          app.tier === 'Target' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {app.tier}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" /> Deadline: <strong className="text-white font-mono">{app.deadline}</strong>
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${getStatusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">No university applications added yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Essay & Document Reviews */}
      {activeTab === 'essays' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" /> Essay &amp; SOP Review Desk
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload and review your Common App personal statements, supplemental essays, and SOPs with your counselor.
                </p>
              </div>
            </div>

            {/* Upload Essay Form */}
            <form onSubmit={handleAddEssay} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Essay Title / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford Why Essay / Common App Draft"
                  value={newEssayTitle}
                  onChange={(e) => setNewEssayTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="w-full sm:w-64">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Document Type</label>
                <select
                  value={newEssayType}
                  onChange={(e) => setNewEssayType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Personal Statement (Common App)">Personal Statement (Common App)</option>
                  <option value="Supplemental Essay">Supplemental Essay</option>
                  <option value="SOP (Master's)">SOP (Master's)</option>
                  <option value="Resume / CV">Resume / CV</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer h-9"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit for Review</span>
              </button>
            </form>

            {/* Essays List */}
            <div className="space-y-3">
              {studentData.essays && studentData.essays.length > 0 ? (
                <div className="space-y-4">
                  {studentData.essays.map((essay) => (
                    <div key={essay.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">{essay.title}</h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">{essay.type}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono">Last Updated: {essay.lastUpdated}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusBadge(essay.status)}`}>
                          {essay.status}
                        </span>
                      </div>

                      {essay.counselorFeedback && (
                        <div className="mt-3 p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs">
                          <p className="font-bold text-emerald-400 mb-0.5">Counselor Feedback:</p>
                          <p className="text-slate-300 leading-relaxed">{essay.counselorFeedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">No essays uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Strategy Sessions */}
      {activeTab === 'sessions' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Video className="w-5 h-5 text-emerald-400" /> 1-on-1 Mentor Strategy Sessions
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Join scheduled video strategy meetings with your assigned Pine Admissions mentor.
            </p>

            <div className="space-y-3">
              {studentData.sessions && studentData.sessions.length > 0 ? (
                <div className="space-y-4">
                  {studentData.sessions.map((sess) => (
                    <div key={sess.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-white text-sm">{sess.topic}</h3>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                          <span>Mentor: <strong className="text-slate-200">{sess.counselorName}</strong></span>
                          <span>•</span>
                          <span className="font-mono text-emerald-400">{sess.date} at {sess.time}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={sess.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Video Meeting</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-8">No upcoming strategy sessions.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Fees & Invoices */}
      {activeTab === 'fees' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-emerald-400" /> Consulting Fee Ledger &amp; Invoices
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Download and print official 3-part bank fee challan vouchers.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Consulting Package Total</p>
                <p className="text-2xl font-black text-white font-mono mt-1">${studentData.feeAmount.toLocaleString()}</p>
                <p className="text-xs text-emerald-400 mt-1">Status: <strong>{studentData.feeStatus}</strong></p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowInstallmentModal(true)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Installment Plan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowChallanModal(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print 3-Part Challan Voucher</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official 3-Part Fee Challan Modal */}
      {feeRecord && (
        <FeeChallanModal
          isOpen={showChallanModal}
          onClose={() => setShowChallanModal(false)}
          fee={feeRecord}
          student={studentData}
          settings={settings}
        />
      )}

      {/* Installment Plan Modal */}
      {feeRecord && (
        <InstallmentPlanModal
          isOpen={showInstallmentModal}
          onClose={() => setShowInstallmentModal(false)}
          fee={feeRecord}
          student={studentData}
          settings={settings}
          onSaveInstallments={() => {}}
        />
      )}
    </div>
  );
};
