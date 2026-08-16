import React from 'react';
import { Database, ShieldCheck, Server, Key, FileSpreadsheet, Lock, ArrowRight, X, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">System Architecture & Role-Based Flow</h2>
              <p className="text-xs text-slate-400">Complete implementation based on the Notion RBAC Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Tier Architecture Diagram */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Frontend Tier */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <h3 className="font-medium text-sm text-slate-200">1. React Frontend</h3>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  User logs in, receives signed JWT, and attaches it as <code className="text-emerald-400 bg-emerald-950/50 px-1 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code> on every API request.
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono text-slate-300">
                  <p className="text-indigo-300 font-semibold">GET /api/students</p>
                  <p className="text-slate-400 truncate">Auth: Bearer eyJhbGciOi...</p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Never contains Notion secrets
              </div>
            </div>

            {/* Backend RBAC Tier */}
            <div className="bg-slate-950/60 border border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between relative ring-1 ring-indigo-500/20">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <h3 className="font-medium text-sm text-indigo-200">2. Express Backend (RBAC)</h3>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Verifies JWT using secret key. Extracts decoded role &amp; user ID server-side. Enforces strict role filtering before querying.
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono space-y-1">
                  <div className="text-amber-300">Admin: all records</div>
                  <div className="text-indigo-300">Counselor: assigned ID only</div>
                  <div className="text-emerald-300">Student: own roll number only</div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-indigo-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" /> Notion token protected in env
              </div>
            </div>

            {/* Notion Central DB Tier */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-4 h-4 text-amber-400" />
                  <h3 className="font-medium text-sm text-slate-200">3. Notion Databases</h3>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  4 linked relational Notion databases storing all records securely without public exposure.
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[11px] space-y-1 text-slate-300 font-mono">
                  <p>• Users DB (hashed passwords)</p>
                  <p>• Counselors DB (assigned relations)</p>
                  <p>• Students DB (course, records)</p>
                  <p>• Fees DB (dues, balances)</p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> 100% server-queried
              </div>
            </div>
          </div>

          {/* Database Schema Details */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" /> 4 Linked Notion Databases Structure
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg">
                <span className="font-semibold text-indigo-300 block mb-1">1. Users Database</span>
                <ul className="text-slate-400 space-y-0.5">
                  <li>• Name, Email</li>
                  <li>• Password (bcrypt hash)</li>
                  <li>• Role (Admin/Counselor/Student)</li>
                  <li>• Linked Profile (Relation)</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg">
                <span className="font-semibold text-emerald-300 block mb-1">2. Counselors Database</span>
                <ul className="text-slate-400 space-y-0.5">
                  <li>• Name, Email, Phone</li>
                  <li>• Specialization</li>
                  <li>• Assigned Students (Relation)</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg">
                <span className="font-semibold text-sky-300 block mb-1">3. Students Database</span>
                <ul className="text-slate-400 space-y-0.5">
                  <li>• Name, Roll No, Email</li>
                  <li>• Course, Progress, Attendance</li>
                  <li>• Assigned Counselor (Relation)</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg">
                <span className="font-semibold text-amber-300 block mb-1">4. Fees Database</span>
                <ul className="text-slate-400 space-y-0.5">
                  <li>• Student (Relation)</li>
                  <li>• Amount, Paid, Balance</li>
                  <li>• Status, Due Date</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Security Rules Checklist */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" /> Privacy &amp; Security Validation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Server-Side Role Filter:</strong> Role is extracted directly from the verified JWT on the server, not trusted from client headers.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>No Leaked Tokens:</strong> Notion API tokens remain strictly in server environment variables.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Student Isolation:</strong> Student accounts can only access their specific roll number / record ID.</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Counselor Cohort Isolation:</strong> Counselors cannot view other counselors' assigned students or add notes across boundaries.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
