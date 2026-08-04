import React, { useState } from 'react';
import { StudentRecord, User } from '../types';
import { 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  BookOpen, 
  DollarSign, 
  Download, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  FileText,
  Printer
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
  studentRecord?: StudentRecord;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  studentRecord,
}) => {
  const [showReceipt, setShowReceipt] = useState(false);

  if (!studentRecord) {
    return (
      <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
        <GraduationCap className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
        <h2 className="text-xl font-bold text-white">Student Profile Link Pending</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          No matching student roll number was linked to email <span className="text-indigo-400 font-mono">{currentUser.email}</span>. Switch to another student account from the top right role switcher to test Level 3 privacy!
        </p>
      </div>
    );
  }

  const feeRemaining = studentRecord.feeAmount - studentRecord.feePaid;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Student Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
                <GraduationCap className="w-3.5 h-3.5" /> Level 3 Student Private Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome, {studentRecord.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                <span>Roll No: <strong className="text-indigo-300 font-mono">{studentRecord.rollNo}</strong></span>
                <span>•</span>
                <span>Course: <strong className="text-slate-100">{studentRecord.course}</strong></span>
              </div>
            </div>
          </div>

          {/* Privacy Level Badge */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Personal Data Sandbox</div>
              <div className="text-[11px] text-slate-400">
                You can only see <span className="font-bold text-amber-400">your own personal fee records and course notes</span>.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Fee Status Card + Counselor Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tuition Fee Financial Summary (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Tuition Fee Account Overview
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Your official financial records synced from Notion</p>
            </div>

            {studentRecord.feeStatus === 'Paid' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" /> Account Cleared
              </span>
            )}
            {studentRecord.feeStatus === 'Pending' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="w-4 h-4" /> Installment Pending
              </span>
            )}
            {studentRecord.feeStatus === 'Overdue' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-4 h-4" /> Payment Overdue
              </span>
            )}
          </div>

          {/* Money Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Course Fee</span>
              <div className="text-2xl font-extrabold text-white mt-1">${studentRecord.feeAmount}</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Paid Amount</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">${studentRecord.feePaid}</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Balance Due</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">${feeRemaining}</div>
              <div className="text-[10px] text-slate-500 mt-1">Due Date: {studentRecord.dueDate}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Payment Completion</span>
              <span className="text-emerald-400">
                {Math.round((studentRecord.feePaid / studentRecord.feeAmount) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(studentRecord.feePaid / studentRecord.feeAmount) * 100}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setShowReceipt(!showReceipt)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>{showReceipt ? 'Hide Receipt' : 'Generate Official Fee Receipt'}</span>
            </button>
          </div>

          {/* Fee Receipt Drawer */}
          {showReceipt && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs text-slate-300 shadow-inner">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">TUITION FEE OFFICIAL RECEIPT</h3>
                  <p className="text-[10px] text-slate-500">Receipt No: REC-{studentRecord.rollNo}-2026</p>
                </div>
                <span className="text-emerald-400 font-bold border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-500/10">
                  VERIFIED NOTION RECORD
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Student: <strong className="text-white">{studentRecord.fullName}</strong></div>
                <div>Roll No: <strong className="text-white">{studentRecord.rollNo}</strong></div>
                <div>Course: <strong className="text-white">{studentRecord.course}</strong></div>
                <div>Counselor: <strong className="text-white">{studentRecord.counselorName}</strong></div>
                <div>Total Fee: <strong className="text-white">${studentRecord.feeAmount}</strong></div>
                <div>Amount Paid: <strong className="text-emerald-400">${studentRecord.feePaid}</strong></div>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800 flex justify-between">
                <span>Issued by Role-Based Portal Gateway</span>
                <span>Date: {new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>
          )}

        </div>

        {/* Assigned Counselor Contact Card (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            My Assigned Counselor
          </h2>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xl">
              {studentRecord.counselorName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">{studentRecord.counselorName}</h3>
              <p className="text-xs text-indigo-400 mt-0.5">Academic Adviser & Guide</p>
            </div>

            <div className="pt-2 space-y-2 text-xs text-slate-400 text-left border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">counselor@school.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Office Hours: Mon - Fri (10 AM - 4 PM)</span>
              </div>
            </div>
          </div>

          {/* Academic Stats */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Course Attendance</span>
              <span className="font-bold text-emerald-400">{studentRecord.attendancePercentage}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Academic Score</span>
              <span className="font-bold text-indigo-400">{studentRecord.academicProgress}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Counseling Feedback Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          Counselor Advisory & Feedback Log
        </h2>
        <p className="text-xs text-slate-400">
          Personal notes recorded by <span className="text-indigo-300 font-semibold">{studentRecord.counselorName}</span> regarding your academic journey and fee payment updates.
        </p>

        <div className="space-y-3 pt-2">
          {studentRecord.counselorNotes.length === 0 ? (
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
              No personal counseling notes logged yet.
            </div>
          ) : (
            studentRecord.counselorNotes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-300">{note.authorName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{note.date}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{note.note}</p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
