import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle, Database, Sparkles } from 'lucide-react';

interface Props {
  onOpenArchitecture?: () => void;
}

export const Login: React.FC<Props> = ({ onOpenArchitecture }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@school.edu');
  const [password, setPassword] = useState('admin123password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Authentication failed');
    }
  };

  const handleQuickSelect = async (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setError('');
    setLoading(true);
    const res = await login(testEmail, testPass);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-500/10 via-slate-900/0 to-transparent pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl mb-4 text-indigo-400">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Student Management Portal
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Role-Based Access Control (RBAC) with Notion Database Integration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="name@school.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In with JWT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for each role */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Quick 1-Click Role Login</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </p>

            <div className="space-y-2">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleQuickSelect('admin@school.edu', 'admin123password')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/30 rounded-xl transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    AD
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white group-hover:text-indigo-300">Administrator</p>
                    <p className="text-[11px] text-slate-400">Dr. Shahzad (Full access to all 4 databases)</p>
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-medium">
                  Super Admin
                </span>
              </button>

              {/* Counselor 1 */}
              <button
                type="button"
                onClick={() => handleQuickSelect('sarah.counselor@school.edu', 'counselor123')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/30 rounded-xl transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    CS
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white group-hover:text-emerald-300">Counselor: Sarah Khan</p>
                    <p className="text-[11px] text-slate-400">Assigned Cohort (3 students)</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-medium">
                  Counselor
                </span>
              </button>

              {/* Student 1 */}
              <button
                type="button"
                onClick={() => handleQuickSelect('ayesha.student@school.edu', 'student123')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/30 rounded-xl transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                    ST
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white group-hover:text-sky-300">Student: Ayesha Malik</p>
                    <p className="text-[11px] text-slate-400">Roll: STU-2024-001 (Isolated single-view)</p>
                  </div>
                </div>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-medium">
                  Student
                </span>
              </button>
            </div>
          </div>
        </div>

        {onOpenArchitecture && (
          <div className="mt-4 text-center">
            <button
              onClick={onOpenArchitecture}
              className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" /> View Notion RBAC Architecture Diagram
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
