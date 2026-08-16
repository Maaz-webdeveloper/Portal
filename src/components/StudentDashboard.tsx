import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { StudentRecord, FeeRecord } from '../types';
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
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [studentData, setStudentData] = useState<StudentRecord | null>(null);
  const [feeRecord, setFeeRecord] = useState<FeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [receiptDownloaded, setReceiptDownloaded] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Fetch Student details (Filtered strictly by JWT on backend)
      const res = await fetch('/api/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.students && data.students.length > 0) {
        setStudentData(data.students[0]);
      }

      // 2. Fetch Fee details (Filtered strictly by JWT on backend)
      const feeRes = await fetch('/api/fees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const feeData = await feeRes.json();
      if (feeData.fees && feeData.fees.length > 0) {
        setFeeRecord(feeData.fees[0]);
      }
    } catch (e) {
      console.error('Error fetching student data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    setReceiptDownloaded(true);
    setTimeout(() => setReceiptDownloaded(false), 3000);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Fetching verified student profile...</p>
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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Overdue':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Student Welcome Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xl">
            {studentData.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{studentData.fullName}</h1>
              <span className="text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-mono">
                {studentData.rollNo}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>{studentData.course}</span>
              <span>•</span>
              <span>Enrolled: {studentData.enrollmentDate}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-300">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Privacy Scope</span>
            <span className="text-emerald-400 font-medium">Single Student Record Enforced</span>
          </div>
        </div>
      </div>

      {/* Grid of Key Info (Course Progress, Fees, Counselor) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Academic & Attendance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" /> Academic Progress
              </h2>
              <span className="text-xs font-mono text-indigo-400 font-bold">{studentData.academicProgress}%</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Syllabus Completion</span>
                  <span>{studentData.academicProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${studentData.academicProgress}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Class Attendance</span>
                  <span className="text-emerald-400 font-semibold">{studentData.attendancePercentage}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
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
              <Award className="w-4 h-4 text-amber-400" /> Active Student Status
            </span>
            <span className="text-emerald-400 font-medium">Good Standing</span>
          </div>
        </div>

        {/* Card 2: Tuition & Fee Ledger */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> Tuition &amp; Fee Status
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusBadge(studentData.feeStatus)}`}>
                {studentData.feeStatus}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Program Fee:</span>
                <span className="font-mono text-white font-semibold">${studentData.feeAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Paid to Date:</span>
                <span className="font-mono text-emerald-400 font-semibold">${studentData.feePaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-300 font-medium">Remaining Balance:</span>
                <span className="font-mono text-amber-400 font-bold">
                  ${(studentData.feeAmount - studentData.feePaid).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Due: {studentData.dueDate}
            </div>
            <button
              onClick={handleDownloadReceipt}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              {receiptDownloaded ? 'Receipt Saved' : 'Voucher'}
            </button>
          </div>
        </div>

        {/* Card 3: Assigned Counselor Contact */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-sky-400" /> Assigned Academic Counselor
              </h2>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Faculty</span>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <div>
                <p className="font-semibold text-white text-sm">{studentData.counselorName}</p>
                <p className="text-xs text-slate-400">Department of Student Affairs</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> counselor@school.edu
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Office Hours: 09:00 - 16:00 PKT
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Counselor notes are private to you &amp; faculty
          </div>
        </div>
      </div>

      {/* Counselor Feedback & Progress Notes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="font-semibold text-white text-sm flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-indigo-400" /> Counselor Feedback &amp; Session Notes
        </h2>

        {studentData.counselorNotes.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 italic">No counselor notes recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {studentData.counselorNotes.map((note) => (
              <div key={note.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-indigo-300">{note.authorName}</span>
                  <span className="text-slate-500">{note.date}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{note.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
