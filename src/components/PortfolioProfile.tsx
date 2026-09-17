import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  FileCode,
  HardDrive,
  Upload,
  Maximize2,
  Edit3,
  Mail,
  GraduationCap,
  MapPin,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Users
} from 'lucide-react';
import { MainAppTab, UserProfileData } from '../types';

interface PortfolioProfileProps {
  onNavigateTab: (tab: MainAppTab) => void;
  onOpenEncryptModal: () => void;
  activeUserSalt: string;
  onRefreshSalt: () => void;
  profile: UserProfileData;
  onUpdateProfile: (updated: UserProfileData) => void;
}

export const PortfolioProfile = ({
  onNavigateTab,
  onOpenEncryptModal,
  activeUserSalt,
  onRefreshSalt,
  profile,
  onUpdateProfile,
}: PortfolioProfileProps) => {
  const [copiedSalt, setCopiedSalt] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState<UserProfileData>(profile);

  const handleCopySalt = () => {
    navigator.clipboard.writeText(activeUserSalt);
    setCopiedSalt(true);
    setTimeout(() => setCopiedSalt(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateProfile({
            ...profile,
            photoUrl: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editForm);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* ------------------------------------------------------------- */}
      {/* 1. MedExchange-Crypto Architecture (NIST SP 800-132 & RFC 5116) */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-[#11141f] border border-[#202637] rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1e2435]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                MedExchange-Crypto Architecture <span className="text-xs font-mono font-normal text-red-400 bg-red-950/70 border border-red-800/60 px-2 py-0.5 rounded">(NIST SP 800-132 & RFC 5116)</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Zero-Trust medical data pipeline matching the Python FastAPI / WebCrypto implementation
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-[#0c0e16] border border-[#262c3e] px-3 py-1.5 rounded-lg">
            <span className="text-slate-400">Active User Salt:</span>
            <span className="text-red-400 font-semibold">{activeUserSalt.slice(0, 16)}...</span>
            <button
              onClick={handleCopySalt}
              title="Copy active salt"
              className="text-slate-400 hover:text-white transition cursor-pointer p-0.5"
            >
              {copiedSalt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onRefreshSalt}
              title="Regenerate CSPRNG Salt"
              className="text-slate-400 hover:text-red-400 transition cursor-pointer text-[10px] ml-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
            >
              Rotate
            </button>
          </div>
        </div>

        {/* 6 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
          
          {/* Card 1 */}
          <div className="bg-[#151926] border border-[#242b3d] rounded-lg p-3.5 flex flex-col justify-between hover:border-red-500/50 transition duration-200">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-red-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                    1
                  </span>
                  <h3 className="text-xs font-bold text-white tracking-tight">Passphrase & Unique Salt</h3>
                </div>
                <span className="text-[10px] font-mono font-medium text-red-300 bg-red-950/60 border border-red-900/60 px-1.5 py-0.5 rounded whitespace-nowrap">
                  16 Bytes Salt
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                User password + 16-byte cryptographically secure random salt.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1f2537] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Entropy: CSPRNG</span>
              <span className="text-slate-300 truncate max-w-[120px]">{activeUserSalt.slice(0, 12)}..</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#151926] border border-[#242b3d] rounded-lg p-3.5 flex flex-col justify-between hover:border-red-500/50 transition duration-200">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-red-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                    2
                  </span>
                  <h3 className="text-xs font-bold text-white tracking-tight">PBKDF2 Key Derivation</h3>
                </div>
                <span className="text-[10px] font-mono font-medium text-red-300 bg-red-950/60 border border-red-900/60 px-1.5 py-0.5 rounded whitespace-nowrap">
                  210,000 Iterations
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                HMAC-SHA256 with 210,000 rounds (NIST recommendation).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1f2537] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>NIST SP 800-132</span>
              <span className="text-emerald-400 font-semibold">Verified</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#151926] border border-[#242b3d] rounded-lg p-3.5 flex flex-col justify-between hover:border-red-500/50 transition duration-200">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-red-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                    3
                  </span>
                  <h3 className="text-xs font-bold text-white tracking-tight">256-bit Ephemeral Key</h3>
                </div>
                <span className="text-[10px] font-mono font-medium text-red-300 bg-red-950/60 border border-red-900/60 px-1.5 py-0.5 rounded whitespace-nowrap">
                  32-byte Key
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Never written to disk or database. Derived in-memory only.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1f2537] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Persistence: None</span>
              <span className="text-cyan-400 font-semibold">In-Memory RAM</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#151926] border border-[#242b3d] rounded-lg p-3.5 flex flex-col justify-between hover:border-red-500/50 transition duration-200">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-red-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                    4
                  </span>
                  <h3 className="text-xs font-bold text-white tracking-tight">12-Byte CSPRNG Nonce</h3>
                </div>
                <span className="text-[10px] font-mono font-medium text-red-300 bg-red-950/60 border border-red-900/60 px-1.5 py-0.5 rounded whitespace-nowrap">
                  12 Bytes Nonce
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unique 96-bit generated freshly for every single file.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1f2537] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Standard: RFC 5116</span>
              <span className="text-slate-300 font-semibold">Anti-Replay</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-[#151926] border border-[#242b3d] rounded-lg p-3.5 flex flex-col justify-between hover:border-red-500/50 transition duration-200">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-red-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                    5
                  </span>
                  <h3 className="text-xs font-bold text-white tracking-tight">AES-256-GCM AEAD</h3>
                </div>
                <span className="text-[10px] font-mono font-medium text-red-300 bg-red-950/60 border border-red-900/60 px-1.5 py-0.5 rounded whitespace-nowrap">
                  Confidentiality + Integrity
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Authenticated encryption produces ciphertext + 16-byte tag.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1f2537] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>GHASH Polynomial</span>
              <span className="text-red-400 font-semibold">128-bit Tag</span>
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-[#151926] border border-[#242b3d] rounded-lg p-3.5 flex flex-col justify-between hover:border-red-500/50 transition duration-200">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-red-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                    6
                  </span>
                  <h3 className="text-xs font-bold text-white tracking-tight">MedExchange Zero-Trust Storage</h3>
                </div>
                <span className="text-[10px] font-mono font-medium text-red-300 bg-red-950/60 border border-red-900/60 px-1.5 py-0.5 rounded whitespace-nowrap">
                  Clinical Vault
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Repository stores only sanitized AEAD payloads, preventing data exposure even on compromised disks.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#1f2537] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Tenant Partitioning</span>
              <span className="text-emerald-400 font-semibold">Zero Leaks</span>
            </div>
          </div>

        </div>

        {/* Full-width AEAD Tamper Alert Box */}
        <div className="mt-4 bg-red-950/40 border border-red-800/70 rounded-lg p-3.5 flex items-start gap-3">
          <div className="p-1 rounded bg-red-900/60 text-red-400 mt-0.5 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-red-300 tracking-wide mr-1.5 uppercase font-mono">AEAD Tamper Detection:</span>
            Unlike unauthenticated AES (CBC or CTR without HMAC), AES-GCM appends a 16-byte GHASH tag calculated over ciphertext and nonce. Any byte modification on disk causes <code className="text-red-300 bg-red-950/80 px-1 py-0.5 rounded font-mono">InvalidTag</code> exception in Python or decryption authentication error, rejecting the payload before delivery.
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. Developer Profile Card (TINDIWENSI JOSEPH & Collaborators) */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-[#11141f] border border-[#202637] rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
          
          {/* Left Column: Photo & Actions */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col items-center sm:items-start space-y-3">
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#2a334a] bg-[#0c0e16] group shadow-lg">
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                onError={(e) => {
                  // Fallback if image fails
                  (e.target as HTMLImageElement).src = '/dsc_8709.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition" />
              
              <button
                onClick={() => setIsLightboxOpen(true)}
                title="Open full resolution preview"
                className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-black/60 hover:bg-red-600 text-white backdrop-blur transition cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono text-white/90 bg-black/70 backdrop-blur px-2.5 py-1 rounded">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Pixel Fidelity: 100%
                </span>
                <span className="text-red-300 font-semibold">3128 x 2168</span>
              </div>
            </div>

            {/* Hidden file input for photo upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {/* Photo Action Buttons */}
            <div className="w-full space-y-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-[#181d2c] hover:bg-[#20273a] text-slate-200 border border-[#2a334a] transition cursor-pointer active:scale-98 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-red-400" />
                Upload / Drag DSC_8709.JPG
              </button>

              <button
                onClick={() => setIsLightboxOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                <ExternalLink className="w-3 h-3 text-slate-500" />
                Open Full-Resolution Lightbox
              </button>
            </div>
          </div>

          {/* Right Column: Bio, Competencies & Roles */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-4">
            
            {/* Header / Name */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2537]">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase font-mono">
                    {profile.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-800/80 tracking-wide">
                    {profile.titleBadge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">
                  {profile.subtitle}
                </p>
              </div>

              <button
                onClick={() => {
                  setEditForm(profile);
                  setIsEditModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a1f30] hover:bg-[#232a40] text-slate-300 border border-[#2c354f] transition cursor-pointer self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5 text-red-400" />
                Edit Profile Details
              </button>
            </div>

            {/* Credentials / University / Contact Pills */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#161a28] border border-[#273045] text-slate-300 hover:text-white hover:border-red-500/50 transition font-mono"
              >
                <Mail className="w-3.5 h-3.5 text-red-400" />
                {profile.email}
              </a>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#161a28] border border-[#273045] text-slate-300">
                <GraduationCap className="w-3.5 h-3.5 text-red-400" />
                {profile.university}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#161a28] border border-[#273045] text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                {profile.location}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 font-medium">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Co-Lead: {profile.coCollaborator}
              </span>
            </div>

            {/* Professional Background & Vision */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Professional Background & Vision
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#0e111a] p-3 rounded-lg border border-[#1f2537]">
                {profile.bio}
              </p>
            </div>

            {/* Core Technical Competencies */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Core Technical Competencies
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.competencies.map((comp) => (
                  <span
                    key={comp}
                    className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-[#141824] hover:bg-[#1c2233] text-slate-300 border border-[#242c40] transition"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. Flagship Security Engineering Project */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-400" />
              Flagship Security Engineering Project
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive architecture and cryptographic deliverables deployed in this system
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Project 1: Zero-Trust Encrypted File Vault */}
          <div className="bg-[#11141f] border border-[#202637] rounded-xl p-5 flex flex-col justify-between hover:border-red-500/40 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-red-950/80 text-red-400 border border-red-800/60">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">MedExchange-Crypto Zero-Trust Vault</h3>
                    <span className="text-[10px] text-slate-400 font-mono">AES-256-GCM + PBKDF2</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                  Active System
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Production-grade encrypted repository utilizing AES-256-GCM authenticated encryption. Incorporates PBKDF2-HMAC-SHA256 with 210,000 rounds for rigorous NIST SP 800-132 compliance.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-[#1d2334]">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Cryptographic Features:
                </h4>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>AES-256-GCM authenticated encryption (128-bit integrity tag)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>PBKDF2 key derivation with 210,000 iterations per-tenant salt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>Multi-tenant cryptographic data isolation and RBAC</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1d2334] flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('vault')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer shadow-xs active:scale-98"
              >
                <HardDrive className="w-3.5 h-3.5" />
                Launch Vault Storage
              </button>

              <button
                onClick={() => onNavigateTab('security_lab')}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1a1f30] hover:bg-[#232a40] text-slate-300 border border-[#2a344d] transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                Security Lab
              </button>
            </div>
          </div>

          {/* Project 2: FastAPI Cryptographic Core */}
          <div className="bg-[#11141f] border border-[#202637] rounded-xl p-5 flex flex-col justify-between hover:border-cyan-500/40 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">MedExchange-Crypto FastAPI Core</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Python 3.11 / Cryptography</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 font-mono">
                  Python 3.11 / Cryptography
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Standard-reference implementation built using <code className="text-cyan-300 font-mono text-[11px]">cryptography.hazmat.primitives.ciphers.aead.AESGCM</code> and <code className="text-cyan-300 font-mono text-[11px]">PBKDF2HMAC</code>.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-[#1d2334]">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Architectural Highlights:
                </h4>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Complete Python code with tamper verification logic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Ready-to-run cURL commands for all REST endpoints</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Zero-Trust validation: Reject tampered ciphertexts via AEAD tags</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1d2334]">
              <button
                onClick={() => onNavigateTab('fastapi_spec')}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#161d2d] hover:bg-[#1e273d] text-cyan-300 border border-cyan-800/50 transition cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                Inspect Python FastAPI Source & Specs
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Lightbox Modal for Photo */}
      {/* ------------------------------------------------------------- */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#11141f] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-red-400">DSC_8709.JPG</span>
                <span className="text-xs text-slate-400 font-mono">| 3128 x 2168 High Resolution</span>
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer text-xs"
              >
                Close (ESC)
              </button>
            </div>
            <div className="p-2 max-h-[80vh] flex items-center justify-center bg-black">
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="px-4 py-3 bg-[#0d0f17] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Zero-Trust Cryptography Laboratory · Kabale University</span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Edit Profile Details Modal */}
      {/* ------------------------------------------------------------- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121623] border border-[#273046] rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#21283a]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-red-400" />
                Edit Profile Details
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0d0f18] border border-[#293248] text-white focus:outline-none focus:border-red-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Role Badge</label>
                  <input
                    type="text"
                    value={editForm.titleBadge}
                    onChange={(e) => setEditForm({ ...editForm, titleBadge: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0d0f18] border border-[#293248] text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Co-Collaborator</label>
                  <input
                    type="text"
                    value={editForm.coCollaborator}
                    onChange={(e) => setEditForm({ ...editForm, coCollaborator: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0d0f18] border border-[#293248] text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Subtitle / Specialization</label>
                <input
                  type="text"
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0d0f18] border border-[#293248] text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0d0f18] border border-[#293248] text-white focus:outline-none focus:border-red-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">University</label>
                  <input
                    type="text"
                    value={editForm.university}
                    onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0d0f18] border border-[#293248] text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0d0f18] border border-[#293248] text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Professional Background & Vision</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0d0f18] border border-[#293248] text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-[#21283a] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
