import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Key, Shield, Code, CheckCircle, X, Copy, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const JwtInspectorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { token, user } = useAuth();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Live JWT Token &amp; Claims Inspector</h2>
              <p className="text-xs text-slate-400">Decoded payload enforced on every API request by the backend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-400" /> Signed Bearer Token (Stored in Session)
              </label>
              <button
                onClick={copyToken}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-indigo-300 break-all select-all">
              {token || 'No active JWT token found'}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Shield className="w-4 h-4 text-emerald-400" /> Verified Decoded Payload Claims
            </label>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 space-y-1 overflow-x-auto">
              <pre className="text-[12px]">{JSON.stringify(user, null, 2)}</pre>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-white font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              How the Backend Uses this Token:
            </div>
            <p className="text-slate-400 leading-relaxed">
              When requesting <code className="text-indigo-300 font-mono">/api/students</code>, the Express server verifies this JWT with <code className="text-indigo-300 font-mono">JWT_SECRET</code> and reads the claim <code className="text-emerald-300 font-mono">role: &quot;{user?.role}&quot;</code>. The frontend cannot spoof this role, ensuring strict privacy for students and counselors.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
