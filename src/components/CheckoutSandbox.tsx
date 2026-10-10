import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  RotateCcw,
  Tag,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Trash2,
  Crosshair,
  ExternalLink,
  Laptop,
  Smartphone,
  Eye,
  Sliders,
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Sparkles,
  Code,
  FileCode,
  Check,
  Send,
  Lock,
  Unlock,
  Workflow,
  Power,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { StorePreset, TargetSlot, SelectorConfig, StoreItem, SequenceStep, SequenceActionType } from '../types';
import { STORE_PRESETS, SEQUENCE_PRESETS } from '../data/presets';

interface CheckoutSandboxProps {
  currentStore: StorePreset;
  onSelectStore: (store: StorePreset) => void;
  selectors: SelectorConfig;
  onSelectTarget: (slot: TargetSlot, selector: string) => void;
  activeInspectSlot: TargetSlot | null;
  onCancelInspect: () => void;
  appliedField1Code: string;
  appliedField2Code: string;
  field1InputValue: string;
  field2InputValue: string;
  onField1InputChange: (val: string) => void;
  onField2InputChange: (val: string) => void;
  onApplyField1: (code: string) => {
    success: boolean;
    message: string;
    discountAmount: number;
    rateLimited?: boolean;
    captchaBlocked?: boolean;
  };
  onApplyField2: (code: string) => {
    success: boolean;
    message: string;
    discountAmount: number;
    rateLimited?: boolean;
    captchaBlocked?: boolean;
  };
  onRemoveDiscount: (field: 'field1' | 'field2') => void;
  orderTotal: number;
  subtotal: number;
  discountField1Amount: number;
  discountField2Amount: number;
  shippingAmount: number;
  feedbackMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  highlightedElementSelector: string | null;
  activeCaptcha: boolean;
  onSolveCaptcha: () => void;
  rateLimitActive: boolean;
  rateLimitCooldownSeconds: number;
  onTriggerSimulatedChallenge?: () => void;
  sequenceSteps?: SequenceStep[];
  onToggleSequenceStep?: (stepId: SequenceActionType) => void;
  onMoveSequenceStep?: (stepId: SequenceActionType, direction: 'up' | 'down') => void;
  onApplySequencePreset?: (steps: SequenceStep[]) => void;
  currentRunningStepId?: SequenceActionType | null;
  lockedField1Code?: string | null;
  lockedField2Code?: string | null;
  onLockFieldCode?: (field: 'field1' | 'field2', code: string | null) => void;
}

export const CheckoutSandbox: React.FC<CheckoutSandboxProps> = ({
  currentStore,
  onSelectStore,
  selectors,
  onSelectTarget,
  activeInspectSlot,
  onCancelInspect,
  appliedField1Code,
  appliedField2Code,
  field1InputValue,
  field2InputValue,
  onField1InputChange,
  onField2InputChange,
  onApplyField1,
  onApplyField2,
  onRemoveDiscount,
  orderTotal,
  subtotal,
  discountField1Amount,
  discountField2Amount,
  shippingAmount,
  feedbackMessage,
  highlightedElementSelector,
  activeCaptcha,
  onSolveCaptcha,
  rateLimitActive,
  rateLimitCooldownSeconds,
  onTriggerSimulatedChallenge,
  sequenceSteps = [],
  onToggleSequenceStep,
  onMoveSequenceStep,
  onApplySequencePreset,
  currentRunningStepId = null,
  lockedField1Code = null,
  lockedField2Code = null,
  onLockFieldCode,
}) => {
  const [viewportWidth, setViewportWidth] = useState<'100%' | '768px'>('100%');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoDetectNotice, setAutoDetectNotice] = useState<string | null>(null);

  // Browser Navigation History & URL State
  const defaultUrl = `${currentStore.baseUrl || 'https://shop.apexgear.com'}/checkout`;
  const [urlInput, setUrlInput] = useState<string>(defaultUrl);
  const [history, setHistory] = useState<string[]>([defaultUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Active Route parsed from URL: 'checkout' | 'products' | 'cart' | 'custom_html' | 'external'
  const currentUrl = history[historyIndex] || defaultUrl;

  const getRouteFromUrl = (url: string): 'checkout' | 'products' | 'cart' | 'custom_html' | 'external' => {
    if (url.startsWith('custom://') || url.includes('/custom-html')) return 'custom_html';
    if (url.endsWith('/products') || url.endsWith('/catalog') || url.endsWith('/shop')) return 'products';
    if (url.endsWith('/cart') || url.endsWith('/basket')) return 'cart';
    if (url.includes('/checkout')) return 'checkout';
    return 'checkout'; // fallback to checkout
  };

  const currentRoute = getRouteFromUrl(currentUrl);

  // Custom HTML / Form Playground code
  const [customHtmlCode, setCustomHtmlCode] = useState<string>(`<!-- Custom Store Checkout Form Sandbox -->
<div class="custom-store-checkout p-4 space-y-4">
  <div class="header pb-2 border-b">
    <h2 class="text-base font-bold text-slate-800">Custom Merchant Checkout</h2>
    <p class="text-xs text-slate-500">Order #88391 · 2 items</p>
  </div>
  
  <div class="fields bg-slate-50 p-4 rounded-lg space-y-3 border">
    <div>
      <label class="block text-xs font-semibold mb-1 text-slate-700">Coupon Code</label>
      <div class="flex gap-2">
        <input id="custom-coupon-input" type="text" placeholder="ENTER COUPON" class="border p-2 rounded text-xs flex-1 uppercase" />
        <button id="custom-coupon-btn" class="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold">Apply</button>
      </div>
    </div>

    <div>
      <label class="block text-xs font-semibold mb-1 text-slate-700">Partner / Referral Code</label>
      <div class="flex gap-2">
        <input id="custom-promo-input" type="text" placeholder="ENTER PROMO" class="border p-2 rounded text-xs flex-1 uppercase" />
        <button id="custom-promo-btn" class="bg-purple-600 text-white px-3 py-1 rounded text-xs font-semibold">Verify</button>
      </div>
    </div>
  </div>

  <div class="summary bg-white p-3 rounded border flex justify-between items-center">
    <span class="font-bold text-xs text-slate-700">Total Price Due:</span>
    <span id="custom-total-price" class="text-base font-bold text-emerald-600 font-mono">$149.00</span>
  </div>
</div>`);

  // Update URL input when store preset changes
  useEffect(() => {
    const newUrl = `${currentStore.baseUrl || 'https://shop.apexgear.com'}/checkout`;
    setUrlInput(newUrl);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newUrl]);
    setHistoryIndex((prev) => prev + 1);
  }, [currentStore.id]);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targetSelector: string;
    targetTagName: string;
  } | null>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Navigation handlers
  const navigateTo = (newUrl: string) => {
    let cleanUrl = newUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('custom://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    // Match preset if URL matches one of the store domains
    const matchedStore = STORE_PRESETS.find((s) => s.baseUrl && cleanUrl.startsWith(s.baseUrl));
    if (matchedStore && matchedStore.id !== currentStore.id) {
      onSelectStore(matchedStore);
    }

    setUrlInput(cleanUrl);
    const newHistory = [...history.slice(0, historyIndex + 1), cleanUrl];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prevUrl = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setUrlInput(prevUrl);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const nextUrl = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setUrlInput(nextUrl);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleHome = () => {
    navigateTo(`${currentStore.baseUrl || 'https://shop.apexgear.com'}/products`);
  };

  const handleAddressBarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(urlInput);
  };

  // Auto-detect coupon inputs on page
  const handleAutoDetect = () => {
    if (currentRoute === 'custom_html') {
      onSelectTarget('field1Input', '#custom-coupon-input');
      onSelectTarget('field1Apply', '#custom-coupon-btn');
      onSelectTarget('field2Input', '#custom-promo-input');
      onSelectTarget('field2Apply', '#custom-promo-btn');
      onSelectTarget('priceField', '#custom-total-price');
      setAutoDetectNotice('Auto-detected 2 promo inputs, 2 buttons, and price field on Custom Form!');
    } else {
      onSelectTarget('field1Input', currentStore.selectors.field1Input);
      onSelectTarget('field1Apply', currentStore.selectors.field1Apply);
      onSelectTarget('field2Input', currentStore.selectors.field2Input);
      onSelectTarget('field2Apply', currentStore.selectors.field2Apply);
      onSelectTarget('priceField', currentStore.selectors.priceField);
      onSelectTarget('removeButton', currentStore.selectors.removeButton);
      setAutoDetectNotice(`Bound 5 target selectors automatically for ${currentStore.name}!`);
    }
    setTimeout(() => setAutoDetectNotice(null), 4000);
  };

  const handleSandboxRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (!target) return;

    let sel = '';
    if (target.id) {
      sel = `#${target.id}`;
    } else if (target.getAttribute('name')) {
      sel = `${target.tagName.toLowerCase()}[name="${target.getAttribute('name')}"]`;
    } else if (target.className && typeof target.className === 'string') {
      const firstValidClass = target.className
        .split(' ')
        .find((c) => c && !c.includes(':') && !c.startsWith('['));
      if (firstValidClass) {
        sel = `.${firstValidClass}`;
      } else {
        sel = target.tagName.toLowerCase();
      }
    } else {
      sel = target.tagName.toLowerCase();
    }

    if (activeInspectSlot) {
      onSelectTarget(activeInspectSlot, sel);
      onCancelInspect();
      return;
    }

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      targetSelector: sel,
      targetTagName: target.tagName.toLowerCase(),
    });
  };

  const handleElementClick = (e: React.MouseEvent) => {
    if (!activeInspectSlot) return;
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    let sel = '';
    if (target.id) {
      sel = `#${target.id}`;
    } else if (target.getAttribute('name')) {
      sel = `${target.tagName.toLowerCase()}[name="${target.getAttribute('name')}"]`;
    } else if (target.className && typeof target.className === 'string') {
      const firstValidClass = target.className
        .split(' ')
        .find((c) => c && !c.includes(':') && !c.startsWith('['));
      if (firstValidClass) {
        sel = `.${firstValidClass}`;
      } else {
        sel = target.tagName.toLowerCase();
      }
    } else {
      sel = target.tagName.toLowerCase();
    }

    onSelectTarget(activeInspectSlot, sel);
    onCancelInspect();
  };

  const isHighlighted = (selector: string) => {
    return highlightedElementSelector === selector;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* ─── BROWSER CHROME TOOLBAR ─── */}
      <div className="bg-slate-950 px-3 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Navigation Controls: Back, Forward, Reload, Home */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>

          <button
            onClick={handleBack}
            disabled={historyIndex <= 0}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300 disabled:text-slate-600 transition-colors"
            title="Back in history"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300 disabled:text-slate-600 transition-colors"
            title="Forward in history"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleRefresh}
            className={`p-1 rounded hover:bg-slate-800 text-slate-300 transition-colors ${
              isRefreshing ? 'animate-spin text-indigo-400' : ''
            }`}
            title="Reload web page"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleHome}
            className="p-1 rounded hover:bg-slate-800 text-slate-300 transition-colors"
            title="Go to store homepage"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ─── REAL INTERACTIVE ADDRESS BAR ─── */}
        <form
          onSubmit={handleAddressBarSubmit}
          className="flex items-center flex-1 min-w-[240px] max-w-2xl bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1 gap-2 text-slate-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter any web page URL (e.g. https://shop.com/checkout or custom://html-playground)"
            className="w-full bg-transparent text-slate-100 font-mono text-xs outline-none truncate"
          />

          <button
            type="submit"
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded transition-colors shrink-0"
            title="Navigate to URL"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>

        {/* Browser Quick Navigation & Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Auto-Detect Selectors Button */}
          <button
            onClick={handleAutoDetect}
            className="px-2.5 py-1 bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-700/50 rounded-md font-medium text-[11px] flex items-center gap-1 transition-colors shadow-sm"
            title="Scan current page DOM and auto-bind coupon inputs & buttons"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">Auto-Detect</span>
          </button>

          {/* Viewport Frame Size */}
          <button
            onClick={() => setViewportWidth(viewportWidth === '100%' ? '768px' : '100%')}
            className={`p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ${
              viewportWidth === '768px' ? 'bg-slate-800 text-indigo-400' : ''
            }`}
            title="Toggle Tablet / Desktop responsive frame"
          >
            {viewportWidth === '100%' ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Bookmark Navigation Tabs */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-1 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-slate-500 font-medium shrink-0">Bookmarks:</span>
        <button
          onClick={() => navigateTo('https://shop.apexgear.com/checkout')}
          className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
            currentUrl.includes('apexgear') ? 'bg-slate-800 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Apex Gear (/checkout)
        </button>
        <button
          onClick={() => navigateTo('https://luxe-botanicals.store/checkout')}
          className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
            currentUrl.includes('luxe-botanicals') ? 'bg-slate-800 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Luxe Botanicals (/checkout)
        </button>
        <button
          onClick={() => navigateTo('https://devcloud.io/checkout')}
          className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
            currentUrl.includes('devcloud') ? 'bg-slate-800 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          DevCloud SaaS (/billing)
        </button>
        <button
          onClick={() => navigateTo('custom://html-playground')}
          className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
            currentRoute === 'custom_html' ? 'bg-indigo-600 text-white font-semibold' : 'text-indigo-400 hover:text-indigo-300'
          }`}
        >
          <Code className="w-3 h-3" />
          Custom HTML Playground
        </button>
      </div>

      {/* Auto Detect Notification Banner */}
      {autoDetectNotice && (
        <div className="bg-emerald-950/90 border-b border-emerald-800/80 px-4 py-1.5 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{autoDetectNotice}</span>
          </div>
          <button onClick={() => setAutoDetectNotice(null)} className="text-emerald-400 hover:text-white">
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Inspector Mode Banner */}
      {activeInspectSlot && (
        <div className="bg-indigo-600 px-4 py-2 text-white text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 font-medium">
            <Crosshair className="w-4 h-4" />
            <span>
              Target Inspector Armed: Click or right-click any element on the page below to bind to{' '}
              <strong>{activeInspectSlot}</strong>
            </span>
          </div>
          <button
            onClick={onCancelInspect}
            className="px-2.5 py-0.5 bg-indigo-800 hover:bg-indigo-900 text-indigo-100 rounded text-xs transition-colors"
          >
            Cancel Picker
          </button>
        </div>
      )}

      {/* ─── INTERACTIVE SEQUENCE PIPELINE & STACKING HUD RIBBON ─── */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            <Workflow className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pipeline Sequence:</span>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {sequenceSteps.map((step, idx) => {
              const isField = step.action.startsWith('field');
              const isRunningThis = currentRunningStepId === step.action;
              const isLocked =
                (step.action === 'field1' && lockedField1Code) ||
                (step.action === 'field2' && lockedField2Code);

              return (
                <div key={step.id} className="flex items-center gap-1">
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-mono transition-all ${
                      isRunningThis
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-400/40 animate-pulse'
                        : step.enabled
                        ? isField
                          ? 'bg-indigo-950/70 border-indigo-500/40 text-indigo-200'
                          : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-500 line-through opacity-60'
                    }`}
                  >
                    {/* Toggle ON/OFF Checkbox */}
                    <input
                      type="checkbox"
                      checked={step.enabled}
                      onChange={() => onToggleSequenceStep && onToggleSequenceStep(step.id)}
                      title={`Turn ${step.label} ${step.enabled ? 'OFF' : 'ON'}`}
                      className="cursor-pointer accent-indigo-500 w-3.5 h-3.5 rounded"
                    />

                    <span className="font-semibold">{step.label}</span>
                    <span className="text-[9px] uppercase px-1 rounded bg-black/40 text-slate-400 font-sans">
                      {isField ? 'Input' : 'Click'}
                    </span>

                    {isLocked && (
                      <span title="Code is locked for stacking" className="text-amber-400 font-bold">
                        🔒
                      </span>
                    )}

                    {/* Reorder Arrows */}
                    <div className="flex items-center ml-0.5">
                      <button
                        disabled={idx === 0}
                        onClick={() => onMoveSequenceStep && onMoveSequenceStep(step.id, 'up')}
                        title="Move left/earlier in sequence"
                        className="hover:text-white disabled:opacity-20 text-slate-400 p-0.5"
                      >
                        <ArrowUp className="w-2.5 h-2.5 -rotate-90" />
                      </button>
                      <button
                        disabled={idx === sequenceSteps.length - 1}
                        onClick={() => onMoveSequenceStep && onMoveSequenceStep(step.id, 'down')}
                        title="Move right/later in sequence"
                        className="hover:text-white disabled:opacity-20 text-slate-400 p-0.5"
                      >
                        <ArrowDown className="w-2.5 h-2.5 -rotate-90" />
                      </button>
                    </div>
                  </div>

                  {idx < sequenceSteps.length - 1 && (
                    <span className="text-slate-600 text-xs font-mono">➔</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right HUD Zone: Quick Presets & Stacking Status */}
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          {/* Quick Presets Dropdown */}
          <select
            onChange={(e) => {
              const found = SEQUENCE_PRESETS.find((p) => p.id === e.target.value);
              if (found && onApplySequencePreset) onApplySequencePreset(found.steps);
            }}
            defaultValue=""
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 font-mono text-[10px] focus:outline-none focus:border-indigo-500"
          >
            <option value="" disabled>
              ⚡ Presets...
            </option>
            {SEQUENCE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.badge} ({p.name})
              </option>
            ))}
          </select>

          {/* Locked Codes status */}
          {(lockedField1Code || lockedField2Code) && (
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-amber-300 bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>
                Stacking: {lockedField1Code ? `F1 [${lockedField1Code}]` : ''}{' '}
                {lockedField2Code ? `F2 [${lockedField2Code}]` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── BROWSER VIEWPORT CANVAS ─── */}
      <div
        className="flex-1 overflow-y-auto bg-slate-950/60 p-4 sm:p-6 flex justify-center items-start relative"
        onContextMenu={handleSandboxRightClick}
        onClick={handleElementClick}
      >
        <div
          style={{ width: viewportWidth }}
          className="transition-all duration-200 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 overflow-hidden min-h-[580px] flex flex-col"
        >
          {/* E-commerce Store Top Navigation Bar (Allows navigating between pages!) */}
          <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                {currentStore.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-xs tracking-tight">{currentStore.name}</h2>
                <p className="text-[10px] text-slate-400">{currentStore.category}</p>
              </div>
            </div>

            {/* In-Store Page Navigation Links */}
            <nav className="flex items-center gap-4 text-xs font-medium">
              <button
                onClick={() => navigateTo(`${currentStore.baseUrl || 'https://shop.apexgear.com'}/products`)}
                className={`hover:text-indigo-400 transition-colors ${
                  currentRoute === 'products' ? 'text-indigo-400 font-bold border-b-2 border-indigo-500 pb-0.5' : 'text-slate-300'
                }`}
              >
                Catalog / Products
              </button>
              <button
                onClick={() => navigateTo(`${currentStore.baseUrl || 'https://shop.apexgear.com'}/cart`)}
                className={`hover:text-indigo-400 transition-colors flex items-center gap-1 ${
                  currentRoute === 'cart' ? 'text-indigo-400 font-bold border-b-2 border-indigo-500 pb-0.5' : 'text-slate-300'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Cart ({currentStore.items.length})</span>
              </button>
              <button
                onClick={() => navigateTo(`${currentStore.baseUrl || 'https://shop.apexgear.com'}/checkout`)}
                className={`hover:text-indigo-400 transition-colors flex items-center gap-1 ${
                  currentRoute === 'checkout' ? 'text-indigo-400 font-bold border-b-2 border-indigo-500 pb-0.5' : 'text-slate-300'
                }`}
              >
                <span>Checkout</span>
              </button>
            </nav>
          </div>

          {/* ─── ROUTE 1: PRODUCTS / CATALOG VIEW (/products) ─── */}
          {currentRoute === 'products' && (
            <div className="p-6 space-y-6 flex-1 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Featured Store Catalog</h3>
                  <p className="text-xs text-slate-500">Select items to populate your checkout cart.</p>
                </div>
                <button
                  onClick={() => navigateTo(`${currentStore.baseUrl || 'https://shop.apexgear.com'}/checkout`)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Proceed to Checkout (${orderTotal.toFixed(2)})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(currentStore.catalog || currentStore.items).map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        {item.category}
                      </span>
                      <h4 className="font-semibold text-xs text-slate-900 mt-2">{item.name}</h4>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-bold font-mono text-slate-900">${item.price.toFixed(2)}</span>
                      <button
                        onClick={() => navigateTo(`${currentStore.baseUrl || 'https://shop.apexgear.com'}/checkout`)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-md text-[11px] font-medium transition-colors"
                      >
                        Buy & Checkout
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ROUTE 2: SHOPPING CART VIEW (/cart) ─── */}
          {currentRoute === 'cart' && (
            <div className="p-6 space-y-6 flex-1 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Review Shopping Cart</h3>
                <span className="text-xs text-slate-500">{currentStore.items.length} items in cart</span>
              </div>

              <div className="border border-slate-200 rounded-xl bg-white overflow-hidden divide-y divide-slate-100 shadow-sm">
                {currentStore.items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-slate-500 text-[11px]">{item.category} · In Stock</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-xs text-slate-600 font-mono">Qty: {item.quantity}</div>
                      <div className="font-mono font-bold text-slate-900 text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-sm ml-auto space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Shipping</span>
                  <span className="font-mono font-medium">${currentStore.shippingCost.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-bold text-slate-900 text-sm">
                  <span>Estimated Total</span>
                  <span className="font-mono text-indigo-600">${orderTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => navigateTo(`${currentStore.baseUrl || 'https://shop.apexgear.com'}/checkout`)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow"
                >
                  Proceed to Checkout & Promo Fields ➔
                </button>
              </div>
            </div>
          )}

          {/* ─── ROUTE 3: CUSTOM HTML & FORM PLAYGROUND (custom://html-playground) ─── */}
          {currentRoute === 'custom_html' && (
            <div className="p-6 space-y-6 flex-1 bg-slate-50">
              <div className="bg-indigo-950/10 border border-indigo-200 p-3.5 rounded-lg text-xs text-indigo-900 flex items-center justify-between">
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-indigo-600" />
                    Custom Web Page & Form Playground
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Paste arbitrary HTML markup or edit below to test promo codes on custom elements!
                  </p>
                </div>
                <button
                  onClick={handleAutoDetect}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-xs shadow"
                >
                  Auto-Detect Selectors
                </button>
              </div>

              {/* Editable HTML source area */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Edit Custom Page HTML Code:</label>
                <textarea
                  rows={4}
                  value={customHtmlCode}
                  onChange={(e) => setCustomHtmlCode(e.target.value)}
                  className="w-full bg-slate-900 text-slate-100 font-mono text-[11px] p-3 rounded-lg border border-slate-700 outline-none"
                />
              </div>

              {/* Rendered Custom Sandbox Preview */}
              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-4 bg-white shadow-inner">
                <span className="text-[10px] font-mono text-indigo-600 block mb-2 uppercase font-semibold">
                  Live Rendered Target Page (Right-click or click elements to select):
                </span>
                <div
                  dangerouslySetInnerHTML={{ __html: customHtmlCode }}
                  className="custom-rendered-dom"
                />
              </div>
            </div>
          )}

          {/* ─── ROUTE 4: CHECKOUT & PROMO TEST VIEW (/checkout) ─── */}
          {currentRoute === 'checkout' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
              {/* Left: Cart Items & Inputs */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Order Items ({currentStore.items.length})
                    </h3>
                    <button
                      onClick={() => navigateTo(`${currentStore.baseUrl || 'https://shop.apexgear.com'}/products`)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      + Add More Items
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                    {currentStore.items.map((item) => (
                      <div key={item.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-white transition-colors">
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-slate-500 text-[11px]">Qty: {item.quantity} · {item.category}</div>
                        </div>
                        <div className="font-mono font-semibold text-slate-800 tabular-nums">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Alert Banner */}
                {feedbackMessage && (
                  <div
                    id={selectors.statusMessage.replace('#', '')}
                    className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 transition-all ${
                      feedbackMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : feedbackMessage.type === 'error'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                    } ${isHighlighted(selectors.statusMessage) ? 'ring-2 ring-indigo-500' : ''}`}
                  >
                    {feedbackMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{feedbackMessage.text}</div>
                      {feedbackMessage.type === 'success' && (
                        <div className="mt-2 pt-2 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] text-emerald-800 font-semibold">
                            Discount verified! Lock it in to hunt for stacking coupon codes?
                          </span>
                          <button
                            onClick={() => {
                              if (appliedField1Code) onLockFieldCode && onLockFieldCode('field1', appliedField1Code);
                              else if (appliedField2Code) onLockFieldCode && onLockFieldCode('field2', appliedField2Code);
                            }}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold flex items-center gap-1 shadow transition-colors"
                          >
                            <Lock className="w-3.5 h-3.5" /> Lock In & Stack Discounts
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rate Limit Alert (HTTP 429) */}
                {rateLimitActive && (
                  <div className="p-3.5 rounded-lg text-xs bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <div className="font-bold">HTTP 429 Too Many Requests (Rate Limit Active)</div>
                        <div className="text-[11px] text-rose-700">Velocity throttling engaged by store checkout security.</div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs bg-rose-200/80 px-2.5 py-1 rounded text-rose-900 tabular-nums">
                      Cooldown: {rateLimitCooldownSeconds}s
                    </span>
                  </div>
                )}

                {/* Captcha / Anti-Bot Challenge Box */}
                {activeCaptcha && (
                  <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-xs space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between text-amber-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        Security Check: Cloudflare Turnstile / Captcha Verification
                      </span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono">
                        Anti-Bot Triggered
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      The checkout detected automated field submission. Check the box below to simulate human verification and resume automation.
                    </p>
                    <div className="bg-white border border-slate-300 rounded-lg p-3 flex items-center justify-between max-w-sm">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          onChange={onSolveCaptcha}
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-slate-800 font-semibold text-xs">Verify you are human</span>
                      </label>
                      <div className="text-right text-[10px] text-slate-400 font-sans">
                        <ShieldCheck className="w-4 h-4 text-slate-400 inline ml-1" />
                      </div>
                    </div>
                  </div>
                )}

                {/* INPUT FIELD 1: Coupon Code */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <span>Field 1: Promo / Coupon Code</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                        {selectors.field1Input}
                      </span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      {lockedField1Code ? (
                        <button
                          onClick={() => onLockFieldCode && onLockFieldCode('field1', null)}
                          className="text-[10px] font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                          title="Field 1 is locked in place for discount stacking. Click to unlock."
                        >
                          <Lock className="w-3 h-3 text-amber-700" /> Locked: {lockedField1Code} · Unlock
                        </button>
                      ) : appliedField1Code ? (
                        <>
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            Applied: {appliedField1Code}
                          </span>
                          <button
                            onClick={() => onLockFieldCode && onLockFieldCode('field1', appliedField1Code)}
                            className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                            title="Keep this valid code locked and stack promo codes in Field 2"
                          >
                            <Lock className="w-3 h-3 text-amber-700" /> Lock & Stack Field 2
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      id={selectors.field1Input.replace('#', '')}
                      type="text"
                      placeholder="Enter coupon code (e.g. SAVE20)"
                      value={field1InputValue}
                      onChange={(e) => onField1InputChange(e.target.value)}
                      className={`flex-1 px-3 py-2 text-xs border rounded-lg uppercase tracking-wider font-mono outline-none transition-all ${
                        isHighlighted(selectors.field1Input)
                          ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/20'
                          : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white'
                      }`}
                    />
                    <button
                      id={selectors.field1Apply.replace('#', '')}
                      onClick={() => onApplyField1(field1InputValue)}
                      className={`px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-all shrink-0 ${
                        isHighlighted(selectors.field1Apply) ? 'ring-2 ring-indigo-500 scale-95' : ''
                      }`}
                    >
                      Apply Coupon
                    </button>
                  </div>
                  {appliedField1Code && (
                    <div className="mt-2.5 flex items-center justify-between text-xs bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-md">
                      <span className="text-emerald-700 font-medium">Coupon active: -${discountField1Amount.toFixed(2)}</span>
                      <button
                        className={`${selectors.removeButton.replace('.', '')} text-[11px] text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1`}
                        onClick={() => onRemoveDiscount('field1')}
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* INPUT FIELD 2: Voucher / Partner Promo Code */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <span>Field 2: Referral / Partner Promo</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                        {selectors.field2Input}
                      </span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      {lockedField2Code ? (
                        <button
                          onClick={() => onLockFieldCode && onLockFieldCode('field2', null)}
                          className="text-[10px] font-semibold text-purple-800 bg-purple-100 hover:bg-purple-200 border border-purple-300 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                          title="Field 2 is locked in place for discount stacking. Click to unlock."
                        >
                          <Lock className="w-3 h-3 text-purple-700" /> Locked: {lockedField2Code} · Unlock
                        </button>
                      ) : appliedField2Code ? (
                        <>
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            Applied: {appliedField2Code}
                          </span>
                          <button
                            onClick={() => onLockFieldCode && onLockFieldCode('field2', appliedField2Code)}
                            className="text-[10px] font-bold text-purple-800 bg-purple-100 hover:bg-purple-200 border border-purple-300 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                            title="Keep this valid code locked and stack coupon codes in Field 1"
                          >
                            <Lock className="w-3 h-3 text-purple-700" /> Lock & Stack Field 1
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      id={selectors.field2Input.replace('#', '')}
                      type="text"
                      placeholder="Enter referral / partner code (e.g. REF-ALICE)"
                      value={field2InputValue}
                      onChange={(e) => onField2InputChange(e.target.value)}
                      className={`flex-1 px-3 py-2 text-xs border rounded-lg uppercase tracking-wider font-mono outline-none transition-all ${
                        isHighlighted(selectors.field2Input)
                          ? 'border-purple-600 ring-2 ring-purple-500/30 bg-purple-50/20'
                          : 'border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white'
                      }`}
                    />
                    <button
                      id={selectors.field2Apply.replace('#', '')}
                      onClick={() => onApplyField2(field2InputValue)}
                      className={`px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition-all shrink-0 ${
                        isHighlighted(selectors.field2Apply) ? 'ring-2 ring-purple-500 scale-95' : ''
                      }`}
                    >
                      Apply Partner Code
                    </button>
                  </div>
                  {appliedField2Code && (
                    <div className="mt-2.5 flex items-center justify-between text-xs bg-purple-50 border border-purple-100 px-2.5 py-1.5 rounded-md">
                      <span className="text-purple-700 font-medium">Partner code active: -${discountField2Amount.toFixed(2)}</span>
                      <button
                        className={`${selectors.removeButton.replace('.', '')} text-[11px] text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1`}
                        onClick={() => onRemoveDiscount('field2')}
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Order Summary & Price Field */}
              <div className="lg:col-span-5">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sticky top-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                    Order Summary
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-mono tabular-nums font-medium">${subtotal.toFixed(2)}</span>
                    </div>

                    {discountField1Amount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Field 1 Discount ({appliedField1Code})</span>
                        <span className="font-mono tabular-nums">-${discountField1Amount.toFixed(2)}</span>
                      </div>
                    )}

                    {discountField2Amount > 0 && (
                      <div className="flex justify-between text-purple-700 font-medium">
                        <span>Field 2 Partner Perk ({appliedField2Code})</span>
                        <span className="font-mono tabular-nums">-${discountField2Amount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span className="font-mono tabular-nums">
                        {shippingAmount === 0 ? (
                          <span className="text-emerald-700 font-semibold">FREE</span>
                        ) : (
                          `$${shippingAmount.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Estimated Tax (6%)</span>
                      <span className="font-mono tabular-nums font-medium">
                        ${(Math.max(0, subtotal - discountField1Amount - discountField2Amount) * 0.06).toFixed(2)}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">Total Due</span>
                        <div className="text-[10px] text-slate-500 font-mono">{selectors.priceField}</div>
                      </div>
                      {/* The Primary Price Field for Automation Monitoring */}
                      <div
                        id={selectors.priceField.replace('#', '')}
                        className={`text-xl font-bold font-mono text-slate-900 tabular-nums px-2 py-1 rounded transition-all ${
                          isHighlighted(selectors.priceField)
                            ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-500 animate-pulse'
                            : ''
                        }`}
                      >
                        ${orderTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <button
                      disabled
                      className="w-full py-2.5 bg-slate-300 text-slate-500 rounded-lg text-xs font-semibold cursor-not-allowed"
                    >
                      Complete Order
                    </button>
                    <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                      Type any URL above to browse products, review cart, or test custom HTML checkout forms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Context Menu on Right-Click */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-slate-900 text-slate-100 border border-slate-700 shadow-2xl rounded-lg py-1.5 w-64 text-xs font-sans"
        >
          <div className="px-3 py-1 border-b border-slate-800 text-[10px] text-slate-400 font-mono truncate">
            Target: {contextMenu.targetSelector}
          </div>
          <div className="py-1">
            <button
              onClick={() => {
                onSelectTarget('field1Input', contextMenu.targetSelector);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Set as <strong>Field 1 Input</strong></span>
              <span className="text-[10px] text-slate-400">Coupon</span>
            </button>
            <button
              onClick={() => {
                onSelectTarget('field1Apply', contextMenu.targetSelector);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Set as <strong>Field 1 Apply Button</strong></span>
              <span className="text-[10px] text-slate-400">Button</span>
            </button>
            <button
              onClick={() => {
                onSelectTarget('field2Input', contextMenu.targetSelector);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-purple-600 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Set as <strong>Field 2 Input</strong></span>
              <span className="text-[10px] text-slate-400">Promo</span>
            </button>
            <button
              onClick={() => {
                onSelectTarget('field2Apply', contextMenu.targetSelector);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-purple-600 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Set as <strong>Field 2 Apply Button</strong></span>
              <span className="text-[10px] text-slate-400">Button</span>
            </button>
            <button
              onClick={() => {
                onSelectTarget('priceField', contextMenu.targetSelector);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Set as <strong>Price Field</strong></span>
              <span className="text-[10px] text-slate-400">Watch</span>
            </button>
            <button
              onClick={() => {
                onSelectTarget('removeButton', contextMenu.targetSelector);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-rose-600 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>Set as <strong>Remove Button</strong></span>
              <span className="text-[10px] text-slate-400">Clear</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
