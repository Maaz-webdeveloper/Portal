import React from 'react';
import { User, UserRole, NotionConfig } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  Database, 
  RefreshCw, 
  LogOut, 
  HelpCircle,
  KeyRound,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  notionConfig: NotionConfig;
  onOpenNotionSetup: () => void;
  onOpenSchemaGuide: () => void;
  onSyncNotion: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  notionConfig,
  onOpenNotionSetup,
  onOpenSchemaGuide,
  onSyncNotion,
  isSyncing,
}) => {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin (Level 1)
          </span>
        );
      case 'counselor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <UserCheck className="w-3.5 h-3.5" />
            Counselor (Level 2)
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <GraduationCap className="w-3.5 h-3.5" />
            Student (Level 3)
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 tracking-tight text-base sm:text-lg">
                  PortalSync
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Notion RBAC
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Role-Based Student Privacy Gateway
              </p>
            </div>
          </div>

          {/* Center Tools: Notion Sync Status & Schema Button */}
          <div className="hidden md:flex items-center gap-3 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
            <button
              onClick={onOpenNotionSetup}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                notionConfig.isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${notionConfig.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{notionConfig.isConnected ? 'Notion Connected' : 'Notion Mode: Demo'}</span>
              <KeyRound className="w-3.5 h-3.5 ml-1 opacity-70" />
            </button>

            <button
              onClick={onSyncNotion}
              disabled={isSyncing}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-700/60 transition"
              title="Sync latest data with Notion"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            <button
              onClick={onOpenSchemaGuide}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-slate-700/60 transition"
              title="View required Notion Database column mapping"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Notion Mapping</span>
            </button>
          </div>

          {/* Right Controls: Role Switcher & User Profile */}
          <div className="flex items-center gap-3">
            
            {/* Quick Role Simulator Select */}
            <div className="relative">
              <label htmlFor="role-select" className="sr-only">Switch Role</label>
              <select
                id="role-select"
                value={currentUser.id}
                onChange={(e) => {
                  const targetUser = INITIAL_USERS.find((u) => u.id === e.target.value);
                  if (targetUser) onSwitchUser(targetUser);
                }}
                className="bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-slate-750 transition"
              >
                <optgroup label="Level 1: Admin">
                  {INITIAL_USERS.filter((u) => u.role === 'admin').map((u) => (
                    <option key={u.id} value={u.id}>
                      👑 {u.name} (Admin)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Level 2: Counselors">
                  {INITIAL_USERS.filter((u) => u.role === 'counselor').map((u) => (
                    <option key={u.id} value={u.id}>
                      👨‍🏫 {u.name} (Counselor)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Level 3: Students">
                  {INITIAL_USERS.filter((u) => u.role === 'student').map((u) => (
                    <option key={u.id} value={u.id}>
                      🎓 {u.name} (Student)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Active User Badge */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                  {currentUser.name}
                </div>
                <div className="mt-0.5">{getRoleBadge(currentUser.role)}</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
