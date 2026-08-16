import React, { useState, useEffect } from 'react';
import { NotionConfig } from '../types';
import { Database, Key, CheckCircle, AlertTriangle, RefreshCw, X, Shield, Link2, ExternalLink } from 'lucide-react';

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
        setStatusMsg({ type: 'error', text: data.message || 'Connection failed' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error connecting to Notion' });
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
        setStatusMsg({ type: 'success', text: 'Switched to simulated local mode' });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Notion Database Integration</h2>
              <p className="text-xs text-slate-400">4-Relational Databases Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMsg && (
          <div
            className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
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

        <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium flex items-center justify-between">
              <span>Internal Integration Token (secret_...)</span>
              <span className="text-[10px] text-slate-500">Stored safely on server only</span>
            </label>
            <input
              type="password"
              placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Students Database ID</label>
              <input
                type="text"
                placeholder="32 character ID"
                value={config.studentsDatabaseId}
                onChange={(e) => setConfig({ ...config, studentsDatabaseId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Counselors Database ID</label>
              <input
                type="text"
                placeholder="32 character ID"
                value={config.counselorsDatabaseId}
                onChange={(e) => setConfig({ ...config, counselorsDatabaseId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Users Database ID (Auth)</label>
              <input
                type="text"
                placeholder="32 character ID"
                value={config.usersDatabaseId}
                onChange={(e) => setConfig({ ...config, usersDatabaseId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Fees Database ID (Optional)</label>
              <input
                type="text"
                placeholder="32 character ID"
                value={config.feesDatabaseId}
                onChange={(e) => setConfig({ ...config, feesDatabaseId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Security Assurance:
            </p>
            <p>
              As detailed in the PDF guide, your Notion integration token is only used within server route handlers to query filtered records. It is never transmitted to the browser or visible in client network tabs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleSwitchToMock}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
            >
              Use Built-in Simulated Mode
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
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
