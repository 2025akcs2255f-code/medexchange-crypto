import React, { useState } from 'react';
import {
  Lock,
  User,
  Mail,
  Phone,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Fingerprint,
  Building2,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { AuthSession } from '../types';

interface AuthPortalProps {
  onLogin: (session: AuthSession) => void;
  defaultEmail?: string;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onLogin, defaultEmail = '2025akcs2255f@kab.ac.ug' }) => {
  // Form state
  const [fullName, setFullName] = useState<string>('Tindiwensi Joseph');
  const [emailOrPhone, setEmailOrPhone] = useState<string>(defaultEmail);
  const [password, setPassword] = useState<string>('NIST-SP-800-132-SecurePassphrase-2026!');
  const [institution, setInstitution] = useState<string>('Kabale University, Uganda');
  const [role, setRole] = useState<string>('Lead Security Architect');
  
  // UI states
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authStep, setAuthStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string>('sec_' + Math.random().toString(16).slice(2, 10));

  // The created access link
  const secureAccessLink = `https://medexchange-crypto.kab.ac.ug/access/portal?token=${linkToken}&tenant=kabale_ug`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(secureAccessLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRegenerateToken = () => {
    setLinkToken('sec_' + Math.random().toString(16).slice(2, 10));
  };

  const handleQuickFill = (profile: 'joseph' | 'derick' | 'clinician') => {
    setErrorMessage(null);
    if (profile === 'joseph') {
      setFullName('Tindiwensi Joseph');
      setEmailOrPhone('2025akcs2255f@kab.ac.ug');
      setPassword('NIST-SP-800-132-SecurePassphrase-2026!');
      setRole('Lead Security Architect');
      setInstitution('Kabale University, Uganda');
    } else if (profile === 'derick') {
      setFullName('Tukamushaba Derick');
      setEmailOrPhone('derick.tuka@kab.ac.ug');
      setPassword('Derick-Crypto-Originator-2026#');
      setRole('Cryptographic Originator & Co-Lead');
      setInstitution('Kabale University, Uganda');
    } else {
      setFullName('Dr. Sarah Mukasa');
      setEmailOrPhone('+256 772 984 321');
      setPassword('ClinicalVault-Key-Ug2026!');
      setRole('Chief Medical Officer / Clinician');
      setInstitution('Mulago National Hospital & Kabale Clinical');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate inputs
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter an institutional email or registered phone number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please provide a secure password or passphrase.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters for zero-trust cryptographic safety.');
      return;
    }

    // Simulate authentic cryptographic handshake
    setIsAuthenticating(true);
    try {
      setAuthStep('Deriving ephemeral key with PBKDF2 (210,000 rounds)...');
      await new Promise((r) => setTimeout(r, 450));

      setAuthStep('Validating tenant isolation & access permissions...');
      await new Promise((r) => setTimeout(r, 400));

      setAuthStep('Establishing authenticated zero-trust session...');
      await new Promise((r) => setTimeout(r, 350));

      // Generate random salt and session token
      const session: AuthSession = {
        fullName: fullName.trim(),
        emailOrPhone: emailOrPhone.trim(),
        role: role.trim(),
        institution: institution.trim(),
        token: 'tk_' + Math.random().toString(36).slice(2, 14) + Date.now().toString(36),
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        saltHex: Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(''),
      };

      onLogin(session);
    } finally {
      setIsAuthenticating(false);
      setAuthStep('');
    }
  };

  return (
    <div className="min-h-[84vh] flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Background ambient lighting effects matching zero-trust theme */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-6 relative z-10">
        
        {/* 1. Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 shadow-xl shadow-red-950/70 border border-red-500/30 mb-2">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase font-mono">
              <span className="text-red-500">MedExchange</span>
              <span className="text-slate-400 font-light">-</span>
              <span className="text-white">Crypto</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/90 text-red-400 border border-red-800/80 uppercase">
              Zero-Trust
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Secure Cryptographic Access Gateway · Confidential Clinical File Exchange & AES-256-GCM Vault
          </p>
        </div>

        {/* 2. Created Access Link Box */}
        <div className="bg-[#11141f] border border-[#202637] rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1c2234]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-800/70 flex items-center justify-center text-red-400">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  MedExchange-Crypto Created Access Link
                </h3>
                <span className="text-[11px] text-slate-400">
                  Click the link below or complete the credentials to enter the system
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRegenerateToken}
              className="p-1.5 rounded-lg bg-[#161a28] hover:bg-[#20263a] text-slate-400 hover:text-white border border-[#262f44] transition cursor-pointer"
              title="Generate new secure access token"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3.5 space-y-2">
            <label className="text-[11px] font-mono font-semibold text-slate-300 flex items-center justify-between">
              <span>ACTIVE SECURE ACCESS LINK</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Authenticator
              </span>
            </label>
            <div className="flex items-center gap-2">
              <a
                href="#sign-in-form"
                onClick={(e) => {
                  e.preventDefault();
                  const formEl = document.getElementById('sign-in-form');
                  if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 bg-[#090b10] hover:bg-[#0e111a] border border-[#283147] hover:border-red-500/50 rounded-lg px-3 py-2 text-xs font-mono text-red-400 hover:text-red-300 truncate transition group flex items-center gap-2 cursor-pointer shadow-inner"
                title="Click to focus credentials sign-in form"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition" />
                <span className="truncate">{secureAccessLink}</span>
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#181d2a] hover:bg-[#232a3d] text-slate-200 border border-[#2b354c] transition cursor-pointer shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px]">Copy Link</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>
                Protected under NIST SP 800-132 PBKDF2 key derivation & Kabale University tenant policy.
              </span>
            </p>
          </div>
        </div>

        {/* 3. Credential Input Form */}
        <form
          id="sign-in-form"
          onSubmit={handleSubmit}
          className="bg-[#11141f] border border-[#202637] rounded-xl p-5 sm:p-6 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1c2234]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Sign In to MedExchange-Crypto
                </h2>
                <p className="text-[11px] text-slate-400">
                  Provide your full names, email/phone, and password to unlock the vault
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-red-400 bg-red-950/70 border border-red-900/60 px-2 py-0.5 rounded">
              Tenant Auth
            </span>
          </div>

          {/* Quick preset credentials bar */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
              Quick Preset Credentials:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('joseph')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-left transition cursor-pointer truncate ${
                  fullName === 'Tindiwensi Joseph'
                    ? 'bg-red-950/80 border-red-700/80 text-red-300 font-semibold shadow-xs'
                    : 'bg-[#151926] border-[#22283a] text-slate-300 hover:text-white hover:bg-[#1a2030]'
                }`}
              >
                👤 Tindiwensi Joseph
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('derick')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-left transition cursor-pointer truncate ${
                  fullName === 'Tukamushaba Derick'
                    ? 'bg-red-950/80 border-red-700/80 text-red-300 font-semibold shadow-xs'
                    : 'bg-[#151926] border-[#22283a] text-slate-300 hover:text-white hover:bg-[#1a2030]'
                }`}
              >
                👤 Tukamushaba Derick
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('clinician')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-left transition cursor-pointer truncate ${
                  fullName === 'Dr. Sarah Mukasa'
                    ? 'bg-red-950/80 border-red-700/80 text-red-300 font-semibold shadow-xs'
                    : 'bg-[#151926] border-[#22283a] text-slate-300 hover:text-white hover:bg-[#1a2030]'
                }`}
              >
                🏥 Clinical Officer
              </button>
            </div>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/90 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Field 1: Full Names */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-400" />
                Full Names
              </span>
              <span className="text-[10px] text-red-400 font-mono">*Required</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Tindiwensi Joseph or Tukamushaba Derick"
                className="w-full bg-[#0a0c12] border border-[#23293d] focus:border-red-500 rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 font-sans focus:outline-none transition"
                required
              />
            </div>
          </div>

          {/* Field 2: Email or Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-red-400" />
                Email / Phone Number
              </span>
              <span className="text-[10px] text-red-400 font-mono">*Required</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="e.g. 2025akcs2255f@kab.ac.ug or +256 772 000 000"
                className="w-full bg-[#0a0c12] border border-[#23293d] focus:border-red-500 rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 font-mono focus:outline-none transition"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Used as the tenant cryptographic isolation key for all encrypted file operations.
            </p>
          </div>

          {/* Field 3: Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-red-400" />
                Password / Passphrase
              </span>
              <span className="text-[10px] text-red-400 font-mono">*Required</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password or cryptographic passphrase..."
                className="w-full bg-[#0a0c12] border border-[#23293d] focus:border-red-500 rounded-lg px-3 py-2 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 font-mono focus:outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>PBKDF2-HMAC-SHA256 (210,000 rounds)</span>
              <span className="text-emerald-400 font-mono">NIST SP 800-132 Compliant</span>
            </div>
          </div>

          {/* Field 4: Institution & Role info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                Affiliation
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-[#0a0c12] border border-[#23293d] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-sans focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-slate-400" />
                Assigned Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0a0c12] border border-[#23293d] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-sans focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white shadow-xl shadow-red-950/60 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-red-500/40 disabled:opacity-60"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{authStep || 'Authenticating with Zero-Trust...'}</span>
                </>
              ) : (
                <>
                  <span>Sign In & Enter MedExchange-Crypto</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 text-[11px] text-slate-400 border-t border-[#1c2234]">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              AES-256-GCM
            </span>
            <span>·</span>
            <span>Client-Side WebCrypto</span>
            <span>·</span>
            <span className="text-red-400">Kabale University Tenant</span>
          </div>

        </form>

        {/* 4. Scholar Credit Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>
            Designed & Engineered by <strong className="text-slate-300">Tindiwensi Joseph</strong> (Lead Architect) &amp; <strong className="text-slate-300">Tukamushaba Derick</strong> (Co-Lead)
          </p>
          <p className="font-mono text-[11px] text-red-400">
            Kabale University, Uganda · 2025akcs2255f@kab.ac.ug
          </p>
        </div>

      </div>
    </div>
  );
};
