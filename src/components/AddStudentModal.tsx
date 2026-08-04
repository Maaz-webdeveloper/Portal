import React, { useState } from 'react';
import { CounselorRecord, StudentRecord } from '../types';
import { X, UserPlus, CheckCircle2, RefreshCw } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  counselors: CounselorRecord[];
  onAddStudent: (newStudent: Omit<StudentRecord, 'id' | 'lastSyncedAt'>) => Promise<void>;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  counselors,
  onAddStudent,
}) => {
  const [fullName, setFullName] = useState('');
  const [rollNo, setRollNo] = useState(`STU-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+92 300 ');
  const [course, setCourse] = useState('Full Stack Web Development');
  const [counselorId, setCounselorId] = useState(counselors[0]?.id || 'counselor-1');
  const [feeStatus, setFeeStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Pending');
  const [feeAmount, setFeeAmount] = useState('1200');
  const [feePaid, setFeePaid] = useState('400');
  const [dueDate, setDueDate] = useState('2026-08-30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const assignedCounselor = counselors.find((c) => c.id === counselorId);

    try {
      await onAddStudent({
        rollNo,
        fullName,
        email,
        phone,
        course,
        counselorId,
        counselorName: assignedCounselor?.name || 'Sarah Khan',
        feeStatus,
        feeAmount: parseFloat(feeAmount) || 0,
        feePaid: parseFloat(feePaid) || 0,
        dueDate,
        enrollmentDate: new Date().toISOString().split('T')[0],
        counselorNotes: [],
        academicProgress: 50,
        attendancePercentage: 100,
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Enroll New Student</h3>
              <p className="text-xs text-slate-400">Record will sync to local database & Notion table</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Student Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Hassan Raza"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Roll Number *</label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hassan@school.edu"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Course Track</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Full Stack Web Development">Full Stack Web Development</option>
                <option value="UI/UX Design Systems">UI/UX Design Systems</option>
                <option value="Data Science & Machine Learning">Data Science & Machine Learning</option>
                <option value="Cyber Security Essentials">Cyber Security Essentials</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Assign Counselor *</label>
              <select
                value={counselorId}
                onChange={(e) => setCounselorId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                {counselors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-slate-800 pt-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Total Fee ($)</label>
              <input
                type="number"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Fee Paid ($)</label>
              <input
                type="number"
                value={feePaid}
                onChange={(e) => setFeePaid(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Fee Status</label>
              <select
                value={feeStatus}
                onChange={(e) => setFeeStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
            >
              {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Enroll Student
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
