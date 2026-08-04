import React, { useState } from 'react';
import { StudentRecord, CounselorRecord, User } from '../types';
import { 
  Users, 
  UserCheck, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  ShieldCheck, 
  Lock, 
  FileText,
  Send,
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';

interface CounselorDashboardProps {
  currentUser: User;
  students: StudentRecord[];
  counselorInfo?: CounselorRecord;
  onAddNote: (studentId: string, noteText: string) => void;
  onUpdateFee: (studentId: string, status: 'Paid' | 'Pending' | 'Overdue', paidAmount: number) => void;
  onSelectStudentDetail: (student: StudentRecord) => void;
}

export const CounselorDashboard: React.FC<CounselorDashboardProps> = ({
  currentUser,
  students,
  counselorInfo,
  onAddNote,
  onUpdateFee,
  onSelectStudentDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<StudentRecord | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // PRIVACY FILTER ENFORCEMENT:
  // Strictly filter for students assigned to THIS counselor
  const assignedStudents = students.filter(
    (s) => s.counselorId === currentUser.counselorId
  );

  const filteredStudents = assignedStudents.filter((s) =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForNote || !newNoteText.trim()) return;
    onAddNote(selectedStudentForNote.id, newNoteText.trim());
    setNewNoteText('');
    setSelectedStudentForNote(null);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
                <UserCheck className="w-3.5 h-3.5" /> Level 2 Counselor Scope
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome, {currentUser.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Specialization: <span className="font-semibold text-indigo-300">{counselorInfo?.specialization || 'Academic Counselor'}</span>
              </p>
            </div>
          </div>

          {/* Privacy Scope Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Scoped Privacy Mode</div>
              <div className="text-[11px] text-slate-400">
                You can only view & manage your <span className="font-bold text-indigo-400">{assignedStudents.length} assigned students</span>.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar for Counselor */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-semibold text-slate-400 uppercase">Assigned Group</div>
          <div className="text-2xl font-extrabold text-white mt-2">{assignedStudents.length} Students</div>
          <p className="text-xs text-slate-500 mt-1">Under your direct academic supervision</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-semibold text-slate-400 uppercase">Average Academic Progress</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">
            {assignedStudents.length > 0
              ? Math.round(
                  assignedStudents.reduce((acc, s) => acc + s.academicProgress, 0) / assignedStudents.length
                )
              : 0}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Class average grade performance</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs font-semibold text-slate-400 uppercase">Fee Clearance Rate</div>
          <div className="text-2xl font-extrabold text-indigo-400 mt-2">
            {assignedStudents.filter((s) => s.feeStatus === 'Paid').length} / {assignedStudents.length} Paid
          </div>
          <p className="text-xs text-slate-500 mt-1">Cleared tuition records</p>
        </div>
      </div>

      {/* Assigned Students List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              My Assigned Students ({filteredStudents.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly filtered for counselor privacy. Other counselors' students are hidden.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter my students..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Student Cards Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs">
              No students found in your assigned group.
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 hover:border-slate-600 transition space-y-4"
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-base">
                      {student.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        {student.fullName}
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
                          {student.rollNo}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{student.course}</div>
                    </div>
                  </div>

                  {/* Fee Pill */}
                  {student.feeStatus === 'Paid' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Paid
                    </span>
                  )}
                  {student.feeStatus === 'Pending' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Pending
                    </span>
                  )}
                  {student.feeStatus === 'Overdue' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      Overdue
                    </span>
                  )}
                </div>

                {/* Progress Bar & Stats */}
                <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="font-medium">Academic Progress</span>
                    <span className="font-bold text-indigo-400">{student.academicProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${student.academicProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Attendance: <strong className="text-slate-200">{student.attendancePercentage}%</strong></span>
                    <span>Fee Balance: <strong className="text-slate-200">${student.feeAmount - student.feePaid}</strong></span>
                  </div>
                </div>

                {/* Recent Counselor Notes */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Counselor Notes ({student.counselorNotes.length})</span>
                  </div>

                  {student.counselorNotes.length > 0 ? (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                      <p className="italic text-slate-300">"{student.counselorNotes[0].note}"</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">
                        — {student.counselorNotes[0].authorName}, {student.counselorNotes[0].date}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No notes added yet.</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
                  <button
                    onClick={() => setSelectedStudentForNote(student)}
                    className="flex-1 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Add Counseling Note
                  </button>

                  <button
                    onClick={() => onSelectStudentDetail(student)}
                    className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    View Details
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for Adding Counselor Note */}
      {selectedStudentForNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                Add Counselor Note for {selectedStudentForNote.fullName}
              </h3>
              <button
                onClick={() => setSelectedStudentForNote(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Counseling Feedback / Advisory Note
                </label>
                <textarea
                  rows={4}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Record academic feedback, course guidance, or fee installment advisory..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForNote(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
