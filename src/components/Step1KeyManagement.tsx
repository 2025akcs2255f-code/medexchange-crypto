import { useState } from 'react';
import { KeyRound, Shield, User, Copy, Check, RefreshCw, Eye, AlertTriangle } from 'lucide-react';
import { RsaKeyPairInfo } from '../types';

interface Step1KeyManagementProps {
  aliceKeys: RsaKeyPairInfo | null;
  bobKeys: RsaKeyPairInfo | null;
  eveKeys: RsaKeyPairInfo | null;
  onRegenerateKeys: () => void;
  isGenerating: boolean;
}

export const Step1KeyManagement = ({
  aliceKeys,
  bobKeys,
  eveKeys,
  onRegenerateKeys,
  isGenerating,
}: Step1KeyManagementProps) => {
  const [selectedKeyForModal, setSelectedKeyForModal] = useState<RsaKeyPairInfo | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              System Setup & Public Key Infrastructure (PKI)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Generates asymmetric RSA-2048 keypairs with dedicated mathematical roles for sender authentication and receiver key wrapping.
          </p>
        </div>

        <button
          id="btn-regen-keys"
          onClick={onRegenerateKeys}
          disabled={isGenerating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 active:scale-98 transition disabled:opacity-50 cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating Keys...' : 'Regenerate PKI Keypairs'}
        </button>
      </div>

      {/* Grid of Key Holders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        
        {/* Tukamushaba Derick (Sender) */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Tukamushaba Derick</h3>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Sender Role
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">2048-bit</span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Algorithm:</span>
                <span className="font-mono font-medium text-slate-800">RSA-PSS (SHA-256)</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Purpose:</span>
                <span className="font-medium text-emerald-700">Digital Signing (Non-Repudiation)</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 block mb-1">Public Key Fingerprint (SHA-256):</span>
                <code className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-700 block truncate">
                  {aliceKeys?.fingerprint || 'Generating...'}
                </code>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
            <button
              id="btn-view-alice-key"
              onClick={() => aliceKeys && setSelectedKeyForModal(aliceKeys)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3 h-3" /> View Public PEM
            </button>
            <button
              onClick={() => aliceKeys && handleCopy(aliceKeys.publicKeyPem, 'alice')}
              className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 cursor-pointer"
              title="Copy Public Key"
            >
              {copiedKey === 'alice' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'alice' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Tindiwensi Joseph (Receiver) */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Tindiwensi Joseph</h3>
                  <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    Receiver Role
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">2048-bit</span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Algorithm:</span>
                <span className="font-mono font-medium text-slate-800">RSA-OAEP (SHA-256)</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Purpose:</span>
                <span className="font-medium text-blue-700">Key Wrapping (Confidentiality)</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 block mb-1">Public Key Fingerprint (SHA-256):</span>
                <code className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-700 block truncate">
                  {bobKeys?.fingerprint || 'Generating...'}
                </code>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
            <button
              id="btn-view-bob-key"
              onClick={() => bobKeys && setSelectedKeyForModal(bobKeys)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3 h-3" /> View Public PEM
            </button>
            <button
              onClick={() => bobKeys && handleCopy(bobKeys.publicKeyPem, 'bob')}
              className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 cursor-pointer"
              title="Copy Public Key"
            >
              {copiedKey === 'bob' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'bob' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Eve (Adversary / Threat Simulator) */}
        <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Eve (Adversary)</h3>
                  <span className="text-[11px] font-medium text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded border border-amber-200">
                    Attack Prober
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-amber-700 font-mono">Unenrolled</span>
            </div>

            <div className="mt-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Rogue Keypair:</span>
                <span className="font-mono font-medium text-slate-800">RSA-PSS (Unauthorized)</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Simulation Goal:</span>
                <span className="font-medium text-amber-800">Test Impersonation & MitM Rejection</span>
              </div>
              <div className="pt-2 border-t border-amber-200/60">
                <span className="text-slate-500 block mb-1">Rogue Key Fingerprint:</span>
                <code className="text-[11px] font-mono bg-white px-2 py-1 rounded border border-amber-200 text-slate-700 block truncate">
                  {eveKeys?.fingerprint || 'Generating...'}
                </code>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between">
            <button
              id="btn-view-eve-key"
              onClick={() => eveKeys && setSelectedKeyForModal(eveKeys)}
              className="text-xs font-medium text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3 h-3" /> View Rogue PEM
            </button>
            <button
              onClick={() => eveKeys && handleCopy(eveKeys.publicKeyPem, 'eve')}
              className="text-slate-500 hover:text-slate-800 text-xs flex items-center gap-1 cursor-pointer"
              title="Copy Rogue Public Key"
            >
              {copiedKey === 'eve' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'eve' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

      </div>

      {/* Public Key Modal */}
      {selectedKeyForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  {selectedKeyForModal.name} — Public Key (SPKI)
                </h3>
              </div>
              <button
                onClick={() => setSelectedKeyForModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Algorithm: {selectedKeyForModal.algorithm}</span>
                <span>Fingerprint: {selectedKeyForModal.fingerprint}</span>
              </div>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto max-h-60 leading-relaxed select-all">
                {selectedKeyForModal.publicKeyPem}
              </pre>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => handleCopy(selectedKeyForModal.publicKeyPem, 'modal')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
              >
                {copiedKey === 'modal' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'modal' ? 'Copied to Clipboard' : 'Copy SPKI PEM'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
