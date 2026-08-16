import React, { useState } from 'react';
import { FeeRecord, StudentRecord, SystemSettings } from '../types';
import {
  MessageCircle,
  Mail,
  Copy,
  Check,
  X,
  ExternalLink,
  DollarSign,
  Calendar,
  AlertTriangle,
  Sparkles,
  Share2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fee: FeeRecord | null;
  student?: StudentRecord | null;
  settings: SystemSettings;
}

export const FeeReminderModal: React.FC<Props> = ({ isOpen, onClose, fee, student, settings }) => {
  const [templateType, setTemplateType] = useState<'polite' | 'installment' | 'urgent' | 'paid'>('polite');
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');

  if (!isOpen || !fee) return null;

  const currency = settings.currencySymbol || '$';
  const institution = settings.institutionName || 'Apex Institute of Technology';
  const studentName = fee.studentName;
  const rollNo = fee.studentRollNo;
  const balance = `${currency}${fee.balance}`;
  const totalAmount = `${currency}${fee.totalAmount}`;
  const dueDate = fee.dueDate || '2026-08-30';
  const phoneClean = (student?.phone || '+923001122334').replace(/[^0-9+]/g, '');

  const getReminderText = () => {
    switch (templateType) {
      case 'polite':
        return `Dear ${studentName} (${rollNo}),\n\nHope you are doing well. This is a gentle reminder regarding your pending tuition fee of ${balance} for "${fee.course}" at ${institution}.\n\n📅 Due Date: ${dueDate}\n💳 Total Fee: ${totalAmount} | Outstanding Balance: ${balance}\n\nKindly clear your dues through Meezan Bank (A/C: PK82MEZN00019283746192) or upload your paid challan voucher in your Student Portal.\n\nThank you,\nFinance & Admissions Department\n${institution}`;

      case 'installment':
        return `Dear ${studentName},\n\nYour upcoming semester installment for "${fee.course}" is scheduled for payment.\n\n📌 Outstanding Amount: ${balance}\n📅 Deadline: ${dueDate}\n\nPlease submit your voucher copy to your assigned counselor (${student?.counselorName || 'Counselor Desk'}) upon payment.\n\nBest regards,\n${institution}`;

      case 'urgent':
        return `⚠️ URGENT FEE OVERDUE NOTICE\n\nStudent: ${studentName} (${rollNo})\nProgram: ${fee.course}\nOverdue Amount: ${balance}\nDue Date was: ${dueDate}\n\nPlease settle your outstanding tuition fee immediately to avoid restrictions on lab access, exams, and LMS portals.\n\nOnline Bank Details:\nMeezan Bank | A/C: PK82MEZN00019283746192\nTitle: ${institution}\n\nAccounts Office | ${settings.supportEmail || 'admissions@school.edu'}`;

      case 'paid':
        return `✅ PAYMENT CONFIRMATION RECEIPT\n\nDear ${studentName} (${rollNo}),\n\nWe have successfully received your tuition payment for "${fee.course}".\n\n💵 Amount Paid: ${currency}${fee.paidAmount}\n📌 Remaining Balance: ${balance}\nStatus: ${fee.status}\n\nYou can download your verified fee voucher anytime from your student portal.\n\nThank you for choosing ${institution}!`;
    }
  };

  const finalMessage = customNote
    ? `${getReminderText()}\n\nAdditional Note: ${customNote}`
    : getReminderText();

  const handleCopy = () => {
    navigator.clipboard.writeText(finalMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(finalMessage);
    const url = `https://wa.me/${phoneClean.replace('+', '')}?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleOpenEmail = () => {
    const subject = encodeURIComponent(`Tuition Fee Notification - ${studentName} (${rollNo})`);
    const body = encodeURIComponent(finalMessage);
    const email = student?.email || 'student@school.edu';
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                1-Click Fee Reminder &amp; Dispatcher
              </h3>
              <p className="text-xs text-slate-400">
                To: {studentName} ({student?.phone || '+92 300 1122334'})
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

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Quick Details Chips */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-800 p-3 rounded-2xl">
            <div>
              <span className="text-[10px] text-slate-500 block">Roll No</span>
              <span className="font-mono text-indigo-300 font-bold text-[11px]">{rollNo}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Due Balance</span>
              <span className="font-mono text-amber-400 font-bold text-[11px]">{balance}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Due Date</span>
              <span className="font-mono text-slate-300 text-[11px]">{dueDate}</span>
            </div>
          </div>

          {/* Template Selectors */}
          <div>
            <label className="text-slate-300 font-semibold mb-2 block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Select Message Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType('polite')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  templateType === 'polite'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Gentle Due
              </button>
              <button
                type="button"
                onClick={() => setTemplateType('installment')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  templateType === 'installment'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Installment
              </button>
              <button
                type="button"
                onClick={() => setTemplateType('urgent')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  templateType === 'urgent'
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Urgent Overdue
              </button>
              <button
                type="button"
                onClick={() => setTemplateType('paid')}
                className={`p-2 rounded-xl border text-center transition-all ${
                  templateType === 'paid'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Paid Receipt
              </button>
            </div>
          </div>

          {/* Message Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold">Generated Message Draft</label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={finalMessage}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-slate-200 font-mono text-[11px] leading-relaxed focus:outline-none"
            />
          </div>

          {/* Add custom note */}
          <div>
            <label className="text-slate-400 block mb-1">Optional Custom Remark / Instructions</label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Please send screenshot to WhatsApp +92 300 1234567"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Message'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenEmail}
              className="px-3.5 py-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Send Email</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/25"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
