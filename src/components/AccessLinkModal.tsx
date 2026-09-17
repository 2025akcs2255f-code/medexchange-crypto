import React, { useState } from 'react';
import {
  Link as LinkIcon,
  Copy,
  Check,
  X,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Key,
  ExternalLink,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { AuthSession } from '../types';

interface AccessLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  authSession: AuthSession | null;
  onLogout: () => void;
}

export const AccessLinkModal: React.FC<AccessLinkModalProps> = ({
  isOpen,
  onClose,
  authSession,
  onLogout,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [token, setToken] = useState<string>(authSession?.token || 'sec_kabale_ug_2026');

  if (!isOpen) return null;

  const accessLink = `https://medexchange-crypto.kab.ac.ug/access/portal?token=${token}&tenant=${encodeURIComponent(
    authSession?.emailOrPhone || '2025akcs2255f@kab.ac.ug'
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(accessLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleRegenerate = () => {
    setToken('sec_' + Math.random().toString(36).slice(2, 10));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#10131d] border border-[#232a3d] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg bg-[#151926] hover:bg-[#1f2538] border border-[#242b3e] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-950/50">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              MedExchange-Crypto Access Link
            </h3>
            <p className="text-xs text-slate-400">
              Shareable zero-trust entry link requiring full credential verification
            </p>
          </div>
        </div>

        {/* Link Box */}
        <div className="bg-[#0a0c13] border border-[#22293c] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-400">
            <span>SECURE SYSTEM ACCESS URL</span>
            <button
              onClick={handleRegenerate}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Re-roll Token
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={accessLink}
              className="flex-1 bg-[#121623] border border-[#283147] rounded-lg px-3 py-2 text-xs font-mono text-red-400 truncate focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Session Info */}
        {authSession && (
          <div className="bg-[#141824] border border-[#22293c] rounded-xl p-4 space-y-2.5 text-xs">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider block">
              Active Authenticated Credentials:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="font-semibold text-white truncate">{authSession.fullName}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <Mail className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate">{authSession.emailOrPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">{authSession.role}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-slate-400">
                <Key className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Session: {authSession.loginTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notice */}
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Anyone opening this link will be directed to the authentication gate requiring their <strong>Full Name</strong>, <strong>Email or Phone Number</strong>, and <strong>Password</strong> to access MedExchange-Crypto.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#1c2234]">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="px-3.5 py-2 rounded-lg bg-red-950/90 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out Now
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#181d2c] hover:bg-[#22293d] border border-[#29324a] text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
