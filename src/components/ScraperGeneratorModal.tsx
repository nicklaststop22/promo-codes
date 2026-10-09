import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Search,
  Download,
  Copy,
  Check,
  ArrowRight,
  Filter,
  Layers,
  Wand2,
  FileText,
  Globe,
  Sliders,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Zap
} from 'lucide-react';
import {
  scrapeCodesFromText,
  generateBrandWordlist,
  SAMPLE_SCRAPER_TEXTS,
  ScrapedCodeResult,
  CombinatorOptions
} from '../utils/scraperGenerator';

interface ScraperGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPushToQueue: (queueId: 'queue1' | 'queue2', codes: string[], mode: 'append' | 'replace') => void;
  currentStoreName?: string;
}

export const ScraperGeneratorModal: React.FC<ScraperGeneratorModalProps> = ({
  isOpen,
  onClose,
  onPushToQueue,
  currentStoreName = 'ApexGear',
}) => {
  const [activeTab, setActiveTab] = useState<'scraper' | 'brand_gen'>('scraper');

  // Mode 1: Text Scraper State
  const [rawText, setRawText] = useState(SAMPLE_SCRAPER_TEXTS[0].text);
  const [scrapedResults, setScrapedResults] = useState<ScrapedCodeResult[]>(() =>
    scrapeCodesFromText(SAMPLE_SCRAPER_TEXTS[0].text)
  );

  // Mode 2: Brand Combinator State
  const [combinatorOptions, setCombinatorOptions] = useState<CombinatorOptions>({
    brandName: currentStoreName.replace(/\s+/g, ''),
    includePercentages: true,
    includeSeasons: true,
    includeYears: true,
    includeWelcome: true,
    includeShipping: true,
    includeVip: true,
    separators: ['', '-'],
    caseMode: 'UPPER',
  });
  const [brandGenResults, setBrandGenResults] = useState<ScrapedCodeResult[]>(() =>
    generateBrandWordlist({
      brandName: currentStoreName.replace(/\s+/g, ''),
      includePercentages: true,
      includeSeasons: true,
      includeYears: true,
      includeWelcome: true,
      includeShipping: true,
      includeVip: true,
      separators: ['', '-'],
      caseMode: 'UPPER',
    })
  );

  // Selection & Export State
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [confidenceFilter, setConfidenceFilter] = useState<'ALL' | 'HIGH'>('ALL');
  const [pushSuccessMsg, setPushSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentResults = activeTab === 'scraper' ? scrapedResults : brandGenResults;

  const filteredResults = currentResults.filter((item) => {
    if (confidenceFilter === 'HIGH' && item.confidence !== 'HIGH') return false;
    return true;
  });

  const handleRunScraper = () => {
    const extracted = scrapeCodesFromText(rawText);
    setScrapedResults(extracted);
    setSelectedCodes(new Set(extracted.map((e) => e.code)));
  };

  const handleRunBrandGen = () => {
    const generated = generateBrandWordlist(combinatorOptions);
    setBrandGenResults(generated);
    setSelectedCodes(new Set(generated.map((g) => g.code)));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCodes(new Set(filteredResults.map((r) => r.code)));
    } else {
      setSelectedCodes(new Set());
    }
  };

  const handleToggleCode = (code: string) => {
    const next = new Set(selectedCodes);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setSelectedCodes(next);
  };

  const getExportList = () => {
    const list = filteredResults.filter((r) => selectedCodes.has(r.code) || selectedCodes.size === 0);
    return list.map((r) => r.code);
  };

  const handlePush = (queueId: 'queue1' | 'queue2', mode: 'append' | 'replace') => {
    const codes = getExportList();
    if (codes.length === 0) return;
    onPushToQueue(queueId, codes, mode);
    setPushSuccessMsg(
      `Pushed ${codes.length} codes to ${queueId === 'queue1' ? 'Field 1 (Coupon)' : 'Field 2 (Promo)'}!`
    );
    setTimeout(() => setPushSuccessMsg(null), 3000);
  };

  const handleCopyCodes = () => {
    const codes = getExportList();
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const codes = getExportList();
    const blob = new Blob([codes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped-promo-wordlist-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Promo Code Word Scraper & Generator Engine
              </h3>
              <p className="text-[11px] text-slate-400">
                Extract hidden coupons from web text, newsletters, and HTML or synthesize brand dictionary wordlists.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('scraper')}
            className={`pb-2.5 px-3 font-medium transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'scraper'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            Web Text & HTML Scraper
          </button>
          <button
            onClick={() => setActiveTab('brand_gen')}
            className={`pb-2.5 px-3 font-medium transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'brand_gen'
                ? 'border-indigo-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Brand & Retail Combinator Generator
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          {/* Left Column: Input / Controls */}
          <div className="lg:col-span-6 p-4 border-r border-slate-800 overflow-y-auto space-y-4 text-xs bg-slate-900/60">
            {activeTab === 'scraper' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">
                    Paste Raw Web Page, Newsletter, or Deal Forum Text
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {rawText.length} characters
                  </span>
                </div>

                {/* Preset sample loaders */}
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400">Samples:</span>
                  {SAMPLE_SCRAPER_TEXTS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRawText(sample.text)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                      title={sample.description}
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={10}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste website source HTML, email promotions, deal forum thread comments, or checkout banners..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />

                <button
                  onClick={handleRunScraper}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
                >
                  <Search className="w-4 h-4" />
                  Run Heuristic Scraper & Token Extractor
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    Target Brand / Store Root Word
                  </label>
                  <input
                    type="text"
                    value={combinatorOptions.brandName}
                    onChange={(e) =>
                      setCombinatorOptions((prev) => ({ ...prev, brandName: e.target.value }))
                    }
                    placeholder="e.g. ApexGear, Gymshark, Nike, Sephora"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 uppercase focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    The combinator will synthesize standard retail marketing stems with this root.
                  </p>
                </div>

                <div className="space-y-2.5 bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-300 block text-[11px] uppercase tracking-wider">
                    Discount Pattern Sets to Include
                  </span>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Percentage Tiers (SAVE10, 15OFF, 20OFF, etc.)</span>
                    <input
                      type="checkbox"
                      checked={combinatorOptions.includePercentages}
                      onChange={(e) =>
                        setCombinatorOptions((prev) => ({
                          ...prev,
                          includePercentages: e.target.checked,
                        }))
                      }
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Welcome & First-Order (WELCOME10, FIRST15, NEW10)</span>
                    <input
                      type="checkbox"
                      checked={combinatorOptions.includeWelcome}
                      onChange={(e) =>
                        setCombinatorOptions((prev) => ({
                          ...prev,
                          includeWelcome: e.target.checked,
                        }))
                      }
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Free Shipping Stems (FREESHIP, SHIPFREE, FREE50)</span>
                    <input
                      type="checkbox"
                      checked={combinatorOptions.includeShipping}
                      onChange={(e) =>
                        setCombinatorOptions((prev) => ({
                          ...prev,
                          includeShipping: e.target.checked,
                        }))
                      }
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">VIP & Loyalty Stems (VIP20, MEMBER15, INSIDER)</span>
                    <input
                      type="checkbox"
                      checked={combinatorOptions.includeVip}
                      onChange={(e) =>
                        setCombinatorOptions((prev) => ({
                          ...prev,
                          includeVip: e.target.checked,
                        }))
                      }
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Seasonal Stems (SPRING, SUMMER, FALL, BF, CYBER)</span>
                    <input
                      type="checkbox"
                      checked={combinatorOptions.includeSeasons}
                      onChange={(e) =>
                        setCombinatorOptions((prev) => ({
                          ...prev,
                          includeSeasons: e.target.checked,
                        }))
                      }
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Year Tags (FALL26, SUMMER2026, 26)</span>
                    <input
                      type="checkbox"
                      checked={combinatorOptions.includeYears}
                      onChange={(e) =>
                        setCombinatorOptions((prev) => ({
                          ...prev,
                          includeYears: e.target.checked,
                        }))
                      }
                      className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                    />
                  </label>
                </div>

                <button
                  onClick={handleRunBrandGen}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Synthesize Combinator Wordlist
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Scraped / Generated Results */}
          <div className="lg:col-span-6 flex flex-col min-h-0 bg-slate-950">
            {/* Results Filter Strip */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-900/40">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">
                  {filteredResults.length} Candidate Codes Extracted
                </span>
                <span className="text-slate-500">·</span>
                <button
                  onClick={() =>
                    setConfidenceFilter(confidenceFilter === 'ALL' ? 'HIGH' : 'ALL')
                  }
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                    confidenceFilter === 'HIGH'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {confidenceFilter === 'HIGH' ? 'High Confidence Only' : 'All Tiers'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-400 cursor-pointer flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={
                      selectedCodes.size === filteredResults.length &&
                      filteredResults.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                  />
                  Select All
                </label>
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-850">
              {filteredResults.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-1">
                  <Search className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">No candidate promo codes found in this input.</p>
                </div>
              ) : (
                filteredResults.map((item, idx) => {
                  const isChecked = selectedCodes.has(item.code);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleCode(item.code)}
                      className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        isChecked ? 'bg-indigo-950/30 text-indigo-100' : 'hover:bg-slate-900/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent onClick
                          className="rounded bg-slate-800 border-slate-700 text-indigo-600 pointer-events-none"
                        />
                        <div>
                          <span className="font-mono font-bold text-sm text-slate-100">
                            {item.code}
                          </span>
                          {item.contextSnippet && (
                            <p className="text-[10px] text-slate-500 font-sans truncate max-w-xs">
                              {item.contextSnippet}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            item.confidence === 'HIGH'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.confidence}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Push Banner feedback */}
            {pushSuccessMsg && (
              <div className="bg-emerald-950 border-t border-emerald-800 px-4 py-2 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{pushSuccessMsg}</span>
              </div>
            )}

            {/* Action Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePush('queue1', 'append')}
                  disabled={filteredResults.length === 0}
                  className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Append to Field 1 (Coupon)
                </button>
                <button
                  onClick={() => handlePush('queue2', 'append')}
                  disabled={filteredResults.length === 0}
                  className="py-2 px-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  Append to Field 2 (Promo)
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCodes}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy All'}
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Export .TXT
                  </button>
                </div>

                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedCodes.size > 0 ? selectedCodes.size : filteredResults.length} selected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
