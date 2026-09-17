import { useState } from 'react';
import { ShieldAlert, Zap, Bug, CheckCircle2, AlertOctagon, RefreshCcw, Lock } from 'lucide-react';
import { CryptoPackage, RsaKeyPairInfo, TamperSimulationResult, TamperType } from '../types';

interface Step4AttackLabProps {
  currentPackage: CryptoPackage | null;
  aliceKeys: RsaKeyPairInfo | null;
  bobKeys: RsaKeyPairInfo | null;
  eveKeys: RsaKeyPairInfo | null;
  onExecuteAttack: (type: TamperType, byteIndex?: number) => Promise<any> | any;
  attackResult: TamperSimulationResult | null;
  isAttacking: boolean;
}

export const Step4AttackLab = ({
  currentPackage,
  aliceKeys,
  bobKeys,
  eveKeys,
  onExecuteAttack,
  attackResult,
  isAttacking,
}: Step4AttackLabProps) => {
  const [selectedAttackType, setSelectedAttackType] = useState<TamperType>('ciphertext_byte');
  const [tamperByteIndex, setTamperByteIndex] = useState<number>(10);

  const handleRunAttack = (type = selectedAttackType) => {
    setSelectedAttackType(type);
    onExecuteAttack(type, tamperByteIndex);
  };

  const ciphertextLen = currentPackage?.ciphertext.length || 256;

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">
              4
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              Security Defense & Adversarial Attack Simulation Lab
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrates real-time defense against Man-in-the-Middle (MITM) tampering, bit flips, and rogue identity injection.
          </p>
        </div>

        {/* Python Demo 1-Click Trigger */}
        <button
          id="btn-python-attack-demo"
          onClick={() => handleRunAttack('ciphertext_byte')}
          disabled={isAttacking || !currentPackage}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 active:scale-98 transition shadow-xs disabled:opacity-50 cursor-pointer w-fit"
        >
          <Zap className="w-3.5 h-3.5" />
          Run Python Step 4 Attack (Byte 10 ^= 0xFF)
        </button>
      </div>

      {/* Attack Scenarios Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        
        {/* Scenario 1: MITM Ciphertext Tamper (Python default) */}
        <div
          onClick={() => setSelectedAttackType('ciphertext_byte')}
          className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
            selectedAttackType === 'ciphertext_byte'
              ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-rose-500" />
                MITM Ciphertext Bit Flip
              </span>
              <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                Python Step 4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Alters 1 single byte in the ciphertext in transit (<code className="font-mono text-slate-700">byte[10] ^= 0xFF</code>).
            </p>
            <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded font-mono">
              Target: AES-GCM Tag Check
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRunAttack('ciphertext_byte');
            }}
            disabled={isAttacking || !currentPackage}
            className="mt-3 w-full py-1.5 text-xs font-semibold rounded bg-rose-100 text-rose-800 hover:bg-rose-200 transition cursor-pointer disabled:opacity-50"
          >
            Launch MITM Tamper
          </button>
        </div>

        {/* Scenario 2: Corrupted Wrapped Key */}
        <div
          onClick={() => setSelectedAttackType('wrapped_key_byte')}
          className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
            selectedAttackType === 'wrapped_key_byte'
              ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-500" />
                Wrapped Key Tamper
              </span>
              <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                RSA-OAEP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Modifies encrypted AES key bits in the asymmetric envelope. Tests RSA-OAEP integrity and padding defenses.
            </p>
            <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded font-mono">
              Target: OAEP Padding Barrier
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRunAttack('wrapped_key_byte');
            }}
            disabled={isAttacking || !currentPackage}
            className="mt-3 w-full py-1.5 text-xs font-semibold rounded bg-purple-100 text-purple-800 hover:bg-purple-200 transition cursor-pointer disabled:opacity-50"
          >
            Tamper Wrapped Key
          </button>
        </div>

        {/* Scenario 3: Imposter Sender Identity (Rogue Key) */}
        <div
          onClick={() => setSelectedAttackType('imposter_sender_key')}
          className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
            selectedAttackType === 'imposter_sender_key'
              ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-500" />
                Imposter Sender Attack
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                Identity Spoof
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Eve attempts to forge a clinical record under Tukamushaba Derick's identity using a rogue private key.
            </p>
            <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded font-mono">
              Target: RSA-PSS Signature Verify
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRunAttack('imposter_sender_key');
            }}
            disabled={isAttacking || !currentPackage}
            className="mt-3 w-full py-1.5 text-xs font-semibold rounded bg-amber-100 text-amber-800 hover:bg-amber-200 transition cursor-pointer disabled:opacity-50"
          >
            Simulate Identity Fraud
          </button>
        </div>

      </div>

      {/* Interactive Tamper Byte Slider & Custom Execution */}
      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-700">
              Target Byte Index for Ciphertext Tampering:
            </label>
            <span className="font-mono text-indigo-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
              Byte #{tamperByteIndex} (of {ciphertextLen} bytes)
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(1, ciphertextLen - 1)}
            value={tamperByteIndex}
            onChange={(e) => setTamperByteIndex(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Byte 0 (Header)</span>
            <span>Byte 10 (Python Demo Step 4)</span>
            <span>Byte {ciphertextLen - 1} (Auth Tag Tail)</span>
          </div>
        </div>

        <button
          onClick={() => handleRunAttack('ciphertext_byte')}
          disabled={isAttacking || !currentPackage}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 active:scale-98 transition disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Test Tamper at Byte #{tamperByteIndex}
        </button>
      </div>

      {/* Live Attack Outcome & Defense Diagnostic Banner */}
      {attackResult && (
        <div className={`mt-4 p-4 rounded-lg border transition ${
          attackResult.defenseTriggered
            ? 'bg-emerald-50/60 border-emerald-300'
            : 'bg-rose-50/60 border-rose-300'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full mt-0.5 ${
              attackResult.defenseTriggered
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
            }`}>
              {attackResult.defenseTriggered ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  {attackResult.defenseTriggered
                    ? '[SUCCESSFUL DEFENSE] Integrity Check Passed Defense Barrier!'
                    : '[BREACH WARNING] Defense failed to catch tampering!'}
                </h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                  Caught: {attackResult.caughtErrorType}
                </span>
              </div>

              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {attackResult.explanation}
              </p>

              {attackResult.originalByte !== undefined && attackResult.modifiedByte !== undefined && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-4 text-xs font-mono text-slate-600">
                  <span>
                    Original Byte: <span className="text-slate-900 font-bold">0x{attackResult.originalByte.toString(16).padStart(2, '0').toUpperCase()}</span>
                  </span>
                  <span>→</span>
                  <span>
                    Tampered Byte: <span className="text-rose-600 font-bold">0x{attackResult.modifiedByte.toString(16).padStart(2, '0').toUpperCase()}</span>
                  </span>
                  <span className="text-emerald-700 font-medium">
                    (Bit difference: 8 bits flipped via XOR 0xFF)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
