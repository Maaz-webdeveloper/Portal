import React, { useState } from 'react';
import { StudentRecord, CounselorRecord } from '../types';
import { 
  X, 
  GraduationCap, 
  DollarSign, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  UserCheck, 
  BookOpen, 
  Plus, 
  Send 
} from 'lucide-react';

interface StudentDetailModalProps {
  student: StudentRecord | null;
  onClose: () => void;
  counselors: CounselorRecord[];
  onAddNote: (studentId: string, noteText: string) => void;
  onUpdateFeeStatus: (studentId: string, status: 'Paid' | 'Pending' | 'Overdue', paidAmount: number) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  counselors,
  onAddNote,
  onUpdateFeeStatus,
}) => {
  const [newNote, setNewNote] = useState('');
  const [feeStatusInput, setFeeStatusInput] = useState<'Paid' | 'Pending' | 'Overdue'>(
    student?.feeStatus || 'Pending'
  );
  const [feePaidInput, setFeePaidInput] = useState(student?.feePaid?.toString() || '0');

  if (!student) return null;

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(student.id, newNote.trim());
    setNewNote('');
  };

  const handleFeeUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFeeStatus(student.id, feeStatusInput, parseFloat(feePaidInput) || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 space-y-6">
        
        {/* Header Banner */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xl">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">{student.fullName}</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {student.rollNo}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{student.course} • Enrolled {student.enrollmentDate}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Fee Status</span>
              <span className="font-bold text-emerald-400 mt-1 block">{student.feeStatus}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Paid / Total</span>
              <span className="font-bold text-white mt-1 block">${student.feePaid} / ${student.feeAmount}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Counselor</span>
              <span className="font-bold text-indigo-300 mt-1 block truncate">{student.counselorName}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Progress / Attend</span>
              <span className="font-bold text-slate-200 mt-1 block">{student.academicProgress}% / {student.attendancePercentage}%</span>
            </div>
          </div>

          {/* Quick Update Fee Status Form */}
          <form onSubmit={handleFeeUpdate} className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Update Financial & Payment Status
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Fee Status</label>
                <select
                  value={feeStatusInput}
                  onChange={(e) => setFeeStatusInput(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Fee Paid Amount ($)</label>
                <input
                  type="number"
                  value={feePaidInput}
                  onChange={(e) => setFeePaidInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                >
                  Save Fee Changes
                </button>
              </div>
            </div>
          </form>

          {/* Counselor Notes Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Counselor Advisory History ({student.counselorNotes.length})
            </h4>

            <form onSubmit={handleNoteSubmit} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a counselor observation note..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                Add
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {student.counselorNotes.map((n) => (
                <div key={n.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-xs text-slate-300">
                  <div className="flex justify-between font-semibold text-indigo-300 text-[11px] mb-1">
                    <span>{n.authorName}</span>
                    <span className="text-slate-500 font-mono">{n.date}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{n.note}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
