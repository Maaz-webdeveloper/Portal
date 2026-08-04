import React, { useState } from 'react';
import { NotionConfig } from '../types';
import { 
  Database, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ExternalLink, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface NotionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  notionConfig: NotionConfig;
  onSaveConfig: (apiKey: string, databaseId: string, mode: 'live' | 'mock') => Promise<void>;
}

export const NotionSetupModal: React.FC<NotionSetupModalProps> = ({
  isOpen,
  onClose,
  notionConfig,
  onSaveConfig,
}) => {
  const [apiKey, setApiKey] = useState(notionConfig.apiKey || '');
  const [databaseId, setDatabaseId] = useState(notionConfig.studentsDatabaseId || '');
  const [mode, setMode] = useState<'live' | 'mock'>(notionConfig.mode || 'mock');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedStep, setCopiedStep] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await onSaveConfig(apiKey, databaseId, mode);
      setSuccessMessage('Notion configuration updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to Notion. Check API Key & Database ID.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Notion Database Integration</h3>
              <p className="text-xs text-slate-400">Connect your live Notion workspace or use Demo mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('mock')}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                mode === 'mock'
                  ? 'bg-indigo-600/15 border-indigo-500/50 text-white ring-1 ring-indigo-500/50'
                  : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="font-semibold text-sm flex items-center gap-2">
                <span>🎭 Demo Mode (Local Data)</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Instant test environment with pre-populated Pakistani student records.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode('live')}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                mode === 'live'
                  ? 'bg-emerald-600/15 border-emerald-500/50 text-white ring-1 ring-emerald-500/50'
                  : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className="font-semibold text-sm flex items-center gap-2">
                <span>⚡ Live Notion API</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Sync live data directly to and from your Notion Database tables.
              </p>
            </button>
          </div>

          {mode === 'live' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Notion Integration Token (API Key)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required={mode === 'live'}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Get token from{' '}
                  <a
                    href="https://www.notion.so/my-integrations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 underline inline-flex items-center gap-1"
                  >
                    notion.so/my-integrations <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Notion Students Database ID
                </label>
                <div className="relative">
                  <Database className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={databaseId}
                    onChange={(e) => setDatabaseId(e.target.value)}
                    placeholder="e.g. 21f8a9012bc34567890abcdef1234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    required={mode === 'live'}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  The 32-character ID in your Notion database page URL right before `?v=...`
                </p>
              </div>

              {/* Quick Setup Instructions */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
                <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span>📌 3-Step Notion Connection Checklist:</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Create a Internal Integration at <span className="text-slate-200">notion.so/my-integrations</span>.</li>
                  <li>In Notion, open your Student Database page & click <span className="text-slate-200">... &gt; Connections &gt; Add your Integration</span>.</li>
                  <li>Copy the database ID from the browser URL bar.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                'Save & Verify Connection'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
