import {
  Lock,
  HardDrive,
  ShieldCheck,
  FileCode,
  User,
  Plus,
  RotateCcw,
  Play,
  KeyRound,
  CheckCircle2,
  LogOut,
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';
import { MainAppTab, AuthSession } from '../types';

interface HeaderProps {
  activeTab: MainAppTab;
  setActiveTab: (tab: MainAppTab) => void;
  activeUser: 'alice' | 'bob' | 'admin';
  setActiveUser: (user: 'alice' | 'bob' | 'admin') => void;
  activeTenantEmail: string;
  onOpenEncryptModal: () => void;
  onRunSimulation?: () => void;
  onResetSimulation?: () => void;
  isSimulating?: boolean;
  authSession?: AuthSession | null;
  onLogout?: () => void;
  onOpenAccessLinkModal?: () => void;
}

export const Header = ({
  activeTab,
  setActiveTab,
  activeUser,
  setActiveUser,
  activeTenantEmail,
  onOpenEncryptModal,
  onRunSimulation,
  onResetSimulation,
  isSimulating = false,
  authSession,
  onLogout,
  onOpenAccessLinkModal,
}: HeaderProps) => {
  return (
    <header className="border-b border-[#202638] bg-[#0c0e16]/95 backdrop-blur sticky top-0 z-40 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-950/60 shrink-0 border border-red-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-black text-white tracking-tight uppercase font-mono">
                  <span className="text-red-500">MedExchange</span>
                  <span className="text-slate-400 font-light">-</span>
                  <span className="text-white">Crypto</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-950/90 text-red-400 border border-red-800/80 uppercase tracking-wide">
                  Zero-Trust Vault
                </span>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#141824] text-slate-300 border border-[#242c40] uppercase tracking-wide">
                  256-bit AES-GCM
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Zero-Trust Encrypted Clinical File Vault & Exchange · PBKDF2 (210,000 rounds)
              </p>
            </div>
          </div>

          {/* Quick User Switcher & Encrypt CTA & Auth/Logout */}
          <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
            
            {/* Authenticated User Credentials Badge */}
            {authSession && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#121623] border border-[#232b3f] text-xs">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-bold text-[11px] shadow-xs shrink-0">
                  {authSession.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-white font-bold text-[11px] truncate max-w-[140px]">
                    {authSession.fullName}
                  </div>
                  <div className="text-[10px] text-red-400 font-mono truncate max-w-[140px]">
                    {authSession.emailOrPhone}
                  </div>
                </div>
              </div>
            )}

            {/* Access Link Button */}
            {onOpenAccessLinkModal && (
              <button
                onClick={onOpenAccessLinkModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#151926] hover:bg-[#1f2537] text-slate-300 hover:text-white border border-[#283146] transition cursor-pointer"
                title="View or share secure access link"
              >
                <LinkIcon className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden md:inline">Access Link</span>
              </button>
            )}

            {/* Quick Switch (for multi-tenant cryptographic simulation) */}
            <div className="hidden xl:flex items-center gap-1 bg-[#141824] border border-[#232a3d] p-1 rounded-lg text-xs font-mono">
              <span className="text-slate-400 text-[10px] px-1">Keys:</span>
              
              <button
                onClick={() => setActiveUser('alice')}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer text-[10px] font-semibold ${
                  activeUser === 'alice'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Simulate Sender (Tukamushaba Derick)"
              >
                Derick
              </button>

              <button
                onClick={() => setActiveUser('bob')}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer text-[10px] font-semibold ${
                  activeUser === 'bob'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title="Simulate Receiver (Tindiwensi Joseph)"
              >
                Joseph
              </button>
            </div>

            {/* Top Right Primary CTA: Encrypt File */}
            <button
              onClick={onOpenEncryptModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-950/40 transition active:scale-98 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Encrypt</span>
            </button>

            {/* Log Out Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/80 hover:bg-red-900/90 text-red-300 hover:text-white border border-red-800/80 transition cursor-pointer shadow-xs active:scale-98"
                title="Log out of MedExchange-Crypto and clear ephemeral session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="font-semibold">Log Out</span>
              </button>
            )}

          </div>
        </div>

        {/* Navigation Tabs (Vault Storage, Security Lab, FastAPI Spec, Portfolio & Profile) */}
        <div className="mt-3 pt-2.5 border-t border-[#1a1f30] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          
          <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            
            <button
              onClick={() => setActiveTab('vault')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'vault'
                  ? 'bg-red-950/70 text-red-300 border border-red-800/80 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-red-400" />
              Vault Storage
            </button>

            <button
              onClick={() => setActiveTab('security_lab')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'security_lab'
                  ? 'bg-red-950/70 text-red-300 border border-red-800/80 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              Security Lab
            </button>

            <button
              onClick={() => setActiveTab('fastapi_spec')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'fastapi_spec'
                  ? 'bg-red-950/70 text-red-300 border border-red-800/80 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              FastAPI Spec
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'portfolio'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-950/60 border border-red-500'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <User className="w-3.5 h-3.5 text-red-200" />
              Portfolio & Profile
            </button>

          </nav>

          {/* Quick simulation controls or stats */}
          <div className="flex items-center gap-2">
            {onRunSimulation && (
              <button
                onClick={onRunSimulation}
                disabled={isSimulating}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161a28] hover:bg-[#20263a] text-slate-300 border border-[#273045] transition text-[11px] cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-3 h-3 text-red-400 ${isSimulating ? 'animate-spin' : ''}`} />
                {isSimulating ? 'Simulating...' : 'Run Pipeline Demo'}
              </button>
            )}

            {onResetSimulation && (
              <button
                onClick={onResetSimulation}
                disabled={isSimulating}
                className="p-1 rounded bg-[#161a28] hover:bg-[#20263a] text-slate-400 hover:text-white border border-[#273045] transition text-[11px] cursor-pointer"
                title="Reset simulation"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
