import React, { useState, useEffect } from 'react';
import { NotionConfig } from '../types';
import { Database, Key, CheckCircle, AlertTriangle, RefreshCw, X, Shield, Link2, ExternalLink, HelpCircle, ArrowLeft } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const NotionConfigModal: React.FC<Props> = ({ isOpen, onClose, onConfigSaved }) => {
  const [config, setConfig] = useState<NotionConfig>({
    apiKey: '',
    usersDatabaseId: '',
    studentsDatabaseId: '',
    counselorsDatabaseId: '',
    feesDatabaseId: '',
    isConnected: false,
    lastSyncTime: null,
    mode: 'mock',
  });
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/notion/config');
      const data = await res.json();
      setConfig((prev) => ({
        ...prev,
        ...data,
      }));
    } catch (e) {
      console.error('Failed to load Notion config', e);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/notion/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: data.message });
        fetchConfig();
        onConfigSaved();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Connection failed. Please verify your token and database ID.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error connecting to Notion API' });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToMock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notion/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'mock' }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Switched to built-in simulated Notion 4-database engine!' });
        fetchConfig();
        onConfigSaved();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Notion Database Setup &amp; Sync</h2>
              <p className="text-xs text-slate-400">Connect your live Notion workspace or use simulated mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Step-by-Step Help */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-semibold text-indigo-300 hover:text-indigo-200 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>How do I connect Notion? (4 Simple Steps)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">{showInstructions ? 'Hide ▲' : 'Show ▼'}</span>
          </button>

          {showInstructions && (
            <div className="mt-2 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300 space-y-2.5 animate-fadeIn">
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <p>
                  Go to{' '}
                  <a
                    href="https://www.notion.so/my-integrations"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 underline font-semibold inline-flex items-center gap-1"
                  >
                    notion.so/my-integrations <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  and click <strong>+ New integration</strong>. Name it <em>Student Portal</em>.
                </p>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <p>
                  Copy the <strong>Internal Integration Secret</strong> (starts with <code className="text-emerald-400 font-mono">secret_...</code>) and paste it below.
                </p>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <p>
                  <strong>CRITICAL STEP:</strong> In Notion, open your Student Database page, click the <strong>&quot;...&quot;</strong> icon in the top right corner &rarr; <strong>Connect to</strong> &rarr; select your integration.
                </p>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  4
                </span>
                <p>
                  Copy the 32-character <strong>Database ID</strong> from the page URL (e.g.{' '}
                  <code className="text-slate-400 font-mono">notion.so/workspace/<strong>[32_char_id]</strong>?v=...</code>) and paste it below.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Alert */}
        {statusMsg && (
          <div
            className={`p-3 rounded-2xl text-xs mb-4 flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Configuration Form */}
        <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-semibold flex items-center justify-between">
              <span>Internal Integration Token (secret_...)</span>
              <span className="text-[10px] text-slate-500">Stored safely on server only</span>
            </label>
            <input
              type="password"
              placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Students Database ID</label>
              <input
                type="text"
                placeholder="32 character ID or paste URL"
                value={config.studentsDatabaseId}
                onChange={(e) => setConfig({ ...config, studentsDatabaseId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Counselors Database ID</label>
              <input
                type="text"
                placeholder="32 character ID"
                value={config.counselorsDatabaseId}
                onChange={(e) => setConfig({ ...config, counselorsDatabaseId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Users Database ID (Auth)</label>
              <input
                type="text"
                placeholder="32 character ID"
                value={config.usersDatabaseId}
                onChange={(e) => setConfig({ ...config, usersDatabaseId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Fees Database ID (Optional)</label>
              <input
                type="text"
                placeholder="32 character ID"
                value={config.feesDatabaseId}
                onChange={(e) => setConfig({ ...config, feesDatabaseId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Security Guarantee:
            </p>
            <p>
              Your Notion integration token is only used within server route handlers to query filtered records. It is never transmitted to the browser or visible in client network tabs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleSwitchToMock}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
            >
              Use Built-in Simulated Mode
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Connect &amp; Test Notion</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
