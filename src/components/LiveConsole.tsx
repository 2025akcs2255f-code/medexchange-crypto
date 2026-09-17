import { useRef, useEffect } from 'react';
import { Terminal, Copy, Trash2, Download, Check } from 'lucide-react';
import { useState } from 'react';
import { LogEntry } from '../types';

interface LiveConsoleProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LiveConsole = ({ logs, onClearLogs }: LiveConsoleProps) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyLogs = () => {
    const fullText = logs.map(l => l.message).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const fullText = logs.map(l => l.message).join('\n');
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medexchange-crypto-demo-${new Date().toISOString().slice(0, 10)}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[600px]">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-slate-400 text-xs font-mono ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            medexchange_crypto_demo.py — bash interactive execution
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyLogs}
            className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 flex items-center gap-1 transition cursor-pointer"
            title="Copy entire terminal log"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={handleDownloadLogs}
            className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 flex items-center gap-1 transition cursor-pointer"
            title="Download log file"
          >
            <Download className="w-3 h-3" />
            Export
          </button>

          <button
            onClick={onClearLogs}
            className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 flex items-center gap-1 transition cursor-pointer"
            title="Clear output"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Terminal Content Area */}
      <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-slate-300 space-y-1 select-text leading-relaxed">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic py-8 text-center">
            Terminal ready. Click "Run Full Python Demo" or interact with any step in the pipeline.
          </div>
        ) : (
          logs.map((log) => {
            let textColor = 'text-slate-300';
            if (log.level === 'success') textColor = 'text-emerald-400 font-semibold';
            if (log.level === 'warn') textColor = 'text-amber-400';
            if (log.level === 'error') textColor = 'text-rose-400 font-bold';
            if (log.level === 'crypto') textColor = 'text-cyan-400';

            return (
              <div key={log.id} className="whitespace-pre-wrap break-words font-mono min-h-[1.25rem]">
                <span className={textColor}>{log.message || '\u00A0'}</span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Status Footer */}
      <div className="bg-slate-900/90 px-4 py-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span>FIPS 140-3 Cryptographic Engine: Active</span>
        <span>Lines: {logs.length}</span>
      </div>
    </div>
  );
};
