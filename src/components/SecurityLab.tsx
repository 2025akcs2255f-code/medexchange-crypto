import { useState } from 'react';
import {
  ShieldCheck,
  Terminal,
  Cpu,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Step1KeyManagement } from './Step1KeyManagement';
import { Step2Sender } from './Step2Sender';
import { Step3Receiver } from './Step3Receiver';
import { Step4AttackLab } from './Step4AttackLab';
import { LiveConsole } from './LiveConsole';
import { CodeInspector } from './CodeInspector';
import { DiagnosticTestSuite } from './DiagnosticTestSuite';
import {
  CryptoPackage,
  DecryptionVerificationResult,
  LogEntry,
  RsaKeyPairInfo,
  TamperSimulationResult,
  TamperType,
} from '../types';

interface SecurityLabProps {
  aliceKeys: RsaKeyPairInfo | null;
  bobKeys: RsaKeyPairInfo | null;
  eveKeys: RsaKeyPairInfo | null;
  isGeneratingKeys: boolean;
  onRegenerateKeys: () => void;
  currentPackage: CryptoPackage | null;
  onSendRecord: (recordText: string) => Promise<CryptoPackage | null>;
  isSending: boolean;
  verificationResult: DecryptionVerificationResult | null;
  onReceiveRecord: () => Promise<any> | any;
  isReceiving: boolean;
  attackResult: TamperSimulationResult | null;
  onExecuteAttack: (type: TamperType, byteIndex?: number) => Promise<any> | any;
  isAttacking: boolean;
  logs: LogEntry[];
  onClearLogs: () => void;
  onRunFullDemo: () => void;
  onReset: () => void;
  isRunningDemo: boolean;
  onLogMessage: (msg: string, level?: LogEntry['level']) => void;
}

export const SecurityLab = ({
  aliceKeys,
  bobKeys,
  eveKeys,
  isGeneratingKeys,
  onRegenerateKeys,
  currentPackage,
  onSendRecord,
  isSending,
  verificationResult,
  onReceiveRecord,
  isReceiving,
  attackResult,
  onExecuteAttack,
  isAttacking,
  logs,
  onClearLogs,
  onRunFullDemo,
  onReset,
  isRunningDemo,
  onLogMessage,
}: SecurityLabProps) => {
  const [labTab, setLabTab] = useState<'pipeline' | 'console' | 'diagnostics' | 'inspector'>('pipeline');

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Banner & Tab Controls */}
      <div className="bg-[#11141f] border border-[#202637] rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2435]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-950/80 text-red-400 border border-red-800/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  MedExchange-Crypto Security Lab & Diagnostics
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-950/80 text-red-400 border border-red-800/80">
                  FIPS / NIST Tested
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                End-to-end transmission testing: RSA-PSS signing, AES-256-GCM authenticated encryption, and RSA-OAEP key unwrapping
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-lab-run-demo"
              onClick={onRunFullDemo}
              disabled={isRunningDemo}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningDemo ? 'animate-spin' : ''}`} />
              {isRunningDemo ? 'Running Simulation...' : 'Run Automated Pipeline'}
            </button>

            <button
              onClick={onReset}
              disabled={isRunningDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#181d2c] hover:bg-[#22293c] text-slate-300 border border-[#2b354d] transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset Lab
            </button>
          </div>
        </div>

        {/* Subtabs */}
        <div className="mt-3 flex items-center gap-2 text-xs overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setLabTab('pipeline')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
              labTab === 'pipeline'
                ? 'bg-red-950/80 text-red-300 font-semibold border border-red-800/80 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
            4-Step Transmission Pipeline
          </button>

          <button
            onClick={() => setLabTab('diagnostics')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
              labTab === 'diagnostics'
                ? 'bg-red-950/80 text-red-300 font-semibold border border-red-800/80 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Test Suite & Diagnostics (10 Tests)
          </button>

          <button
            onClick={() => setLabTab('console')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
              labTab === 'console'
                ? 'bg-red-950/80 text-red-300 font-semibold border border-red-800/80 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Live Execution Console ({logs.length})
          </button>

          <button
            onClick={() => setLabTab('inspector')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
              labTab === 'inspector'
                ? 'bg-red-950/80 text-red-300 font-semibold border border-red-800/80 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            Protocol & Cipher Inspector
          </button>
        </div>
      </div>

      {/* Lab Tab 1: 4-Step Pipeline */}
      {labTab === 'pipeline' && (
        <div className="space-y-6">
          <Step1KeyManagement
            aliceKeys={aliceKeys}
            bobKeys={bobKeys}
            eveKeys={eveKeys}
            onRegenerateKeys={onRegenerateKeys}
            isGenerating={isGeneratingKeys}
          />

          <Step2Sender
            aliceKeys={aliceKeys}
            bobKeys={bobKeys}
            currentPackage={currentPackage}
            onSendRecord={onSendRecord}
            isSending={isSending}
          />

          <Step3Receiver
            aliceKeys={aliceKeys}
            bobKeys={bobKeys}
            currentPackage={currentPackage}
            verificationResult={verificationResult}
            onReceiveRecord={onReceiveRecord}
            isReceiving={isReceiving}
          />

          <Step4AttackLab
            currentPackage={currentPackage}
            aliceKeys={aliceKeys}
            bobKeys={bobKeys}
            eveKeys={eveKeys}
            onExecuteAttack={onExecuteAttack}
            attackResult={attackResult}
            isAttacking={isAttacking}
          />
        </div>
      )}

      {/* Lab Tab 2: Test Suite */}
      {labTab === 'diagnostics' && (
        <DiagnosticTestSuite onLogMessage={onLogMessage} />
      )}

      {/* Lab Tab 3: Console */}
      {labTab === 'console' && (
        <LiveConsole logs={logs} onClearLogs={onClearLogs} />
      )}

      {/* Lab Tab 4: Inspector */}
      {labTab === 'inspector' && (
        <CodeInspector />
      )}
    </div>
  );
};
