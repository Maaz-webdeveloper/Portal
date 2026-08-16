import React, { useState, useEffect } from 'react';
import { FeeRecord, StudentRecord, SystemSettings } from '../types';
import {
  Calendar,
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Plus,
  Trash2,
  Check,
  Sparkles,
} from 'lucide-react';

export interface InstallmentMilestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fee: FeeRecord | null;
  student?: StudentRecord | null;
  settings: SystemSettings;
  onSaveInstallments: (feeId: string, updatedPaidAmount: number, updatedStatus: 'Paid' | 'Partial' | 'Unpaid') => void;
}

export const InstallmentPlanModal: React.FC<Props> = ({
  isOpen,
  onClose,
  fee,
  student,
  settings,
  onSaveInstallments,
}) => {
  const [numInstallments, setNumInstallments] = useState<2 | 3 | 4>(3);
  const [milestones, setMilestones] = useState<InstallmentMilestone[]>([]);

  useEffect(() => {
    if (!fee) return;

    // Generate initial installment plan based on current fee
    const count = numInstallments;
    const baseAmount = Math.floor(fee.totalAmount / count);
    const remainder = fee.totalAmount - baseAmount * count;

    let cumulativePaid = fee.paidAmount;

    const initialPlan: InstallmentMilestone[] = Array.from({ length: count }, (_, idx) => {
      const isLast = idx === count - 1;
      const amt = isLast ? baseAmount + remainder : baseAmount;

      let isPaid = false;
      if (cumulativePaid >= amt) {
        isPaid = true;
        cumulativePaid -= amt;
      } else {
        isPaid = false;
        cumulativePaid = 0;
      }

      const dueMonth = (new Date().getMonth() + 1 + idx) % 12 || 12;
      const year = new Date().getFullYear();
      const paddedMonth = String(dueMonth).padStart(2, '0');

      return {
        id: `milestone-${idx + 1}`,
        title:
          idx === 0
            ? '1st Installment (Admission & Reg)'
            : idx === 1
            ? '2nd Installment (Mid-Term Exam)'
            : idx === 2
            ? '3rd Installment (Final Semester)'
            : '4th Installment (Certification & Lab)',
        amount: amt,
        dueDate: `${year}-${paddedMonth}-25`,
        isPaid,
        paidDate: isPaid ? '2026-08-01' : undefined,
      };
    });

    setMilestones(initialPlan);
  }, [fee, numInstallments]);

  if (!isOpen || !fee) return null;

  const currency = settings.currencySymbol || '$';

  const handleToggleMilestonePaid = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextPaid = !m.isPaid;
          return {
            ...m,
            isPaid: nextPaid,
            paidDate: nextPaid ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return m;
      })
    );
  };

  const handleAmountChange = (id: string, amount: number) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, amount: Math.max(0, amount) } : m))
    );
  };

  const handleTitleChange = (id: string, title: string) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, title } : m)));
  };

  const handleDueDateChange = (id: string, dueDate: string) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, dueDate } : m)));
  };

  const totalCalculated = milestones.reduce((sum, m) => sum + m.amount, 0);
  const totalPaidCalculated = milestones.filter((m) => m.isPaid).reduce((sum, m) => sum + m.amount, 0);
  const remainingBalanceCalculated = Math.max(0, fee.totalAmount - totalPaidCalculated);

  const handleApplyChanges = () => {
    let finalStatus: 'Paid' | 'Partial' | 'Unpaid' = 'Unpaid';
    if (totalPaidCalculated >= fee.totalAmount) {
      finalStatus = 'Paid';
    } else if (totalPaidCalculated > 0) {
      finalStatus = 'Partial';
    }

    onSaveInstallments(fee.id, totalPaidCalculated, finalStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold border border-sky-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Fee Installment Plan &amp; Schedule
              </h3>
              <p className="text-xs text-slate-400">
                Student: {fee.studentName} ({fee.studentRollNo}) • Course: {fee.course}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950 border border-slate-800 p-3.5 rounded-2xl">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Total Program Fee</span>
              <span className="font-mono text-white font-bold text-sm">{currency}{fee.totalAmount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Total Paid to Date</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                {currency}{totalPaidCalculated}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Remaining Balance</span>
              <span className="font-mono text-amber-400 font-bold text-sm">
                {currency}{remainingBalanceCalculated}
              </span>
            </div>
          </div>

          {/* Plan Split Selector */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Choose Installment Plan:
            </span>
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setNumInstallments(count as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    numInstallments === count
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {count} Parts
                </button>
              ))}
            </div>
          </div>

          {/* Milestones List */}
          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  m.isPaid
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleMilestonePaid(m.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        m.isPaid
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'border border-slate-700 hover:border-slate-500 bg-slate-900 text-transparent'
                      }`}
                      title={m.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => handleTitleChange(m.id, e.target.value)}
                        className="bg-transparent border-0 text-white font-semibold text-xs focus:ring-0 p-0 w-full"
                      />
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <input
                            type="date"
                            value={m.dueDate}
                            onChange={(e) => handleDueDateChange(m.id, e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 font-mono text-[10px]"
                          />
                        </span>
                        {m.isPaid && (
                          <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Paid on {m.paidDate || 'Aug 2026'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-slate-400 font-mono">{currency}</span>
                    <input
                      type="number"
                      value={m.amount}
                      onChange={(e) => handleAmountChange(m.id, Number(e.target.value))}
                      className="w-24 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono font-bold text-right"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sum Validation Check */}
          {totalCalculated !== fee.totalAmount && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Total sum of installments ({currency}{totalCalculated}) does not equal total fee ({currency}{fee.totalAmount}).
              </span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyChanges}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply &amp; Sync Ledger ({currency}{totalPaidCalculated} Paid)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
