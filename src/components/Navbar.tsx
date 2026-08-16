import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Key, RefreshCw, LogOut, Database, UserSwitch, ChevronDown } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenNotionModal: () => void;
  onOpenJwtInspector: () => void;
  onOpenArchitecture: () => void;
  onSyncNotion: () => void;
  isSyncing: boolean;
  notionConnected: boolean;
  activeTab: 'overview' | 'students' | 'counselors' | 'fees' | 'notion';
  setActiveTab: (tab: 'overview' | 'students' | 'counselors' | 'fees' | 'notion') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNotionModal,
  onOpenJwtInspector,
  onOpenArchitecture,
  onSyncNotion,
  isSyncing,
  notionConnected,
  activeTab,
  setActiveTab,
}) => {
  const { user, logout, switchRoleQuick } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          label: 'Super Admin',
        };
      case 'counselor':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          label: 'Counselor',
        };
      case 'student':
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          label: 'Student',
        };
      default:
        return { bg: 'bg-slate-800 text-slate-300', label: 'Guest' };
    }
  };

  const badge = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand title (One line, no child elements below) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-white text-base tracking-tight whitespace-nowrap">
              Notion Portal
            </span>
          </div>

          {/* Zone 2: Navigation Links (single line, role sensitive) */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === 'overview'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Overview
            </button>

            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'students'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  All Students
                </button>
                <button
                  onClick={() => setActiveTab('counselors')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'counselors'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Counselors
                </button>
                <button
                  onClick={() => setActiveTab('fees')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'fees'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Fee Ledger
                </button>
              </>
            )}

            {user?.role === 'counselor' && (
              <>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'students'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Assigned Students
                </button>
                <button
                  onClick={() => setActiveTab('fees')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === 'fees'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  Cohort Fees
                </button>
              </>
            )}

            <button
              onClick={onOpenArchitecture}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 whitespace-nowrap transition-colors"
            >
              RBAC Flow
            </button>
          </nav>

          {/* Zone 3: Actions (Role switcher, JWT inspector, Notion Sync, Logout) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Notion Status / Sync */}
            <button
              onClick={onSyncNotion}
              disabled={isSyncing}
              title={notionConnected ? 'Sync with Live Notion DB' : 'Simulate Notion DB Sync'}
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors border border-slate-700/50 flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden xl:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>

            {/* JWT Inspector Button */}
            <button
              onClick={onOpenJwtInspector}
              title="Inspect Live JWT Claims"
              className="p-2 text-amber-400 hover:text-amber-300 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors text-xs flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden lg:inline font-mono">JWT</span>
            </button>

            {/* Quick Switch Role Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${badge.bg}`}
              >
                <span>{badge.label}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-fadeIn"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-500">
                    Switch Test User
                  </div>
                  <button
                    onClick={() => {
                      switchRoleQuick('admin');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between ${
                      user?.role === 'admin' ? 'text-indigo-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <span>Administrator</span>
                    <span className="text-[10px] text-slate-500">Dr. Shahzad</span>
                  </button>
                  <button
                    onClick={() => {
                      switchRoleQuick('counselor', 'usr-counselor-1');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between ${
                      user?.role === 'counselor' && user?.counselorId === 'counselor-1'
                        ? 'text-emerald-400 font-semibold'
                        : 'text-slate-300'
                    }`}
                  >
                    <span>Counselor: Sarah</span>
                    <span className="text-[10px] text-slate-500">STEM (3 stu)</span>
                  </button>
                  <button
                    onClick={() => {
                      switchRoleQuick('counselor', 'usr-counselor-2');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between ${
                      user?.role === 'counselor' && user?.counselorId === 'counselor-2'
                        ? 'text-emerald-400 font-semibold'
                        : 'text-slate-300'
                    }`}
                  >
                    <span>Counselor: Tariq</span>
                    <span className="text-[10px] text-slate-500">Business (2 stu)</span>
                  </button>
                  <button
                    onClick={() => {
                      switchRoleQuick('student', 'usr-student-1');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between ${
                      user?.role === 'student' && user?.studentRollNo === 'STU-2024-001'
                        ? 'text-sky-400 font-semibold'
                        : 'text-slate-300'
                    }`}
                  >
                    <span>Student: Ayesha</span>
                    <span className="text-[10px] text-slate-500">STU-001</span>
                  </button>
                  <button
                    onClick={() => {
                      switchRoleQuick('student', 'usr-student-3');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center justify-between ${
                      user?.role === 'student' && user?.studentRollNo === 'STU-2024-003'
                        ? 'text-sky-400 font-semibold'
                        : 'text-slate-300'
                    }`}
                  >
                    <span>Student: Hamza</span>
                    <span className="text-[10px] text-slate-500">STU-003</span>
                  </button>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
