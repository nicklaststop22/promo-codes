import React from 'react';
import {
  X,
  Compass,
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Workflow,
  Cpu,
  Database,
  BellRing,
  GitBranch
} from 'lucide-react';

interface RoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                System Architecture, Expansion Features & Development Roadmap
              </h3>
              <p className="text-[11px] text-slate-400">
                Engineering analysis of the multi-field coupon/wordlist automation browser engine.
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* Phase 1 Implemented */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Phase 1: Implemented Core Engine (Active)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1.5">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Workflow className="w-4 h-4 text-indigo-400" />
                  Dual-Field Independent Queues
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Support for distinct coupon and promo/referral input fields with independent wordlists, interleaved or sequential trial execution.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1.5">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Live DOM Selector Inspector
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Right-click context menu and click-to-pick arming to easily bind input fields, apply buttons, price containers, and remove actions.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1.5">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  Automated Price-Drop Watcher & Review Pause
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Monitors the targeted price element for numeric delta drops, immediately pausing automation to let the user review valid discount codes.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1.5">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-purple-400" />
                  Validation Telemetry & Export Kit
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Real-time audit log tracking before/after prices, percentage savings, failure messages, with CSV and JSON exports and Chrome Extension unpack generator.
                </p>
              </div>
            </div>
          </section>

          {/* Phase 2 Proposed Additional Features */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Recommended Next-Gen Feature Additions</span>
            </div>
            <div className="space-y-2.5">
              <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-lg">
                <div className="font-semibold text-indigo-300">1. Combinatorial Stacking Optimizer (Field 1 × Field 2)</div>
                <p className="text-slate-400 mt-1">
                  When websites allow stacking a coupon code + a referral/gift code, run a Cartesian product matrix (e.g. 5 coupons × 5 promos = 25 pairs) to discover the mathematical maximum combined discount.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-lg">
                <div className="font-semibold text-indigo-300">2. Anti-Bot / Rate-Limit Exponential Backoff</div>
                <p className="text-slate-400 mt-1">
                  E-commerce checkouts often throttle repeated button clicks (HTTP 429). An intelligent engine detects "Too many attempts" banners or captcha iframes and automatically increases interval delays or prompts a manual captcha solve.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-lg">
                <div className="font-semibold text-indigo-300">3. Crowd-Sourced / Community Coupon Scraper Feeds</div>
                <p className="text-slate-400 mt-1">
                  Auto-fetch active coupon wordlists directly from public deals APIs, Reddit communities (r/deals, r/coupons), or Honey/RetailMeNot publicly verified coupon caches.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-lg">
                <div className="font-semibold text-indigo-300">4. Webhook Alerts (Discord / Telegram / Slack)</div>
                <p className="text-slate-400 mt-1">
                  Instant webhook notification fired when a coupon hits a verified price reduction exceeding a specified threshold (e.g. &gt; $20 or &gt; 15% off).
                </p>
              </div>
            </div>
          </section>

          {/* Technical Architecture Overview */}
          <section className="space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Technical Architecture & Mutation Observer Pattern
            </div>
            <p className="text-slate-400 leading-relaxed">
              In production Chrome extensions, modern checkout SPAs (Shopify Checkout Extensibility, Magento, BigCommerce, Stripe Checkout) render asynchronously. The content script uses a <code className="text-indigo-300 font-mono">MutationObserver</code> on the price DOM node alongside synthetic <code className="text-indigo-300 font-mono">InputEvent</code> and <code className="text-indigo-300 font-mono">KeyboardEvent</code> dispatches so React and Vue controlled inputs register the simulated wordlist values properly without getting wiped.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
