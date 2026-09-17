import { useState } from 'react';
import { Copy, Check, Shield, FileCode2, BookOpen } from 'lucide-react';
import { PYTHON_SCRIPT_CODE } from '../data/samples';

export const CodeInspector = () => {
  const [copiedPython, setCopiedPython] = useState(false);

  const handleCopyPython = () => {
    navigator.clipboard.writeText(PYTHON_SCRIPT_CODE);
    setCopiedPython(true);
    setTimeout(() => setCopiedPython(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Cryptographic Primitives Deep-Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">RSA-PSS (Probabilistic Signature)</h3>
              <span className="text-[10px] text-emerald-700 font-semibold">Non-Repudiation</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Superior to deterministic PKCS#1 v1.5. Uses randomized salt (32 bytes) with MGF1 and SHA-256. Prevents forgery even if multiple identical records are signed.
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
            NIST SP 800-56B Rev. 2
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">AES-256-GCM (AEAD)</h3>
              <span className="text-[10px] text-blue-700 font-semibold">Confidentiality & Integrity</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Galois/Counter Mode provides Authenticated Encryption. Generates a 128-bit authentication tag that instantly rejects any modified transit ciphertext prior to decryption.
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
            NIST SP 800-38D Approved
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">RSA-OAEP (Optimal Padding)</h3>
              <span className="text-[10px] text-purple-700 font-semibold">Key Wrapping Envelope</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Protects symmetric 256-bit AES keys with Tindiwensi Joseph's public key. Immune to Bleichenbacher chosen-ciphertext padding oracle attacks that plague legacy schemes.
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
            PKCS#1 v2.2 Standard
          </div>
        </div>

      </div>

      {/* Wire Protocol Layout */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Binary Wire Serialization & Encapsulation Specification
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          How the multi-layer cryptographic envelope is serialized for wire transmission:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="p-2.5 font-semibold">Field Name</th>
                <th className="p-2.5 font-semibold">Size</th>
                <th className="p-2.5 font-semibold">Cryptographic Primitive</th>
                <th className="p-2.5 font-semibold">Security Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-2.5 font-mono text-indigo-700 font-medium">nonce</td>
                <td className="p-2.5 font-mono">12 bytes (96 bits)</td>
                <td className="p-2.5">CSPRNG os.urandom / crypto.getRandomValues</td>
                <td className="p-2.5 text-slate-600">Prevents replay attacks & ensures uniqueness in AES-GCM</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono text-purple-700 font-medium">encrypted_aes_key</td>
                <td className="p-2.5 font-mono">256 bytes</td>
                <td className="p-2.5">RSA-OAEP-2048 (SHA-256)</td>
                <td className="p-2.5 text-slate-600">Wraps 256-bit symmetric session key for Tindiwensi Joseph's eyes only</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono text-blue-700 font-medium">ciphertext</td>
                <td className="p-2.5 font-mono">Variable + 16 bytes</td>
                <td className="p-2.5">AES-256-GCM AEAD</td>
                <td className="p-2.5 text-slate-600">Protects <code className="bg-slate-100 px-1 rounded">[4B sig_len][sig][record]</code> + Auth Tag</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono text-emerald-700 font-medium">└ payload.sig_len</td>
                <td className="p-2.5 font-mono">4 bytes (big-endian)</td>
                <td className="p-2.5">uint32 integer</td>
                <td className="p-2.5 text-slate-600">Demarcates variable signature length (256 bytes for RSA-2048)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-mono text-emerald-700 font-medium">└ payload.signature</td>
                <td className="p-2.5 font-mono">256 bytes</td>
                <td className="p-2.5">RSA-PSS (SHA-256)</td>
                <td className="p-2.5 text-slate-600">Cryptographically binds clinical record to Tukamushaba Derick's private key</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Python Code Snippet Viewer */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-semibold text-slate-200">
              Python Reference Implementation (cryptography module)
            </span>
          </div>
          <button
            onClick={handleCopyPython}
            className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedPython ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedPython ? 'Copied' : 'Copy Python Source'}
          </button>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[500px]">
          {PYTHON_SCRIPT_CODE}
        </pre>
      </div>

    </div>
  );
};
