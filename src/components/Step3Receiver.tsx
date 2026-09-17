import { CheckCircle2, XCircle, ShieldCheck, Clock, Lock, Key, FileCheck } from 'lucide-react';
import { CryptoPackage, DecryptionVerificationResult, RsaKeyPairInfo } from '../types';

interface Step3ReceiverProps {
  aliceKeys: RsaKeyPairInfo | null;
  bobKeys: RsaKeyPairInfo | null;
  currentPackage: CryptoPackage | null;
  verificationResult: DecryptionVerificationResult | null;
  onReceiveRecord: () => Promise<any> | any;
  isReceiving: boolean;
}

export const Step3Receiver = ({
  aliceKeys,
  bobKeys,
  currentPackage,
  verificationResult,
  onReceiveRecord,
  isReceiving,
}: Step3ReceiverProps) => {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              Receiver Operations (Tindiwensi Joseph Decrypting & Authenticating)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Executes cryptographic unwrapping, verifies AES-GCM tag integrity, unpacks binary payload, and audits Tukamushaba Derick's RSA-PSS digital signature.
          </p>
        </div>

        <button
          id="btn-decrypt-verify"
          onClick={onReceiveRecord}
          disabled={isReceiving || !currentPackage || !bobKeys || !aliceKeys}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:scale-98 transition shadow-xs disabled:opacity-50 cursor-pointer w-fit"
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${isReceiving ? 'animate-spin' : ''}`} />
          {isReceiving ? 'Decrypting & Verifying...' : 'Decrypt & Verify Package'}
        </button>
      </div>

      {/* Checkpoints & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        
        {/* Left Column: 3 Cryptographic Defense Checkpoints */}
        <div className="lg:col-span-6 space-y-3">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Verification Checkpoints
          </h3>

          {/* Checkpoint 1: RSA-OAEP Key Unwrap */}
          <div className={`p-3 rounded-lg border transition ${
            verificationResult?.checks.aesKeyRecovered
              ? 'bg-emerald-50/50 border-emerald-200'
              : verificationResult && !verificationResult.checks.aesKeyRecovered
              ? 'bg-rose-50/50 border-rose-200'
              : 'bg-slate-50/60 border-slate-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded bg-white shadow-xs text-indigo-600 mt-0.5">
                  <Key className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    1. Confidentiality: RSA-OAEP Key Unwrapping
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Unwraps encrypted 256-bit AES key using Tindiwensi Joseph's Private Key.
                  </p>
                </div>
              </div>
              {verificationResult?.checks.aesKeyRecovered ? (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Unwrapped
                </span>
              ) : verificationResult && !verificationResult.checks.aesKeyRecovered ? (
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Failed
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-mono">Pending</span>
              )}
            </div>
            {verificationResult && (
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Operation: RSA-OAEP-2048</span>
                <span>{verificationResult.timingMs.unwrapKey.toFixed(2)} ms</span>
              </div>
            )}
          </div>

          {/* Checkpoint 2: AES-GCM Integrity Tag */}
          <div className={`p-3 rounded-lg border transition ${
            verificationResult?.checks.integrityValid
              ? 'bg-emerald-50/50 border-emerald-200'
              : verificationResult && !verificationResult.checks.integrityValid
              ? 'bg-rose-50/50 border-rose-200'
              : 'bg-slate-50/60 border-slate-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded bg-white shadow-xs text-blue-600 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    2. Integrity: AES-GCM Authentication Tag Validation
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Validates the 128-bit authentication tag. Automatically rejects any transit tampering or bit flips.
                  </p>
                </div>
              </div>
              {verificationResult?.checks.integrityValid ? (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Tag Matched
                </span>
              ) : verificationResult && !verificationResult.checks.integrityValid ? (
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Tag Mismatch
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-mono">Pending</span>
              )}
            </div>
            {verificationResult && (
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Operation: AES-256-GCM AEAD</span>
                <span>{verificationResult.timingMs.aesDecrypt.toFixed(2)} ms</span>
              </div>
            )}
          </div>

          {/* Checkpoint 3: RSA-PSS Signature Verification */}
          <div className={`p-3 rounded-lg border transition ${
            verificationResult?.checks.signatureValid
              ? 'bg-emerald-50/50 border-emerald-200'
              : verificationResult && !verificationResult.checks.signatureValid
              ? 'bg-rose-50/50 border-rose-200'
              : 'bg-slate-50/60 border-slate-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded bg-white shadow-xs text-emerald-600 mt-0.5">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    3. Authentication & Non-Repudiation: RSA-PSS Verification
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Verifies cryptographic signature using Tukamushaba Derick's authentic Public Key. Confirms sender identity.
                  </p>
                </div>
              </div>
              {verificationResult?.checks.signatureValid ? (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Signature Valid
                </span>
              ) : verificationResult && !verificationResult.checks.signatureValid ? (
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Invalid Sig
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-mono">Pending</span>
              )}
            </div>
            {verificationResult && (
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Operation: RSA-PSS-2048 / SHA-256</span>
                <span>{verificationResult.timingMs.verifySignature.toFixed(2)} ms</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recovered Plaintext & Security Audit */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                Recovered Plaintext (Tindiwensi Joseph's Clinical EHR View)
              </h3>
              {verificationResult && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  Total: {verificationResult.timingMs.total.toFixed(2)} ms
                </span>
              )}
            </div>

            {verificationResult?.success && verificationResult.recoveredPlaintext ? (
              <div className="p-3.5 bg-emerald-50/40 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-emerald-200/60 text-emerald-800 text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Confidentiality & Non-Repudiation Verified. Authentic record from Tukamushaba Derick.</span>
                </div>
                <pre className="text-xs font-mono text-slate-900 whitespace-pre-wrap leading-relaxed">
                  {verificationResult.recoveredPlaintext}
                </pre>
              </div>
            ) : verificationResult && !verificationResult.success ? (
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Cryptographic Security Barrier Triggered: Verification Failed</span>
                </div>
                <p className="text-xs text-rose-700">
                  {verificationResult.error}
                </p>
                <div className="text-[11px] font-mono text-rose-600 bg-white/70 p-2 rounded border border-rose-200">
                  Exception Type: {verificationResult.errorType || 'OperationError'}
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 rounded-lg text-center bg-slate-50/50 text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                <Lock className="w-6 h-6 text-slate-300" />
                <p>No package decrypted yet. Click "Decrypt & Verify Package" to process incoming cryptographic transmission.</p>
              </div>
            )}
          </div>

          {/* Quick Security Guarantee Checklist */}
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Non-Repudiation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>AEAD Confidentiality</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span>Zero Plaintext Exposure</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
