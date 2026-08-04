import React from 'react';
import { Database, HelpCircle, X, Table, Code2, ArrowRight } from 'lucide-react';

interface NotionSchemaGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotionSchemaGuide: React.FC<NotionSchemaGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const schemaColumns = [
    { property: 'Roll No', type: 'Title / Text', example: 'STU-2024-001', required: true, desc: 'Unique identification code for student.' },
    { property: 'Name', type: 'Title / Text', example: 'Ayesha Malik', required: true, desc: 'Full student name.' },
    { property: 'Email', type: 'Email / Text', example: 'ayesha@school.edu', required: true, desc: 'Student login email address.' },
    { property: 'Course', type: 'Select / Text', example: 'Full Stack Development', required: false, desc: 'Enrolled course or track.' },
    { property: 'Counselor Name', type: 'Select / Text', example: 'Sarah Khan', required: true, desc: 'Assigned counselor name.' },
    { property: 'Counselor ID', type: 'Text', example: 'counselor-1', required: true, desc: 'Internal counselor ID used for RBAC privacy filters.' },
    { property: 'Fee Status', type: 'Select', example: 'Paid / Pending / Overdue', required: true, desc: 'Financial payment status.' },
    { property: 'Fee Amount', type: 'Number', example: '1200', required: false, desc: 'Total fee for enrolled course.' },
    { property: 'Fee Paid', type: 'Number', example: '1200', required: false, desc: 'Amount collected so far.' },
    { property: 'Due Date', type: 'Date', example: '2026-08-15', required: false, desc: 'Next payment installment due date.' },
    { property: 'Progress', type: 'Number', example: '88', required: false, desc: 'Academic completion percentage (0 to 100).' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Notion Database Column Schema Mapping</h3>
              <p className="text-xs text-slate-400">Structure your Notion table with these property names for automated sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-xs text-slate-300">
            <p className="font-semibold text-white mb-1">💡 How Notion Property Sync Works:</p>
            <p className="text-slate-400 leading-relaxed">
              When you connect your Notion Database, PortalSync queries your Notion API pages and automatically maps property names to the dashboard. If any column is missing, default values are provided so your app never breaks.
            </p>
          </div>

          {/* Table Schema Breakdown */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Notion Property</th>
                  <th className="py-3 px-4">Notion Type</th>
                  <th className="py-3 px-4">Sample Value</th>
                  <th className="py-3 px-4">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-mono text-[11px]">
                {schemaColumns.map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-semibold text-indigo-300">
                      {col.property}
                      {col.required && <span className="text-rose-400 ml-1">*</span>}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 font-sans">{col.type}</td>
                    <td className="py-2.5 px-4 text-emerald-400">{col.example}</td>
                    <td className="py-2.5 px-4 text-slate-400 font-sans">{col.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Privacy Security Callout */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-emerald-400">
              🔒 Privacy Security Wall Active
            </p>
            <p className="text-emerald-300/80 leading-relaxed">
              Notion doesn't natively support row-level permissions. PortalSync acts as the secure intermediary API layer. When a Counselor or Student logs into this portal, the Express backend strips out all records not explicitly owned by or assigned to that user.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
          >
            Got It!
          </button>
        </div>

      </div>
    </div>
  );
};
