import { useState } from 'react';
import { Send, Lock, FileText, CheckCircle2, ChevronRight, Hash, Layers } from 'lucide-react';
import { CryptoPackage, RsaKeyPairInfo } from '../types';
import { SAMPLE_RECORDS } from '../data/samples';
import { formatHexPretty } from '../crypto/engine';

interface Step2SenderProps {
  aliceKeys: RsaKeyPairInfo | null;
  bobKeys: RsaKeyPairInfo | null;
  currentPackage: CryptoPackage | null;
  onSendRecord: (recordText: string) => Promise<any> | any;
  isSending: boolean;
}

export const Step2Sender = ({
  aliceKeys,
  bobKeys,
  currentPackage,
  onSendRecord,
  isSending,
}: Step2SenderProps) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>('script-default');
  const [recordText, setRecordText] = useState<string>(SAMPLE_RECORDS[0].content);
  const [showHexDetails, setShowHexDetails] = useState<boolean>(false);

  const handleSampleChange = (id: string) => {
    setSelectedSampleId(id);
    const found = SAMPLE_RECORDS.find(s => s.id === id);
    if (found) {
      setRecordText(found.content);
    }
  };

  const handleTriggerSend = () => {
    if (!recordText.trim()) return;
    onSendRecord(recordText);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              Sender Operations (Tukamushaba Derick Transmitting to Tindiwensi Joseph)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Constructs a verifiable cryptographic bundle: signs with Tukamushaba Derick's Private Key, encrypts with ephemeral AES-256-GCM, and wraps the AES key with Tindiwensi Joseph's Public Key.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Clinical Sample:</label>
          <select
            id="select-sample-record"
            value={selectedSampleId}
            onChange={(e) => handleSampleChange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-indigo-500 cursor-pointer"
          >
            {SAMPLE_RECORDS.map(s => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Input Record vs Cryptographic Processing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        
        {/* Left Column: Plaintext Clinical EHR Note */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Plaintext Medical Record (PHI)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {new TextEncoder().encode(recordText).length} bytes
              </span>
            </div>

            <textarea
              id="input-medical-record"
              value={recordText}
              onChange={(e) => setRecordText(e.target.value)}
              rows={6}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-indigo-500 resize-none transition leading-relaxed"
              placeholder="Enter patient diagnosis, medication, and clinical notes..."
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Protected Health Information (PHI) subjected to HIPAA compliance in transit.
            </p>
          </div>

          <button
            id="btn-encrypt-transmit"
            onClick={handleTriggerSend}
            disabled={isSending || !aliceKeys || !bobKeys}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-bounce' : ''}`} />
            {isSending ? 'Signing & Encrypting...' : 'Sign, Encrypt & Bundle for Tindiwensi Joseph'}
          </button>
        </div>

        {/* Right Column: 3-Layer Cryptographic Construction */}
        <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200 rounded-lg p-4 space-y-3.5">
          <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Cryptographic Transmission Bundle Architecture
            </span>
            {currentPackage && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Transmitted
              </span>
            )}
          </div>

          {/* Step Flow Indicators */}
          <div className="space-y-2.5 text-xs">
            
            {/* Step 1: RSA-PSS Signature */}
            <div className="p-2.5 rounded-md bg-white border border-slate-200 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
                1
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">1. Non-Repudiation (Digital Signature)</span>
                  <span className="text-[11px] font-mono text-slate-500">RSA-PSS / SHA-256</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tukamushaba Derick signs clinical plaintext using their Private Key (2048 bits = 256 bytes signature).
                </p>
                {currentPackage?.signatureHex && (
                  <div className="mt-1.5 font-mono text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 truncate">
                    Signature: {formatHexPretty(currentPackage.signatureHex, 16)}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Binary Packaging & AES-GCM */}
            <div className="p-2.5 rounded-md bg-white border border-slate-200 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
                2
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">2. Confidentiality & Integrity (Payload Encryption)</span>
                  <span className="text-[11px] font-mono text-slate-500">AES-256-GCM</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Bundles <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">[4B len] + [sig] + [record]</code> and encrypts with a fresh 256-bit AES key + 96-bit nonce.
                </p>
                {currentPackage && (
                  <div className="mt-1.5 grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="bg-slate-50 p-1.5 rounded border border-slate-100 truncate">
                      <span className="text-slate-400 block">Nonce (12B):</span>
                      <span className="text-slate-700">{formatHexPretty(currentPackage.nonce ? Array.from(currentPackage.nonce).map(b => b.toString(16).padStart(2, '0')).join('') : '', 6)}</span>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded border border-slate-100 truncate">
                      <span className="text-slate-400 block">Ciphertext ({currentPackage.ciphertext.length}B):</span>
                      <span className="text-slate-700">{formatHexPretty(Array.from(currentPackage.ciphertext).map(b => b.toString(16).padStart(2, '0')).join(''), 6)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: RSA-OAEP Key Wrapping */}
            <div className="p-2.5 rounded-md bg-white border border-slate-200 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
                3
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">3. Key Wrapping (Asymmetric Envelope)</span>
                  <span className="text-[11px] font-mono text-slate-500">RSA-OAEP / Tindiwensi Joseph PubKey</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  The random 256-bit AES key is encrypted with Tindiwensi Joseph's Public Key. Only Tindiwensi Joseph's Private Key can unlock it.
                </p>
                {currentPackage && (
                  <div className="mt-1.5 font-mono text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 truncate">
                    Wrapped Key: {formatHexPretty(Array.from(currentPackage.encryptedAesKey).map(b => b.toString(16).padStart(2, '0')).join(''), 16)}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Toggle Raw Hex Inspection */}
          {currentPackage && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <button
                id="btn-toggle-hex"
                onClick={() => setShowHexDetails(!showHexDetails)}
                className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Hash className="w-3 h-3" />
                {showHexDetails ? 'Hide Detailed Hex Dump' : 'Inspect Wire Transmission Hex Bytes'}
              </button>
              <span className="text-slate-400 font-mono">
                Total Wire Size: {currentPackage.nonce.length + currentPackage.ciphertext.length + currentPackage.encryptedAesKey.length} bytes
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Expandable Wire Dump */}
      {showHexDetails && currentPackage && (
        <div className="mt-4 p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono space-y-2 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
            <span>[DEMO: WIRE CRYPTO PACKAGE]</span>
            <span>Nonce: 12B | Wrapped Key: 256B | Ciphertext: {currentPackage.ciphertext.length}B</span>
          </div>
          <div>
            <span className="text-amber-400 block text-[11px]">nonce (96 bits / 12 bytes):</span>
            <p className="text-slate-300 break-all select-all text-[11px] bg-slate-950 p-1.5 rounded">
              {Array.from(currentPackage.nonce).map(b => b.toString(16).padStart(2, '0')).join('')}
            </p>
          </div>
          <div>
            <span className="text-blue-400 block text-[11px]">encrypted_aes_key (RSA-OAEP wrapped, 256 bytes):</span>
            <p className="text-slate-300 break-all select-all text-[11px] bg-slate-950 p-1.5 rounded max-h-20 overflow-y-auto">
              {Array.from(currentPackage.encryptedAesKey).map(b => b.toString(16).padStart(2, '0')).join('')}
            </p>
          </div>
          <div>
            <span className="text-emerald-400 block text-[11px]">ciphertext + 16B AES-GCM Auth Tag ({currentPackage.ciphertext.length} bytes):</span>
            <p className="text-slate-300 break-all select-all text-[11px] bg-slate-950 p-1.5 rounded max-h-20 overflow-y-auto">
              {Array.from(currentPackage.ciphertext).map(b => b.toString(16).padStart(2, '0')).join('')}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
