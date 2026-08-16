import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Key,
  RefreshCw,
  LogOut,
  Database,
  ChevronDown,
  Settings,
  UserCheck,
  GraduationCap,
  Shield,
  Check,
  Terminal,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenNotionModal: () => void;
  onOpenJwtInspector: () => void;
  onOpenArchitecture: () => void;
  onSyncNotion: () => void;
  isSyncing: boolean;
  notionConnected: boolean;
  activeTab: 'overview' | 'students' | 'counselors' | 'fees' | 'settings' | 'notion' | 'debug';
  setActiveTab: (tab: 'overview' | 'students' | 'counselors' | 'fees' | 'settings' | 'notion' | 'debug') => void;
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
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click safely
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleRoleSelect = (role: 'admin' | 'counselor' | 'student', specificId?: string) => {
    setRoleDropdownOpen(false);
    switchRoleQuick(role, specificId);
    if (role === 'admin' || role === 'counselor') {
      setActiveTab('overview');
    }
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20',
          label: 'Super Admin',
          icon: Shield,
        };
      case 'counselor':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
          label: `Counselor (${user?.name?.split(' ')[0] || 'View'})`,
          icon: UserCheck,
        };
      case 'student':
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20',
          label: `Student (${user?.name?.split(' ')[0] || 'View'})`,
          icon: GraduationCap,
        };
      default:
        return { bg: 'bg-slate-800 text-slate-300', label: 'Guest', icon: Shield };
    }
  };

  const badge = getRoleBadge(user?.role);
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-3 w-full min-w-0">
          {/* Zone 1: Brand Title (Clean, single-line, no left arrow) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/30 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-bold text-white text-xs sm:text-base tracking-tight whitespace-nowrap">
              Notion Portal
            </span>
          </div>

          {/* Zone 2: Navigation Links (Single line, active state highlighting) */}
          <nav className="hidden md:flex items-center gap-1.5 no-scrollbar">
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeTab === 'students'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  All Students
                </button>
                <button
                  onClick={() => setActiveTab('counselors')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeTab === 'counselors'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  Counselors
                </button>
                <button
                  onClick={() => setActiveTab('fees')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeTab === 'fees'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  Fee Ledger
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeTab === 'settings'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Portal Settings</span>
                </button>
                <button
                  onClick={() => setActiveTab('debug')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeTab === 'debug'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/30'
                  }`}
                  title="Debug Local State & Data Flow"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Debug</span>
                </button>
              </>
            )}

            {user?.role === 'counselor' && (
              <>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  Assigned Cohort
                </button>
                <button
                  onClick={() => setActiveTab('fees')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeTab === 'fees'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  Cohort Fees
                </button>
              </>
            )}

            {user?.role === 'student' && (
              <div className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-300 rounded-xl text-xs font-mono">
                Isolated Profile: {user.name} ({user.studentRollNo || 'STU-001'})
              </div>
            )}

            <button
              onClick={onOpenArchitecture}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 whitespace-nowrap transition-colors"
            >
              RBAC Flow
            </button>
          </nav>

          {/* Zone 3: Direct Actions (Notion Button, Sync, JWT, Role Switcher, Logout) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Direct Notion Modal Trigger Button */}
            <button
              onClick={onOpenNotionModal}
              title="Configure Notion Database Integration"
              className="px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline font-semibold">Notion</span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  notionConnected ? 'bg-emerald-400 ring-2 ring-emerald-500/20' : 'bg-amber-400'
                }`}
              />
            </button>

            {/* Notion Refresh Sync */}
            <button
              onClick={onSyncNotion}
              disabled={isSyncing}
              title="Sync / Refresh Data"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors border border-slate-700/50 flex items-center gap-1.5 text-xs shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden xl:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>

            {/* JWT Inspector */}
            <button
              onClick={onOpenJwtInspector}
              title="Inspect Active JWT Token & Role Claims"
              className="p-1.5 sm:p-2 text-amber-400 hover:text-amber-300 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors text-xs flex items-center gap-1 shrink-0"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden lg:inline font-mono font-semibold">JWT</span>
            </button>

            {/* Quick Switch Test Role Dropdown */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${badge.bg}`}
                title="Switch between Admin, Counselor, and Student test views"
              >
                <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[65px] xs:max-w-[90px] sm:max-w-[120px]">{badge.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform shrink-0 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {roleDropdownOpen && (
                <>
                  {/* Backdrop click layer */}
                  <div
                    className="fixed inset-0 z-[90] bg-black/30 md:bg-transparent"
                    onClick={() => setRoleDropdownOpen(false)}
                  />

                  {/* Dropdown Menu Panel */}
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-2 w-84 max-w-[calc(100vw-1.25rem)] bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl shadow-black/90 py-2.5 z-[100] text-xs animate-fadeIn max-h-[82vh] overflow-y-auto ring-1 ring-white/10"
                  >
                    <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between border-b border-slate-800 mb-1">
                      <span>Switch Test Role / Portal</span>
                      <span className="text-emerald-400 text-[9px] font-mono">1-Click Switch</span>
                    </div>

                    {/* Section 1: Super Admin */}
                    <div className="px-2 py-1">
                      <span className="text-[10px] font-bold text-slate-400 px-2 uppercase block mb-1">Super Admin</span>
                      <button
                        type="button"
                        onClick={() => handleRoleSelect('admin')}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                          user?.role === 'admin'
                            ? 'text-indigo-300 font-bold bg-indigo-500/20 border border-indigo-500/40 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                          <div>
                            <span className="block font-semibold text-xs">Dr. Shahzad (Super Admin)</span>
                            <span className="text-[10px] text-slate-400 block">Full Master Database Access</span>
                          </div>
                        </div>
                        {user?.role === 'admin' && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                      </button>
                    </div>

                    {/* Section 2: Counselors */}
                    <div className="px-2 py-1 border-t border-slate-800 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 px-2 uppercase block mb-1">Counselor Cohorts</span>
                      <button
                        type="button"
                        onClick={() => handleRoleSelect('counselor', 'usr-counselor-1')}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                          user?.role === 'counselor' && (user?.counselorId === 'counselor-1' || user?.email?.includes('sarah'))
                            ? 'text-emerald-300 font-bold bg-emerald-500/20 border border-emerald-500/40 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="block font-semibold text-xs">Sarah Khan</span>
                            <span className="text-[10px] text-slate-400 block">STEM Cohort (3 Students)</span>
                          </div>
                        </div>
                        {user?.role === 'counselor' && (user?.counselorId === 'counselor-1' || user?.email?.includes('sarah')) && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleSelect('counselor', 'usr-counselor-2')}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors mt-1 cursor-pointer ${
                          user?.role === 'counselor' && (user?.counselorId === 'counselor-2' || user?.email?.includes('tariq'))
                            ? 'text-emerald-300 font-bold bg-emerald-500/20 border border-emerald-500/40 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="block font-semibold text-xs">Tariq Mehmood</span>
                            <span className="text-[10px] text-slate-400 block">Business Cohort (2 Students)</span>
                          </div>
                        </div>
                        {user?.role === 'counselor' && (user?.counselorId === 'counselor-2' || user?.email?.includes('tariq')) && (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    </div>

                    {/* Section 3: Student Portals */}
                    <div className="px-2 py-1 border-t border-slate-800 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 px-2 uppercase block mb-1">Student Portals</span>
                      
                      {/* Student 1 */}
                      <button
                        type="button"
                        onClick={() => handleRoleSelect('student', 'usr-student-1')}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                          user?.role === 'student' && (user?.studentRollNo === 'STU-2024-001' || user?.email?.includes('ayesha'))
                            ? 'text-sky-300 font-bold bg-sky-500/20 border border-sky-500/40 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
                          <div>
                            <span className="block font-semibold text-xs">Ayesha Malik</span>
                            <span className="text-[10px] text-slate-400 font-mono block">STU-2024-001 • Paid</span>
                          </div>
                        </div>
                        {user?.role === 'student' && (user?.studentRollNo === 'STU-2024-001' || user?.email?.includes('ayesha')) && (
                          <Check className="w-4 h-4 text-sky-400 shrink-0" />
                        )}
                      </button>

                      {/* Student 2 */}
                      <button
                        type="button"
                        onClick={() => handleRoleSelect('student', 'usr-student-2')}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors mt-1 cursor-pointer ${
                          user?.role === 'student' && (user?.studentRollNo === 'STU-2024-002' || user?.email?.includes('ali'))
                            ? 'text-sky-300 font-bold bg-sky-500/20 border border-sky-500/40 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
                          <div>
                            <span className="block font-semibold text-xs">Ali Raza</span>
                            <span className="text-[10px] text-slate-400 font-mono block">STU-2024-002 • Pending</span>
                          </div>
                        </div>
                        {user?.role === 'student' && (user?.studentRollNo === 'STU-2024-002' || user?.email?.includes('ali')) && (
                          <Check className="w-4 h-4 text-sky-400 shrink-0" />
                        )}
                      </button>

                      {/* Student 3 */}
                      <button
                        type="button"
                        onClick={() => handleRoleSelect('student', 'usr-student-3')}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors mt-1 cursor-pointer ${
                          user?.role === 'student' && (user?.studentRollNo === 'STU-2024-003' || user?.email?.includes('hamza'))
                            ? 'text-sky-300 font-bold bg-sky-500/20 border border-sky-500/40 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
                          <div>
                            <span className="block font-semibold text-xs">Hamza Farooq</span>
                            <span className="text-[10px] text-slate-400 font-mono block">STU-2024-003 • Overdue</span>
                          </div>
                        </div>
                        {user?.role === 'student' && (user?.studentRollNo === 'STU-2024-003' || user?.email?.includes('hamza')) && (
                          <Check className="w-4 h-4 text-sky-400 shrink-0" />
                        )}
                      </button>

                      {/* Student 4 */}
                      <button
                        type="button"
                        onClick={() => handleRoleSelect('student', 'usr-student-4')}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors mt-1 cursor-pointer ${
                          user?.role === 'student' && (user?.studentRollNo === 'STU-2024-004' || user?.email?.includes('zainab'))
                            ? 'text-sky-300 font-bold bg-sky-500/20 border border-sky-500/40 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
                          <div>
                            <span className="block font-semibold text-xs">Zainab Bibi</span>
                            <span className="text-[10px] text-slate-400 font-mono block">STU-2024-004 • Pending</span>
                          </div>
                        </div>
                        {user?.role === 'student' && (user?.studentRollNo === 'STU-2024-004' || user?.email?.includes('zainab')) && (
                          <Check className="w-4 h-4 text-sky-400 shrink-0" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip (Visible on mobile & tablet < md) */}
        <div className="md:hidden py-2 px-1 border-t border-slate-800/60 overflow-x-auto touch-scroll-x no-scrollbar flex items-center gap-1.5 text-xs w-full min-w-0">
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === 'students'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                All Students
              </button>
              <button
                onClick={() => setActiveTab('counselors')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === 'counselors'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                Counselors
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === 'fees'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                Fee Ledger
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors shrink-0 flex items-center gap-1 ${
                  activeTab === 'settings'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Settings className="w-3 h-3" />
                <span>Settings</span>
              </button>
            </>
          )}

          {user?.role === 'counselor' && (
            <>
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                Assigned Cohort
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === 'fees'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                Cohort Fees
              </button>
            </>
          )}

          {user?.role === 'student' && (
            <div className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-300 rounded-xl text-[11px] font-mono shrink-0">
              Student: {user.name} ({user.studentRollNo || 'STU-001'})
            </div>
          )}

          <button
            onClick={onOpenArchitecture}
            className="px-3 py-1.5 rounded-xl font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 whitespace-nowrap transition-colors shrink-0 ml-auto"
          >
            RBAC Flow
          </button>
        </div>
      </div>
    </header>
  );
};

