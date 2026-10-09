import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  RotateCcw,
  Tag,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShoppingBag,
  Trash2,
  Crosshair,
  ExternalLink,
  Laptop,
  Smartphone,
  Eye,
  Sliders,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { StorePreset, TargetSlot, SelectorConfig } from '../types';
import { STORE_PRESETS } from '../data/presets';

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
}) => {
  const [viewportWidth, setViewportWidth] = useState<'100%' | '768px'>('100%');
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

  const handleSandboxRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    if (!target) return;

    // Generate readable CSS selector
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

    // If an inspector slot is already armed, assign it immediately!
    if (activeInspectSlot) {
      onSelectTarget(activeInspectSlot, sel);
      onCancelInspect();
      return;
    }

    // Otherwise show quick assignment context menu
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
      {/* Browser Chrome Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="text-slate-400 font-medium ml-2 hidden sm:inline">Checkout Web Browser</span>
        </div>

        {/* URL Bar & Store Preset Switcher */}
        <div className="flex items-center flex-1 max-w-2xl bg-slate-900 border border-slate-750 rounded-lg px-3 py-1.5 gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-emerald-400 font-mono text-[11px] shrink-0">https://</span>
          
          <select
            className="bg-transparent text-slate-200 outline-none cursor-pointer font-mono text-[11px] flex-1 truncate"
            value={currentStore.id}
            onChange={(e) => {
              const selected = STORE_PRESETS.find((s) => s.id === e.target.value);
              if (selected) onSelectStore(selected);
            }}
          >
            {STORE_PRESETS.map((store) => (
              <option key={store.id} value={store.id} className="bg-slate-900 text-slate-200">
                {store.name} ({store.category})
              </option>
            ))}
          </select>

          <span className="text-slate-400 text-[10px] hidden md:inline font-mono">/checkout/v2</span>
        </div>

        {/* Viewport & Controls */}
        <div className="flex items-center gap-1 shrink-0">
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

      {/* Inspector Mode Banner */}
      {activeInspectSlot && (
        <div className="bg-indigo-600 px-4 py-2 text-white text-xs flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 font-medium">
            <Crosshair className="w-4 h-4" />
            <span>
              Target Inspector Armed: Click or right-click any element in the checkout page below to bind to{' '}
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

      {/* Browser Viewport Canvas */}
      <div
        className="flex-1 overflow-y-auto bg-slate-950/60 p-4 sm:p-6 flex justify-center items-start relative"
        onContextMenu={handleSandboxRightClick}
        onClick={handleElementClick}
      >
        <div
          style={{ width: viewportWidth }}
          className="transition-all duration-200 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 overflow-hidden min-h-[580px] flex flex-col"
        >
          {/* E-commerce Store Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                {currentStore.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-sm tracking-tight">{currentStore.name}</h2>
                <p className="text-[11px] text-slate-400">{currentStore.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              <span>Checkout Order #48291</span>
            </div>
          </div>

          {/* Checkout Body Grid */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
            {/* Left: Cart Items & Inputs */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Cart Contents ({currentStore.items.length} items)
                </h3>
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
                  <div className="font-medium">{feedbackMessage.text}</div>
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
                  {appliedField1Code && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      Applied: {appliedField1Code}
                    </span>
                  )}
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
                  {appliedField2Code && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      Applied: {appliedField2Code}
                    </span>
                  )}
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

                <div className="mt-5">
                  <button
                    disabled
                    className="w-full py-2.5 bg-slate-300 text-slate-500 rounded-lg text-xs font-semibold cursor-not-allowed"
                  >
                    Simulated Complete Order
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    Live interactive sandbox. You can right-click any element to set as target selector.
                  </p>
                </div>
              </div>
            </div>
          </div>
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
