import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { StudentDashboard } from './components/StudentDashboard';
import { CounselorDashboard } from './components/CounselorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { NotionConfigModal } from './components/NotionConfigModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { JwtInspectorModal } from './components/JwtInspectorModal';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'counselors' | 'fees' | 'settings' | 'notion'>('overview');
  const [showNotionModal, setShowNotionModal] = useState(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);
  const [showJwtInspector, setShowJwtInspector] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notionConnected, setNotionConnected] = useState(false);

  const handleSyncNotion = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/notion/sync', { method: 'POST' });
      await res.json();
    } catch (e) {
      console.error('Error syncing Notion', e);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <Login onOpenArchitecture={() => setShowArchitectureModal(true)} />
        <ArchitectureModal
          isOpen={showArchitectureModal}
          onClose={() => setShowArchitectureModal(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        onOpenNotionModal={() => setShowNotionModal(true)}
        onOpenJwtInspector={() => setShowJwtInspector(true)}
        onOpenArchitecture={() => setShowArchitectureModal(true)}
        onSyncNotion={handleSyncNotion}
        isSyncing={isSyncing}
        notionConnected={notionConnected}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden min-w-0">
        {user.role === 'student' && <StudentDashboard />}
        {user.role === 'counselor' && <CounselorDashboard activeTab={activeTab} />}
        {user.role === 'admin' && (
          <AdminDashboard
            activeTab={activeTab}
            onOpenNotionModal={() => setShowNotionModal(true)}
            onOpenArchitecture={() => setShowArchitectureModal(true)}
          />
        )}
      </main>

      {/* Modals */}
      <NotionConfigModal
        isOpen={showNotionModal}
        onClose={() => setShowNotionModal(false)}
        onConfigSaved={() => {
          setNotionConnected(true);
          handleSyncNotion();
        }}
      />

      <ArchitectureModal
        isOpen={showArchitectureModal}
        onClose={() => setShowArchitectureModal(false)}
      />

      <JwtInspectorModal
        isOpen={showJwtInspector}
        onClose={() => setShowJwtInspector(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
