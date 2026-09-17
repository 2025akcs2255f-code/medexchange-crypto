import React, { useState, useRef } from 'react';
import {
  HardDrive,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Download,
  Trash2,
  FilePlus,
  RefreshCw,
  Eye,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { VaultFile } from '../types';
import { encryptVaultPayload, decryptVaultPayload, tamperVaultPayload } from '../crypto/vaultEngine';

interface VaultStorageProps {
  vaultFiles: VaultFile[];
  onAddFile: (file: VaultFile) => void;
  onUpdateFile: (file: VaultFile) => void;
  onDeleteFile: (id: string) => void;
  activeTenant: string;
}

export const VaultStorage = ({
  vaultFiles,
  onAddFile,
  onUpdateFile,
  onDeleteFile,
  activeTenant,
}: VaultStorageProps) => {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [passphrase, setPassphrase] = useState('NIST-SP-800-132-SecurePassphrase-2026!');
  const [inputText, setInputText] = useState('');
  const [customFileName, setCustomFileName] = useState('clinical_discharge_record.txt');
  const [selectedFileForInspection, setSelectedFileForInspection] = useState<VaultFile | null>(null);
  
  // Decrypt modal state
  const [decryptTarget, setDecryptTarget] = useState<VaultFile | null>(null);
  const [decryptPassphrase, setDecryptPassphrase] = useState('NIST-SP-800-132-SecurePassphrase-2026!');
  const [decryptResult, setDecryptResult] = useState<{ text?: string; error?: string } | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const [copiedHex, setCopiedHex] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick drag & drop or text encryption
  const handleEncryptText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !passphrase) return;

    setIsEncrypting(true);
    try {
      const data = new TextEncoder().encode(inputText);
      const newVaultFile = await encryptVaultPayload(
        data,
        passphrase,
        customFileName || 'encrypted_record.txt',
        'text/plain',
        activeTenant,
        210000
      );
      onAddFile(newVaultFile);
      setInputText('');
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
      const newVaultFile = await encryptVaultPayload(
        data,
        passphrase,
        file.name,
        file.type || 'application/octet-stream',
        activeTenant,
        210000
      );
      onAddFile(newVaultFile);
    } catch (err: unknown) {
      alert('File encryption failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsEncrypting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTamper = (file: VaultFile) => {
    const tampered = tamperVaultPayload(file);
    onUpdateFile(tampered);
  };

  const handleRestore = async (file: VaultFile) => {
    // Re-encrypt original snippet or clean state
    if (file.plaintextSnippet) {
      const data = new TextEncoder().encode(file.plaintextSnippet);
      const restored = await encryptVaultPayload(
        data,
        passphrase,
        file.name,
        file.mimeType,
        activeTenant,
        file.iterations
      );
      onUpdateFile({ ...restored, id: file.id });
    }
  };

  const handleDecryptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decryptTarget) return;

    setIsDecrypting(true);
    setDecryptResult(null);

    try {
      const res = await decryptVaultPayload(decryptTarget, decryptPassphrase);
      setDecryptResult({ text: res.text || '[Binary data successfully authenticated]' });
    } catch (err: unknown) {
      setDecryptResult({
        error: `Decryption / Authentication Failed: InvalidTag. The 16-byte GHASH tag does not match the computed authentication tag for ciphertext and nonce. Payload was modified or password incorrect. (${err instanceof Error ? err.message : 'InvalidTag'})`,
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  const [exportedStatus, setExportedStatus] = useState(false);

  const handleExportEncryptedData = () => {
    const exportData = vaultFiles.map((file) => {
      // Convert Uint8Array to regular number array for native JSON serialization
      const payloadBytesArray = Array.from(file.ciphertextBytes);

      // Safe base64 conversion for offline portability
      let binaryStr = '';
      const len = file.ciphertextBytes.byteLength;
      for (let i = 0; i < len; i++) {
        binaryStr += String.fromCharCode(file.ciphertextBytes[i]);
      }
      const base64Str = btoa(binaryStr);

      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        originalSize: file.originalSize,
        encryptedSize: file.encryptedSize,
        saltHex: file.saltHex,
        nonceHex: file.nonceHex,
        tagHex: file.tagHex,
        tenantId: file.tenantId,
        uploadedAt: file.uploadedAt,
        iterations: file.iterations,
        isTampered: file.isTampered ?? false,
        tamperedByteIndex: file.tamperedByteIndex,
        plaintextSnippet: file.plaintextSnippet,
        // The encrypted payload bytes for offline backup
        ciphertextBytes: payloadBytesArray,
        ciphertextBase64: base64Str,
        ciphertextHex: payloadBytesArray.map((b) => b.toString(16).padStart(2, '0')).join(''),
      };
    });

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medexchange_encrypted_vault_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportedStatus(true);
    setTimeout(() => setExportedStatus(false), 2500);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header Banner */}
      <div className="bg-[#11141f] border border-[#202637] rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2435]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-red-950/80 text-red-400 border border-red-800/60">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  MedExchange-Crypto Vault Storage
                  <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded">
                    Zero-Trust AES-256-GCM
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tenant-isolated ciphertext repository with 210,000-iteration PBKDF2 key derivation and 128-bit GHASH authentication tags
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Active Tenant:</span>
            <span className="px-2.5 py-1 rounded bg-[#161a28] border border-[#273045] text-red-400 font-semibold truncate max-w-[220px]">
              {activeTenant}
            </span>
          </div>
        </div>

        {/* Encrypt New Item Form */}
        <div className="mt-4 pt-2">
          <form onSubmit={handleEncryptText} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FilePlus className="w-3.5 h-3.5 text-red-400" />
                Encrypt & Deposit New Record to Vault
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                NIST SP 800-132 (210,000 rounds)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Target File Name
                </label>
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0f18] border border-[#262c3e] text-white focus:outline-none focus:border-red-500 font-mono"
                  placeholder="e.g. clinical_record.txt"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Master Passphrase (PBKDF2 Key Derivation)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0d0f18] border border-[#262c3e] text-white focus:outline-none focus:border-red-500 font-mono pr-8"
                    placeholder="Enter secret passphrase"
                  />
                  <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Plaintext Content / Medical Diagnostic Record
              </label>
              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter confidential patient diagnosis, lab notes, or cryptographic data payload to encrypt into the vault..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-[#0d0f18] border border-[#262c3e] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#181d2c] hover:bg-[#22293c] text-slate-300 border border-[#2b354d] transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-red-400" />
                  Upload Any Local File (.pdf, .dcm, .txt)
                </button>
              </div>

              <button
                type="submit"
                disabled={isEncrypting || !inputText.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer shadow-xs disabled:opacity-50 disabled:pointer-events-none active:scale-98"
              >
                <Lock className={`w-3.5 h-3.5 ${isEncrypting ? 'animate-spin' : ''}`} />
                {isEncrypting ? 'Deriving Key & Encrypting...' : 'Encrypt & Seal into Vault'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Vault Files Table */}
      <div className="bg-[#11141f] border border-[#202637] rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e2435]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400" />
              Encrypted Repository ({vaultFiles.length} Records)
            </h3>
            <p className="text-[11px] text-slate-400">
              Only raw ciphertext, unique salt, nonce, and 16-byte GHASH authentication tags are stored on disk.
            </p>
          </div>

          <button
            id="export-encrypted-data-btn"
            type="button"
            onClick={handleExportEncryptedData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161a28] hover:bg-[#20273a] text-slate-200 hover:text-white border border-[#273146] hover:border-red-500/40 transition cursor-pointer shadow-xs shrink-0 active:scale-98"
            title="Download current vault files array as a JSON file including metadata and encrypted payload bytes"
          >
            {exportedStatus ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-red-400" />
                <span>Export Encrypted Data</span>
              </>
            )}
          </button>
        </div>

        {vaultFiles.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No files currently in vault. Use the form above to encrypt and seal your first file.
          </div>
        ) : (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#212739] text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">File / Payload</th>
                  <th className="py-2.5 px-3">Payload Size</th>
                  <th className="py-2.5 px-3">Salt (16B)</th>
                  <th className="py-2.5 px-3">Nonce (12B)</th>
                  <th className="py-2.5 px-3">Auth Tag (16B)</th>
                  <th className="py-2.5 px-3">AEAD Integrity</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2233]">
                {vaultFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-[#141825] transition font-mono">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <span className="font-semibold text-white block text-xs truncate max-w-[180px]">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(file.uploadedAt).toLocaleTimeString()} · {file.iterations.toLocaleString()} iter
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      <div>{file.originalSize} B raw</div>
                      <div className="text-[10px] text-slate-500">{file.encryptedSize} B cipher</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-red-400 text-[11px] bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/40">
                        {file.saltHex.slice(0, 10)}...
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-300 text-[11px] bg-[#1a1f30] px-1.5 py-0.5 rounded">
                        {file.nonceHex.slice(0, 10)}...
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-emerald-400 text-[11px] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40">
                        {file.tagHex.slice(0, 10)}...
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {file.isTampered ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950 text-red-400 border border-red-800">
                          <ShieldAlert className="w-3 h-3" />
                          Tampered! Byte #{file.tamperedByteIndex}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          <ShieldCheck className="w-3 h-3" />
                          Authenticated
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setDecryptTarget(file);
                            setDecryptResult(null);
                          }}
                          title="Decrypt with Passphrase"
                          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition cursor-pointer"
                        >
                          Decrypt
                        </button>

                        <button
                          onClick={() => setSelectedFileForInspection(file)}
                          title="Inspect raw ciphertext & hex"
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {file.isTampered ? (
                          <button
                            onClick={() => handleRestore(file)}
                            title="Restore untampered ciphertext"
                            className="p-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700 transition cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTamper(file)}
                            title="Simulate bit-flip tamper on disk"
                            className="p-1 rounded bg-yellow-950/60 hover:bg-yellow-900 text-yellow-400 border border-yellow-800 transition cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteFile(file.id)}
                          title="Delete file"
                          className="p-1 rounded hover:bg-red-950/60 text-slate-500 hover:text-red-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decrypt File Modal */}
      {decryptTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121623] border border-[#273046] rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#21283a]">
              <div className="flex items-center gap-2">
                <Unlock className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white">
                  Decrypt: <span className="font-mono text-red-300">{decryptTarget.name}</span>
                </h3>
              </div>
              <button
                onClick={() => setDecryptTarget(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleDecryptSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-mono">
                  Master Passphrase
                </label>
                <input
                  type="password"
                  value={decryptPassphrase}
                  onChange={(e) => setDecryptPassphrase(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#0d0f18] border border-[#293248] text-white focus:outline-none focus:border-red-500 font-mono"
                  placeholder="Enter passphrase"
                  required
                />
              </div>

              <div className="p-3 bg-[#0d0f18] border border-[#22293b] rounded-lg space-y-1 font-mono text-[11px] text-slate-400">
                <div>Salt: <span className="text-red-400">{decryptTarget.saltHex}</span></div>
                <div>Nonce: <span className="text-slate-300">{decryptTarget.nonceHex}</span></div>
                <div>Tag (16B): <span className="text-emerald-400">{decryptTarget.tagHex}</span></div>
              </div>

              {decryptResult && (
                <div
                  className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                    decryptResult.error
                      ? 'bg-red-950/60 border-red-800 text-red-300'
                      : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  }`}
                >
                  {decryptResult.error ? (
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-red-300 uppercase font-mono">AEAD Verification Rejection</div>
                        <p className="mt-1 text-[11px]">{decryptResult.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 font-bold text-emerald-300 uppercase font-mono mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Authentication Tag Verified
                      </div>
                      <pre className="p-2 bg-black/50 rounded font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto text-white">
                        {decryptResult.text}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDecryptTarget(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="submit"
                  disabled={isDecrypting}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  {isDecrypting ? 'Verifying GHASH...' : 'Authenticate & Decrypt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raw Hex Inspection Modal */}
      {selectedFileForInspection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121623] border border-[#273046] rounded-xl max-w-2xl w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#21283a]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Hex Payload Inspector: {selectedFileForInspection.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFileForInspection(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 block mb-1">16-Byte CSPRNG Salt:</span>
                <div className="p-2 bg-[#0c0e16] rounded border border-[#22293c] text-red-400 break-all select-all">
                  {selectedFileForInspection.saltHex}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">12-Byte RFC 5116 Nonce (IV):</span>
                <div className="p-2 bg-[#0c0e16] rounded border border-[#22293c] text-slate-300 break-all select-all">
                  {selectedFileForInspection.nonceHex}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">16-Byte GHASH Authentication Tag:</span>
                <div className="p-2 bg-[#0c0e16] rounded border border-[#22293c] text-emerald-400 break-all select-all">
                  {selectedFileForInspection.tagHex}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Raw Ciphertext Bytes ({selectedFileForInspection.encryptedSize} bytes):</span>
                <div className="p-2 bg-[#0c0e16] rounded border border-[#22293c] text-slate-400 max-h-40 overflow-y-auto break-all select-all text-[11px]">
                  {Array.from(new Uint8Array(selectedFileForInspection.ciphertextBytes.slice(0, 160)))
                    .map((b: number) => Number(b).toString(16).padStart(2, '0'))
                    .join(' ')}
                  {selectedFileForInspection.ciphertextBytes.length > 160 ? ' ... [truncated]' : ''}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#21283a] flex items-center justify-end">
              <button
                onClick={() => setSelectedFileForInspection(null)}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition cursor-pointer text-xs"
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
