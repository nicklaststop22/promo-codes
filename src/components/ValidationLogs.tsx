import React, { useState } from 'react';
import {
  FileText,
  Download,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingDown,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { ValidationLogEntry } from '../types';

interface ValidationLogsProps {
  logs: ValidationLogEntry[];
  onClearLogs: () => void;
  onApplyCodeToSandbox: (field: 'field1' | 'field2', code: string) => void;
}

export const ValidationLogs: React.FC<ValidationLogsProps> = ({
  logs,
  onClearLogs,
  onApplyCodeToSandbox,
}) => {
  const [filter, setFilter] = useState<'all' | 'hits' | 'invalid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const successfulHits = logs.filter((l) => l.outcome === 'SUCCESS');
  const bestHit = successfulHits.reduce<ValidationLogEntry | null>((best, current) => {
    if (!best || current.savings > best.savings) return current;
    return best;
  }, null);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'hits' && log.outcome !== 'SUCCESS') return false;
    if (filter === 'invalid' && log.outcome === 'SUCCESS') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.code.toLowerCase().includes(q) ||
        log.fieldName.toLowerCase().includes(q) ||
        log.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'Field', 'Code', 'Status', 'Before Price', 'After Price', 'Savings ($)', 'Savings (%)', 'Message'];
    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.fieldName}"`,
      `"${l.code}"`,
      `"${l.outcome}"`,
      l.beforePrice.toFixed(2),
      l.afterPrice.toFixed(2),
      l.savings.toFixed(2),
      l.savingsPercent.toFixed(1),
      `"${l.message.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `coupon-validation-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportJSON = () => {
    if (logs.length === 0) return;
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `coupon-validation-log-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Header & KPI Summary */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Validation History & Verification Log
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>{logs.length} Total Attempts</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">{successfulHits.length} Valid Hits Discovered</span>
            {bestHit && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-indigo-300 font-mono">
                  Best Code: {bestHit.code} (-${bestHit.savings.toFixed(2)})
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={handleExportJSON}
            disabled={logs.length === 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 text-slate-400 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Logs ({logs.length})
          </button>
          <button
            onClick={() => setFilter('hits')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
              filter === 'hits'
                ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Valid Hits ({successfulHits.length})
          </button>
          <button
            onClick={() => setFilter('invalid')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'invalid' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Invalid ({logs.length - successfulHits.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, target, or outcome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table Data Area */}
      <div className="flex-1 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-600/60" />
            <div className="text-sm font-medium text-slate-400">No validation logs yet</div>
            <p className="text-xs max-w-sm mx-auto text-slate-500">
              Run automation or step through your wordlist to test coupons against the sandbox checkout.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider sticky top-0 border-b border-slate-800 z-10">
              <tr>
                <th className="py-2.5 px-4">Time</th>
                <th className="py-2.5 px-4">Field</th>
                <th className="py-2.5 px-4">Tested Code</th>
                <th className="py-2.5 px-4">Outcome</th>
                <th className="py-2.5 px-4 text-right">Price Before</th>
                <th className="py-2.5 px-4 text-right">Price After</th>
                <th className="py-2.5 px-4 text-right">Savings</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {filteredLogs.map((entry) => {
                const isSuccess = entry.outcome === 'SUCCESS';
                return (
                  <tr
                    key={entry.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSuccess ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {entry.timestamp}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[11px] font-medium ${
                          entry.fieldTarget === 'field1'
                            ? 'text-indigo-400'
                            : 'text-purple-400'
                        }`}
                      >
                        {entry.fieldName}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-200">
                      {entry.code}
                    </td>
                    <td className="py-2.5 px-4">
                      {isSuccess ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>VALID (-${entry.savings.toFixed(2)})</span>
                        </span>
                      ) : entry.outcome === 'RATE_LIMITED' ? (
                        <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Rate Limited (429)</span>
                        </span>
                      ) : entry.outcome === 'CAPTCHA_BLOCKED' ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>Captcha Blocked</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          <span>Invalid Code</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-400 tabular-nums">
                      ${entry.beforePrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-200 tabular-nums">
                      ${entry.afterPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold">
                      {isSuccess ? (
                        <span className="text-emerald-400">
                          -${entry.savings.toFixed(2)} ({entry.savingsPercent.toFixed(0)}%)
                        </span>
                      ) : (
                        <span className="text-slate-600">$0.00</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleCopyCode(entry.id, entry.code)}
                          title="Copy code"
                          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {copiedId === entry.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {isSuccess && (
                          <button
                            onClick={() =>
                              onApplyCodeToSandbox(
                                entry.fieldTarget === 'field2' ? 'field2' : 'field1',
                                entry.code
                              )
                            }
                            title="Apply this winning code in sandbox"
                            className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white rounded text-[11px] font-medium transition-colors"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
