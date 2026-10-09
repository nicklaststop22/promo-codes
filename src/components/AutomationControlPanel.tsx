import React, { useRef } from 'react';
import {
  Tag,
  MousePointerClick,
  DollarSign,
  Trash2,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Upload,
  Sparkles,
  FileText,
  Sliders,
  Crosshair,
  Check,
  AlertCircle,
  Wand2,
  ShieldAlert,
  Clock
} from 'lucide-react';
import {
  SelectorConfig,
  AutomationSettings,
  QueueConfig,
  TargetSlot,
  QueueInputMode
} from '../types';

interface AutomationControlPanelProps {
  selectors: SelectorConfig;
  onArmInspector: (slot: TargetSlot) => void;
  activeInspectSlot: TargetSlot | null;
  settings: AutomationSettings;
  onUpdateSettings: (settings: Partial<AutomationSettings>) => void;
  queue1: QueueConfig;
  queue2: QueueConfig;
  onUpdateQueue: (queueId: 'queue1' | 'queue2', updates: Partial<QueueConfig>) => void;
  onGenerateQueueCodes: (queueId: 'queue1' | 'queue2') => void;
  onOpenScraperModal: () => void;
  isRunning: boolean;
  isPaused: boolean;
  onStartAutomation: () => void;
  onPauseAutomation: () => void;
  onStepAutomation: () => void;
  onResetAutomation: () => void;
  activeQueueTab: 'queue1' | 'queue2';
  onSetActiveQueueTab: (tab: 'queue1' | 'queue2') => void;
  currentRunningCode: string | null;
  currentRunningField: string | null;
  totalAttemptsCount: number;
  activeCooldownSeconds?: number;
  cooldownReason?: string | null;
}

export const AutomationControlPanel: React.FC<AutomationControlPanelProps> = ({
  selectors,
  onArmInspector,
  activeInspectSlot,
  settings,
  onUpdateSettings,
  queue1,
  queue2,
  onUpdateQueue,
  onGenerateQueueCodes,
  onOpenScraperModal,
  isRunning,
  isPaused,
  onStartAutomation,
  onPauseAutomation,
  onStepAutomation,
  onResetAutomation,
  activeQueueTab,
  onSetActiveQueueTab,
  currentRunningCode,
  currentRunningField,
  totalAttemptsCount,
  activeCooldownSeconds = 0,
  cooldownReason = null,
}) => {
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const activeQueue = activeQueueTab === 'queue1' ? queue1 : queue2;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, queueId: 'queue1' | 'queue2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const parsedCodes = content
        .split(/[\r\n,]+/)
        .map((c) => c.trim().toUpperCase())
        .filter((c) => c.length > 0);

      onUpdateQueue(queueId, {
        mode: 'file',
        rawText: parsedCodes.join('\n'),
        codes: parsedCodes,
        currentIndex: 0,
      });
    };
    reader.readAsText(file);
  };

  const handleTextareaChange = (text: string, queueId: 'queue1' | 'queue2') => {
    const parsedCodes = text
      .split(/[\r\n,]+/)
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0);

    onUpdateQueue(queueId, {
      rawText: text,
      codes: parsedCodes,
      currentIndex: 0,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
      {/* Extension Header matching screenshot */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Promo Codes Applier
            </h2>
            <p className="text-[10px] text-slate-400">Dual-Field Wordlist & Coupon Engine</p>
          </div>
        </div>

        {isRunning && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse">
            {isPaused ? 'PAUSED' : 'RUNNING'}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* DOM Target Selectors Area (Screenshot Style) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>DOM Target Selectors</span>
            <span className="text-[10px] text-indigo-400 font-normal">Click slot to inspect or right-click sandbox</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {/* Field 1 Input */}
            <button
              onClick={() => onArmInspector('field1Input')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                activeInspectSlot === 'field1Input'
                  ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 ring-2 ring-indigo-500/30'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-indigo-400 font-bold">⌶</span>
                <span className="font-medium">Field 1 Input (Coupon)</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[130px]">
                {selectors.field1Input || 'Click to select'}
              </span>
            </button>

            {/* Field 1 Apply Button */}
            <button
              onClick={() => onArmInspector('field1Apply')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                activeInspectSlot === 'field1Apply'
                  ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 ring-2 ring-indigo-500/30'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium">Field 1 Apply Button</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[130px]">
                {selectors.field1Apply || 'Click to select'}
              </span>
            </button>

            {/* Field 2 Input */}
            <button
              onClick={() => onArmInspector('field2Input')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                activeInspectSlot === 'field2Input'
                  ? 'border-purple-500 bg-purple-950/40 text-purple-300 ring-2 ring-purple-500/30'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-purple-400 font-bold">⌶</span>
                <span className="font-medium">Field 2 Input (Promo/Partner)</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[130px]">
                {selectors.field2Input || 'Click to select'}
              </span>
            </button>

            {/* Field 2 Apply Button */}
            <button
              onClick={() => onArmInspector('field2Apply')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                activeInspectSlot === 'field2Apply'
                  ? 'border-purple-500 bg-purple-950/40 text-purple-300 ring-2 ring-purple-500/30'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-medium">Field 2 Apply Button</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[130px]">
                {selectors.field2Apply || 'Click to select'}
              </span>
            </button>

            {/* Price Field */}
            <button
              onClick={() => onArmInspector('priceField')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                activeInspectSlot === 'priceField'
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500/30'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">Price Field (Watch for Drop)</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[130px]">
                {selectors.priceField || 'Click to select'}
              </span>
            </button>

            {/* Remove Button */}
            <button
              onClick={() => onArmInspector('removeButton')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                activeInspectSlot === 'removeButton'
                  ? 'border-rose-500 bg-rose-950/40 text-rose-300 ring-2 ring-rose-500/30'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-medium">Remove Button (Revert Test)</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[130px]">
                {selectors.removeButton || 'Optional'}
              </span>
            </button>
          </div>
        </div>

        {/* Dual Queues Section: Field 1 vs Field 2 Tabs */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Testing Queues & Wordlists
            </span>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              {queue1.codes.length + queue2.codes.length} total codes loaded
            </span>
          </div>

          {/* Queue Selector Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onSetActiveQueueTab('queue1')}
              className={`py-1.5 px-3 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeQueueTab === 'queue1'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Field 1 (Coupon)</span>
              <span className="text-[10px] font-mono opacity-80">({queue1.codes.length})</span>
            </button>
            <button
              onClick={() => onSetActiveQueueTab('queue2')}
              className={`py-1.5 px-3 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeQueueTab === 'queue2'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Field 2 (Promo)</span>
              <span className="text-[10px] font-mono opacity-80">({queue2.codes.length})</span>
            </button>
          </div>

          {/* Input Mode Selector for Active Queue */}
          <div className="flex items-center justify-between text-[11px] gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => onUpdateQueue(activeQueueTab, { mode: 'paste' })}
                className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1 ${
                  activeQueue.mode === 'paste'
                    ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3 h-3" /> Cut & Paste
              </button>
              <button
                onClick={() => onUpdateQueue(activeQueueTab, { mode: 'file' })}
                className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1 ${
                  activeQueue.mode === 'file'
                    ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3 h-3" /> File
              </button>
              <button
                onClick={() => onUpdateQueue(activeQueueTab, { mode: 'generator' })}
                className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1 ${
                  activeQueue.mode === 'generator'
                    ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3" /> Presets
              </button>
            </div>

            <button
              onClick={onOpenScraperModal}
              className="px-2.5 py-1 rounded border border-indigo-500/40 bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 font-medium transition-colors flex items-center gap-1 shadow-sm"
              title="Open Promo Code Word Scraper & Brand Combinator Generator"
            >
              <Wand2 className="w-3 h-3 text-indigo-400" /> Scraper & Gen
            </button>
          </div>

          {/* Mode 1: Cut & Paste Area */}
          {activeQueue.mode === 'paste' && (
            <div className="space-y-1.5">
              <textarea
                value={activeQueue.rawText}
                onChange={(e) => handleTextareaChange(e.target.value, activeQueueTab)}
                rows={5}
                placeholder={`Paste coupon or promo codes here...\nSAVE10\nSAVE20\nWELCOME15\nFREESHIP`}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-slate-200 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600 uppercase"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Separate with newline or comma</span>
                <span className="font-mono">{activeQueue.codes.length} codes in queue</span>
              </div>
            </div>
          )}

          {/* Mode 2: File Upload Area */}
          {activeQueue.mode === 'file' && (
            <div className="border border-dashed border-slate-700 rounded-lg p-4 text-center bg-slate-950/40 space-y-2">
              <input
                type="file"
                ref={activeQueueTab === 'queue1' ? fileInputRef1 : fileInputRef2}
                accept=".txt,.csv,.json"
                onChange={(e) => handleFileUpload(e, activeQueueTab)}
                className="hidden"
              />
              <Upload className="w-6 h-6 text-indigo-400 mx-auto" />
              <div className="text-xs text-slate-300">
                Click to choose wordlist or coupon file (.txt / .csv)
              </div>
              <button
                onClick={() =>
                  activeQueueTab === 'queue1'
                    ? fileInputRef1.current?.click()
                    : fileInputRef2.current?.click()
                }
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium transition-colors"
              >
                Browse File
              </button>
              {activeQueue.codes.length > 0 && (
                <p className="text-[11px] text-emerald-400 font-mono">
                  Loaded {activeQueue.codes.length} codes from file
                </p>
              )}
            </div>
          )}

          {/* Mode 3: Generator Presets (Screenshot matching toggles!) */}
          {activeQueue.mode === 'generator' && (
            <div className="space-y-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Popular promo codes</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeQueue.generatorSettings.popularPromo}
                    onChange={(e) =>
                      onUpdateQueue(activeQueueTab, {
                        generatorSettings: {
                          ...activeQueue.generatorSettings,
                          popularPromo: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Popular words</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeQueue.generatorSettings.popularWords}
                    onChange={(e) =>
                      onUpdateQueue(activeQueueTab, {
                        generatorSettings: {
                          ...activeQueue.generatorSettings,
                          popularWords: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Special chars</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeQueue.generatorSettings.specialChars}
                    onChange={(e) =>
                      onUpdateQueue(activeQueueTab, {
                        generatorSettings: {
                          ...activeQueue.generatorSettings,
                          specialChars: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-300">Code Length</span>
                <input
                  type="number"
                  min="3"
                  max="16"
                  value={activeQueue.generatorSettings.length}
                  onChange={(e) =>
                    onUpdateQueue(activeQueueTab, {
                      generatorSettings: {
                        ...activeQueue.generatorSettings,
                        length: parseInt(e.target.value) || 6,
                      },
                    })
                  }
                  className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-mono text-xs text-slate-100"
                />
              </div>

              <button
                onClick={() => onGenerateQueueCodes(activeQueueTab)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate {activeQueueTab === 'queue1' ? 'Field 1' : 'Field 2'} Wordlist
              </button>
            </div>
          )}
        </div>

        {/* Timing & Stop-and-Review Controls (Matching Screenshot!) */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Execution Timers & Stop Logic
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-300 block font-medium">Interval (ms)</label>
              <span className="text-[10px] text-slate-500 block">Time between attempts</span>
              <input
                type="number"
                min="300"
                step="100"
                value={settings.intervalMs}
                onChange={(e) =>
                  onUpdateSettings({ intervalMs: Math.max(200, parseInt(e.target.value) || 1500) })
                }
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 block font-medium">Timeout (ms)</label>
              <span className="text-[10px] text-slate-500 block">Wait after clicking apply</span>
              <input
                type="number"
                min="200"
                step="100"
                value={settings.timeoutMs}
                onChange={(e) =>
                  onUpdateSettings({ timeoutMs: Math.max(100, parseInt(e.target.value) || 800) })
                }
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Adjustable Pre-Click Delay between entering fields and pressing button */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Pre-Click Delay: Field ➔ Button
              </label>
              <span className="font-mono font-bold text-xs text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded">
                {settings.preClickDelayMs} ms
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Adjustable pause after typing into the field before pressing the Apply button (human hesitation).
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={settings.preClickDelayMs}
                onChange={(e) =>
                  onUpdateSettings({ preClickDelayMs: parseInt(e.target.value) || 500 })
                }
                className="flex-1 accent-indigo-500 cursor-pointer"
              />
              <input
                type="number"
                min="50"
                max="5000"
                step="50"
                value={settings.preClickDelayMs}
                onChange={(e) =>
                  onUpdateSettings({ preClickDelayMs: Math.max(50, parseInt(e.target.value) || 500) })
                }
                className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-mono text-xs text-slate-100"
              />
            </div>
          </div>

          {/* Stop on Change / Review toggle as requested by the user */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-200">Stop and wait for review</div>
                <div className="text-[10px] text-slate-400">
                  Pause automatically when price decreases or discount hits
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.stopOnChange}
                  onChange={(e) => onUpdateSettings({ stopOnChange: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* Anti-Bot & Rate Limiting Protections Section */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-amber-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                Anti-Bot & Rate Limiting
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Evasion System</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200">Human Jitter Variance</div>
                  <div className="text-[10px] text-slate-400">Randomize timing intervals (±80ms)</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableHumanJitter}
                    onChange={(e) => onUpdateSettings({ enableHumanJitter: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200">Auto Backoff on 429</div>
                  <div className="text-[10px] text-slate-400">Exponential cooldown when throttled</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoBackoffOn429}
                    onChange={(e) => onUpdateSettings({ autoBackoffOn429: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200">Auto-Pause on Captcha</div>
                  <div className="text-[10px] text-slate-400">Halt for Cloudflare / Turnstile challenges</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.detectCaptchaAndPause}
                    onChange={(e) => onUpdateSettings({ detectCaptchaAndPause: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Batch Cooldown: Pause every</span>
                <div className="flex items-center gap-1.5 font-mono">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={settings.batchCooldownAfterAttempts}
                    onChange={(e) =>
                      onUpdateSettings({
                        batchCooldownAfterAttempts: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-slate-100 text-xs"
                  />
                  <span className="text-slate-400">attempts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Queue Execution Strategy */}
          <div>
            <label className="text-[11px] text-slate-300 block mb-1 font-medium">Queue Sequencing</label>
            <select
              value={settings.strategy}
              onChange={(e) => onUpdateSettings({ strategy: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="field1_first">Run Field 1 Queue, then Field 2</option>
              <option value="interleaved">Interleaved (Alternating Field 1 & 2)</option>
              <option value="field1_only">Test Field 1 (Coupon) Only</option>
              <option value="field2_only">Test Field 2 (Promo) Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer Primary Action Area (Screenshot style: Full width button) */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
        {/* Active Cooldown Banner */}
        {activeCooldownSeconds > 0 && (
          <div className="bg-amber-950/60 border border-amber-600/50 rounded-lg p-2.5 text-xs text-amber-200 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{cooldownReason || 'Rate Limit Cooldown Active'}</span>
            </div>
            <span className="font-mono font-bold text-amber-300 tabular-nums">
              {activeCooldownSeconds.toFixed(1)}s
            </span>
          </div>
        )}
        {currentRunningCode && (
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pb-1">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              Testing: <strong>{currentRunningCode}</strong>
            </span>
            <span className="text-slate-400">{currentRunningField}</span>
          </div>
        )}

        <div className="flex gap-2">
          {!isRunning ? (
            <button
              onClick={onStartAutomation}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Automation
            </button>
          ) : isPaused ? (
            <button
              onClick={onStartAutomation}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Resume Automation
            </button>
          ) : (
            <button
              onClick={onPauseAutomation}
              className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-white" />
              Pause Automation
            </button>
          )}

          {/* Step Once Button */}
          <button
            onClick={onStepAutomation}
            disabled={isRunning && !isPaused}
            title="Try 1 code step-by-step"
            className="p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Reset Button */}
          <button
            onClick={onResetAutomation}
            title="Reset attempt pointers and clear fields"
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
