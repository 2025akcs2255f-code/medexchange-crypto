import React, { useState, useRef } from 'react';
import { Lock, KeyRound, FileText, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { VaultFile } from '../types';
import { encryptVaultPayload } from '../crypto/vaultEngine';

interface EncryptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFile: (file: VaultFile) => void;
  activeTenant: string;
}

export const EncryptModal = ({
  isOpen,
  onClose,
  onAddFile,
  activeTenant,
}: EncryptModalProps) => {
  const [filename, setFilename] = useState('medical_ehr_discharge.txt');
  const [passphrase, setPassphrase] = useState('NIST-SP-800-132-SecurePassphrase-2026!');
  const [plaintext, setPlaintext] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [lastEncrypted, setLastEncrypted] = useState<VaultFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plaintext.trim() || !passphrase) return;

    setIsEncrypting(true);
    try {
      const data = new TextEncoder().encode(plaintext);
      const vaultFile = await encryptVaultPayload(
        data,
        passphrase,
        filename || 'record.txt',
        'text/plain',
        activeTenant,
        210000
      );
      onAddFile(vaultFile);
      setLastEncrypted(vaultFile);
    } catch (err: unknown) {
      alert('Encryption failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !passphrase) return;

    setIsEncrypting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const vaultFile = await encryptVaultPayload(
        data,
        passphrase,
        file.name,
        file.type || 'application/octet-stream',
        activeTenant,
        210000
      );
      onAddFile(vaultFile);
      setLastEncrypted(vaultFile);
    } catch (err: unknown) {
      alert('Encryption failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121623] border border-[#273046] rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4 text-slate-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-[#21283a]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-red-950/80 text-red-400 border border-red-800/60">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                MedExchange-Crypto Encryption (AES-256-GCM)
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                PBKDF2-HMAC-SHA256 (210,000 rounds NIST SP 800-132)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {lastEncrypted ? (
          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>File Encrypted & Deposited in Vault!</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Successfully generated 16-byte random salt, derived 256-bit AES key with 210,000 iterations, and sealed ciphertext with a 16-byte GHASH authentication tag.
              </p>
              <div className="font-mono text-[10px] space-y-1 pt-1 text-slate-400">
                <div>File: <span className="text-white">{lastEncrypted.name}</span></div>
                <div>Salt: <span className="text-red-400">{lastEncrypted.saltHex}</span></div>
                <div>Nonce: <span className="text-slate-300">{lastEncrypted.nonceHex}</span></div>
                <div>Tag (16B): <span className="text-emerald-400">{lastEncrypted.tagHex}</span></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setLastEncrypted(null);
                  setPlaintext('');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Encrypt Another
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                Go to Vault
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEncrypt} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px]">
                Target File Name
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0d0f18] border border-[#293248] text-white focus:outline-none focus:border-red-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px]">
                Master Passphrase
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0d0f18] border border-[#293248] text-white focus:outline-none focus:border-red-500 font-mono pr-8"
                  required
                />
                <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px]">
                Plaintext / Clinical Data
              </label>
              <textarea
                rows={4}
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                placeholder="Enter confidential clinical diagnosis, referral notes, or raw payload..."
                className="w-full px-3 py-2 rounded-lg bg-[#0d0f18] border border-[#293248] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isEncrypting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#181d2c] hover:bg-[#22293c] text-slate-300 border border-[#2b354d] transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-red-400" />
                Select File
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEncrypting || !plaintext.trim()}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Lock className={`w-3.5 h-3.5 ${isEncrypting ? 'animate-spin' : ''}`} />
                  {isEncrypting ? 'Encrypting...' : 'Encrypt & Seal'}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
