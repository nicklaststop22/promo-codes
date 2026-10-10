/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Tag,
  Play,
  Pause,
  Download,
  Package,
  Layers,
  FileText,
  Compass,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Info,
  Wand2,
  Smartphone
} from 'lucide-react';
import {
  StorePreset,
  TargetSlot,
  SelectorConfig,
  AutomationSettings,
  QueueConfig,
  ValidationLogEntry,
  SequenceActionType,
  SequenceStep
} from './types';
import {
  STORE_PRESETS,
  POPULAR_PROMO_CODES,
  POPULAR_PROMO_WORDS,
  POPULAR_REFERRAL_CODES,
  DEFAULT_SEQUENCE_STEPS,
  SEQUENCE_PRESETS
} from './data/presets';
import { CheckoutSandbox } from './components/CheckoutSandbox';
import { AutomationControlPanel } from './components/AutomationControlPanel';
import { ValidationLogs } from './components/ValidationLogs';
import { ExtensionExportModal } from './components/ExtensionExportModal';
import { RoadmapModal } from './components/RoadmapModal';
import { ScraperGeneratorModal } from './components/ScraperGeneratorModal';
import { ApkExportModal } from './components/ApkExportModal';

export default function App() {
  const [currentStore, setCurrentStore] = useState<StorePreset>(STORE_PRESETS[0]);
  const [selectors, setSelectors] = useState<SelectorConfig>(STORE_PRESETS[0].selectors);
  const [activeInspectSlot, setActiveInspectSlot] = useState<TargetSlot | null>(null);

  // Field inputs & applied values
  const [field1InputValue, setField1InputValue] = useState('');
  const [field2InputValue, setField2InputValue] = useState('');
  const [appliedField1Code, setAppliedField1Code] = useState('');
  const [appliedField2Code, setAppliedField2Code] = useState('');
  const [discountField1Amount, setDiscountField1Amount] = useState(0);
  const [discountField2Amount, setDiscountField2Amount] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Settings
  const [settings, setSettings] = useState<AutomationSettings>({
    intervalMs: 1400,
    timeoutMs: 700,
    preClickDelayMs: 500, // Adjustable delay between entering fields and pressing button
    stopOnChange: true,
    stopOnPriceDrop: true,
    strategy: 'field1_first',
    autoRevertAfterFail: true,
    typeSpeedDelayMs: 60,
    enableAntiBotProtection: true,
    enableHumanJitter: true,
    minJitterMs: 40,
    maxJitterMs: 120,
    autoBackoffOn429: true,
    backoffMultiplier: 1.5,
    batchCooldownAfterAttempts: 6,
    cooldownDurationMs: 4000,
    detectCaptchaAndPause: true,
    sequenceSteps: DEFAULT_SEQUENCE_STEPS,
  });

  // Anti-bot, Rate Limiting & Cooldown states
  const [activeCaptcha, setActiveCaptcha] = useState(false);
  const [rateLimitActive, setRateLimitActive] = useState(false);
  const [rateLimitCooldownSeconds, setRateLimitCooldownSeconds] = useState(0);
  const [activeCooldownSeconds, setActiveCooldownSeconds] = useState(0);
  const [cooldownReason, setCooldownReason] = useState<string | null>(null);
  const recentAttemptsRef = useRef<number[]>([]);
  const attemptsSinceCooldownRef = useRef(0);
  const consecutiveRateLimitsRef = useRef(0);

  // Dual queues
  const [queue1, setQueue1] = useState<QueueConfig>({
    id: 'queue1',
    name: 'Field 1 (Coupon)',
    fieldTarget: 'field1',
    mode: 'paste',
    rawText: [
      'SAVE10',
      'FALL2026',
      'TESTCODE',
      'SAVE20',
      'WELCOME20',
      'VIP50',
      'FREESHIP',
      'SUMMER26',
      'DISCOUNT5',
    ].join('\n'),
    codes: [
      'SAVE10',
      'FALL2026',
      'TESTCODE',
      'SAVE20',
      'WELCOME20',
      'VIP50',
      'FREESHIP',
      'SUMMER26',
      'DISCOUNT5',
    ],
    currentIndex: 0,
    generatorSettings: {
      length: 6,
      popularPromo: true,
      popularWords: true,
      specialChars: false,
      prefix: '',
      suffix: '',
      count: 15,
    },
  });

  const [queue2, setQueue2] = useState<QueueConfig>({
    id: 'queue2',
    name: 'Field 2 (Promo / Partner)',
    fieldTarget: 'field2',
    mode: 'paste',
    rawText: ['REF-TEST', 'PARTNER20', 'REF-ALICE', 'AMBASSADOR', 'CREATOR10'].join('\n'),
    codes: ['REF-TEST', 'PARTNER20', 'REF-ALICE', 'AMBASSADOR', 'CREATOR10'],
    currentIndex: 0,
    generatorSettings: {
      length: 8,
      popularPromo: false,
      popularWords: true,
      specialChars: false,
      prefix: 'REF-',
      suffix: '',
      count: 10,
    },
  });

  const [activeQueueTab, setActiveQueueTab] = useState<'queue1' | 'queue2'>('queue1');
  const [logs, setLogs] = useState<ValidationLogEntry[]>([]);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentRunningCode, setCurrentRunningCode] = useState<string | null>(null);
  const [currentRunningField, setCurrentRunningField] = useState<string | null>(null);
  const [currentRunningStepId, setCurrentRunningStepId] = useState<SequenceActionType | null>(null);
  const [highlightedElementSelector, setHighlightedElementSelector] = useState<string | null>(null);

  // Code Locking & Stacking states ("if we have a valid coupon code i want a button or option to keep that locked in and then just try new promo fields to stack discounts")
  const [lockedField1Code, setLockedField1Code] = useState<string | null>(null);
  const [lockedField2Code, setLockedField2Code] = useState<string | null>(null);
  const [autoLockWinningCodes, setAutoLockWinningCodes] = useState<boolean>(true);

  const handleLockFieldCode = (field: 'field1' | 'field2', code: string | null) => {
    if (field === 'field1') {
      setLockedField1Code(code);
      if (code) {
        setAppliedField1Code(code);
        setField1InputValue(code);
        setFeedbackMessage({
          text: `🔒 Field 1 locked with code "${code}". Stacking mode engaged: runner will now test Field 2 to stack discounts!`,
          type: 'success',
        });
      } else {
        setFeedbackMessage({
          text: `🔓 Field 1 unlocked. Queue 1 will resume iterating.`,
          type: 'info',
        });
      }
    } else {
      setLockedField2Code(code);
      if (code) {
        setAppliedField2Code(code);
        setField2InputValue(code);
        setFeedbackMessage({
          text: `🔒 Field 2 locked with code "${code}". Stacking mode engaged: runner will now test Field 1 to stack discounts!`,
          type: 'success',
        });
      } else {
        setFeedbackMessage({
          text: `🔓 Field 2 unlocked. Queue 2 will resume iterating.`,
          type: 'info',
        });
      }
    }
  };

  // Modals
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [showScraperModal, setShowScraperModal] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [activeView, setActiveView] = useState<'split' | 'logs' | 'browser'>('split');

  // Push scraped or generated codes to queues
  const handlePushScrapedToQueue = (
    queueId: 'queue1' | 'queue2',
    codes: string[],
    mode: 'append' | 'replace'
  ) => {
    if (queueId === 'queue1') {
      setQueue1((prev) => {
        const combined =
          mode === 'replace' ? codes : Array.from(new Set([...prev.codes, ...codes]));
        return {
          ...prev,
          codes: combined,
          rawText: combined.join('\n'),
          currentIndex: mode === 'replace' ? 0 : prev.currentIndex,
        };
      });
    } else {
      setQueue2((prev) => {
        const combined =
          mode === 'replace' ? codes : Array.from(new Set([...prev.codes, ...codes]));
        return {
          ...prev,
          codes: combined,
          rawText: combined.join('\n'),
          currentIndex: mode === 'replace' ? 0 : prev.currentIndex,
        };
      });
    }
  };

  // Runners refs to handle pause / cancellation
  const isRunningRef = useRef(false);
  isRunningRef.current = isRunning;
  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;

  // Sync selectors when store preset changes
  useEffect(() => {
    setSelectors(currentStore.selectors);
    setAppliedField1Code('');
    setAppliedField2Code('');
    setDiscountField1Amount(0);
    setDiscountField2Amount(0);
    setField1InputValue('');
    setField2InputValue('');
    setFeedbackMessage(null);
  }, [currentStore]);

  // Pricing calculations
  const subtotal = currentStore.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const effectiveShipping =
    discountField1Amount > 0 && currentStore.rules[appliedField1Code]?.type === 'shipping'
      ? 0
      : currentStore.shippingCost;
  const taxableSubtotal = Math.max(0, subtotal - discountField1Amount - discountField2Amount);
  const tax = taxableSubtotal * 0.06;
  const orderTotal = Math.max(0, taxableSubtotal + effectiveShipping + tax);

  // Apply Coupon / Promo Code logic
  const handleApplyField1 = (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) {
      setFeedbackMessage({ text: 'Please enter a coupon code.', type: 'error' });
      return { success: false, message: 'Empty code', discountAmount: 0 };
    }

    const rule = currentStore.rules[code];
    if (rule && rule.field === 'field1') {
      let discount = 0;
      if (rule.type === 'percent') {
        discount = subtotal * (rule.value / 100);
      } else if (rule.type === 'fixed') {
        discount = rule.value;
      } else if (rule.type === 'shipping') {
        discount = currentStore.shippingCost;
      }

      setAppliedField1Code(code);
      setDiscountField1Amount(discount);
      const msg = `Coupon ${code} applied successfully! (${rule.description})`;
      setFeedbackMessage({ text: msg, type: 'success' });
      return { success: true, message: msg, discountAmount: discount };
    } else {
      const msg = `Coupon code "${code}" is not valid or has expired.`;
      setFeedbackMessage({ text: msg, type: 'error' });
      return { success: false, message: msg, discountAmount: 0 };
    }
  };

  const handleApplyField2 = (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) {
      setFeedbackMessage({ text: 'Please enter a promo / referral code.', type: 'error' });
      return { success: false, message: 'Empty code', discountAmount: 0 };
    }

    const rule = currentStore.rules[code];
    if (rule && rule.field === 'field2') {
      let discount = 0;
      if (rule.type === 'percent') {
        discount = subtotal * (rule.value / 100);
      } else if (rule.type === 'fixed') {
        discount = rule.value;
      }

      setAppliedField2Code(code);
      setDiscountField2Amount(discount);
      const msg = `Partner code ${code} verified! (${rule.description})`;
      setFeedbackMessage({ text: msg, type: 'success' });
      return { success: true, message: msg, discountAmount: discount };
    } else {
      const msg = `Partner / Referral code "${code}" was not found.`;
      setFeedbackMessage({ text: msg, type: 'error' });
      return { success: false, message: msg, discountAmount: 0 };
    }
  };

  const handleRemoveDiscount = (field: 'field1' | 'field2') => {
    if (field === 'field1') {
      setAppliedField1Code('');
      setDiscountField1Amount(0);
      setField1InputValue('');
    } else {
      setAppliedField2Code('');
      setDiscountField2Amount(0);
      setField2InputValue('');
    }
    setFeedbackMessage({ text: `Discount removed.`, type: 'info' });
  };

  // Inspector element targeting
  const handleSelectTarget = (slot: TargetSlot, selector: string) => {
    setSelectors((prev) => ({ ...prev, [slot]: selector }));
  };

  // Generator Presets
  const handleGenerateQueueCodes = (queueId: 'queue1' | 'queue2') => {
    const target = queueId === 'queue1' ? queue1 : queue2;
    const { length, popularPromo, popularWords, specialChars, prefix } = target.generatorSettings;

    let pool: string[] = [];
    if (popularPromo) {
      pool.push(...POPULAR_PROMO_CODES);
    }
    if (popularWords) {
      const generatedWords = POPULAR_PROMO_WORDS.map((w) => `${w}${Math.floor(Math.random() * 90 + 10)}`);
      pool.push(...generatedWords);
    }
    if (target.fieldTarget === 'field2') {
      pool.push(...POPULAR_REFERRAL_CODES);
    }

    if (prefix) {
      pool = pool.map((c) => (c.startsWith(prefix) ? c : `${prefix}${c}`));
    }

    // Filter length approximately
    pool = pool.filter((c) => c.length >= 3 && c.length <= Math.max(12, length + 4));

    // Deduplicate
    const uniqueCodes = Array.from(new Set(pool)).slice(0, 25);

    if (queueId === 'queue1') {
      setQueue1((prev) => ({
        ...prev,
        rawText: uniqueCodes.join('\n'),
        codes: uniqueCodes,
        currentIndex: 0,
      }));
    } else {
      setQueue2((prev) => ({
        ...prev,
        rawText: uniqueCodes.join('\n'),
        codes: uniqueCodes,
        currentIndex: 0,
      }));
    }
  };

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // Sequence Pipeline Handlers: allow any order and turning steps ON/OFF
  const handleToggleSequenceStep = (stepId: SequenceActionType) => {
    setSettings((prev) => ({
      ...prev,
      sequenceSteps: prev.sequenceSteps.map((step) =>
        step.id === stepId ? { ...step, enabled: !step.enabled } : step
      ),
    }));
  };

  const handleMoveSequenceStep = (stepId: SequenceActionType, direction: 'up' | 'down') => {
    setSettings((prev) => {
      const list = [...prev.sequenceSteps];
      const idx = list.findIndex((s) => s.id === stepId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, sequenceSteps: list };
    });
  };

  const handleApplySequencePreset = (presetSteps: SequenceStep[]) => {
    setSettings((prev) => ({
      ...prev,
      sequenceSteps: presetSteps,
    }));
  };

  const checkRateLimitingAndCooldown = async () => {
    const now = Date.now();
    recentAttemptsRef.current = [
      ...recentAttemptsRef.current.filter((t) => now - t < 4000),
      now,
    ];

    if (recentAttemptsRef.current.length >= 4 && !settings.enableAntiBotProtection) {
      setRateLimitActive(true);
      const backoffSec = 6;
      setRateLimitCooldownSeconds(backoffSec);
      setFeedbackMessage({
        text: '⚠️ HTTP 429: Store rate limit reached. Velocity throttling engaged.',
        type: 'error',
      });

      if (settings.autoBackoffOn429) {
        setCooldownReason(`Rate Limit 429 Backoff (${backoffSec}s)`);
        for (let s = backoffSec; s > 0; s -= 0.5) {
          if (!isRunningRef.current) break;
          setActiveCooldownSeconds(s);
          setRateLimitCooldownSeconds(Math.ceil(s));
          await sleep(500);
        }
        setActiveCooldownSeconds(0);
        setRateLimitActive(false);
        setCooldownReason(null);
      }
    }
  };

  const checkBatchCooldown = async () => {
    attemptsSinceCooldownRef.current += 1;
    if (
      settings.batchCooldownAfterAttempts > 0 &&
      attemptsSinceCooldownRef.current >= settings.batchCooldownAfterAttempts
    ) {
      attemptsSinceCooldownRef.current = 0;
      const cooldownSec = settings.cooldownDurationMs / 1000;
      setCooldownReason(`Batch Throttle Cooldown (${cooldownSec}s)`);
      for (let s = cooldownSec; s > 0; s -= 0.5) {
        if (!isRunningRef.current) break;
        setActiveCooldownSeconds(s);
        await sleep(500);
      }
      setActiveCooldownSeconds(0);
      setCooldownReason(null);
    }
  };

  // Pipeline Execution Cycle: executes enabled sequence steps in the user-specified order
  const executePipelineCycle = async (
    code1: string,
    code2: string
  ): Promise<{ isHit: boolean; savings: number }> => {
    if (activeCaptcha && settings.detectCaptchaAndPause) {
      setIsRunning(false);
      setIsPaused(true);
      isRunningRef.current = false;
      setFeedbackMessage({
        text: '⚠️ Captcha challenge detected! Solve challenge in browser and click Resume.',
        type: 'error',
      });
      return { isHit: false, savings: 0 };
    }

    let cycleHit = false;
    let cycleSavings = 0;

    const activeSteps = settings.sequenceSteps.filter((s) => s.enabled);
    if (activeSteps.length === 0) {
      setFeedbackMessage({
        text: 'All pipeline steps are turned off. Enable at least one field or button.',
        type: 'error',
      });
      return { isHit: false, savings: 0 };
    }

    for (let i = 0; i < activeSteps.length; i++) {
      if (!isRunningRef.current) break;
      while (isPausedRef.current) {
        await sleep(200);
        if (!isRunningRef.current) break;
      }

      const step = activeSteps[i];
      setCurrentRunningStepId(step.action);

      const jitter = settings.enableHumanJitter
        ? Math.floor(Math.random() * (settings.maxJitterMs - settings.minJitterMs + 1)) - 40
        : 0;

      if (step.action === 'field1') {
        setCurrentRunningCode(code1);
        setCurrentRunningField(`Step ${i + 1}: Typing Field 1 (${code1})`);
        setHighlightedElementSelector(selectors.field1Input);
        setField1InputValue(code1);

        // Dispatch into live DOM if element exists in playground or checkout
        try {
          const el = document.querySelector(selectors.field1Input) as HTMLInputElement | null;
          if (el) {
            el.value = code1;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } catch (_) {}

        const delay = Math.max(80, (step.delayMs || settings.preClickDelayMs) + jitter);
        await sleep(delay);
      } else if (step.action === 'button1') {
        setCurrentRunningField(`Step ${i + 1}: Clicking Button 1`);
        setHighlightedElementSelector(selectors.field1Apply);
        await checkRateLimitingAndCooldown();

        const beforePrice = orderTotal;
        try {
          const btn = document.querySelector(selectors.field1Apply) as HTMLElement | null;
          if (btn) btn.click();
        } catch (_) {}

        const result = handleApplyField1(field1InputValue || code1);
        const timeout = Math.max(100, (step.delayMs || settings.timeoutMs) + jitter);
        await sleep(timeout);

        const afterPrice = result.success ? Math.max(0, beforePrice - result.discountAmount) : beforePrice;
        const savings = beforePrice - afterPrice;
        const isHit = result.success && savings > 0;
        if (isHit) {
          cycleHit = true;
          cycleSavings += savings;
        }

        const newEntry: ValidationLogEntry = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toLocaleTimeString(),
          fieldTarget: 'field1',
          fieldName: 'Field 1: Coupon (Button 1)',
          code: code1 || field1InputValue,
          outcome: isHit ? 'SUCCESS' : 'INVALID',
          beforePrice,
          afterPrice,
          savings: isHit ? savings : 0,
          savingsPercent: beforePrice > 0 ? (savings / beforePrice) * 100 : 0,
          message: result.message,
        };
        setLogs((prev) => [newEntry, ...prev]);
        await checkBatchCooldown();
      } else if (step.action === 'field2') {
        setCurrentRunningCode(code2);
        setCurrentRunningField(`Step ${i + 1}: Typing Field 2 (${code2})`);
        setHighlightedElementSelector(selectors.field2Input);
        setField2InputValue(code2);

        try {
          const el = document.querySelector(selectors.field2Input) as HTMLInputElement | null;
          if (el) {
            el.value = code2;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } catch (_) {}

        const delay = Math.max(80, (step.delayMs || settings.preClickDelayMs) + jitter);
        await sleep(delay);
      } else if (step.action === 'button2') {
        setCurrentRunningField(`Step ${i + 1}: Clicking Button 2`);
        setHighlightedElementSelector(selectors.field2Apply);
        await checkRateLimitingAndCooldown();

        const beforePrice = orderTotal;
        try {
          const btn = document.querySelector(selectors.field2Apply) as HTMLElement | null;
          if (btn) btn.click();
        } catch (_) {}

        const result = handleApplyField2(field2InputValue || code2);
        const timeout = Math.max(100, (step.delayMs || settings.timeoutMs) + jitter);
        await sleep(timeout);

        const afterPrice = result.success ? Math.max(0, beforePrice - result.discountAmount) : beforePrice;
        const savings = beforePrice - afterPrice;
        const isHit = result.success && savings > 0;
        if (isHit) {
          cycleHit = true;
          cycleSavings += savings;
        }

        const newEntry: ValidationLogEntry = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toLocaleTimeString(),
          fieldTarget: 'field2',
          fieldName: 'Field 2: Promo (Button 2)',
          code: code2 || field2InputValue,
          outcome: isHit ? 'SUCCESS' : 'INVALID',
          beforePrice,
          afterPrice,
          savings: isHit ? savings : 0,
          savingsPercent: beforePrice > 0 ? (savings / beforePrice) * 100 : 0,
          message: result.message,
        };
        setLogs((prev) => [newEntry, ...prev]);
        await checkBatchCooldown();
      }
    }

    setHighlightedElementSelector(null);
    setCurrentRunningStepId(null);
    return { isHit: cycleHit, savings: cycleSavings };
  };

  // Main Automation Loop
  const startAutomation = async () => {
    const activeSteps = settings.sequenceSteps.filter((s) => s.enabled);
    if (activeSteps.length === 0) {
      setFeedbackMessage({
        text: 'All sequence steps are currently turned off. Turn on at least one field or button!',
        type: 'error',
      });
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    isRunningRef.current = true;
    isPausedRef.current = false;

    let q1 = [...queue1.codes];
    let q2 = [...queue2.codes];
    let idx1 = queue1.currentIndex;
    let idx2 = queue2.currentIndex;

    const usesField1 = activeSteps.some((s) => s.action === 'field1' || s.action === 'button1');
    const usesField2 = activeSteps.some((s) => s.action === 'field2' || s.action === 'button2');

    try {
      while (isRunningRef.current) {
        if (isPausedRef.current) {
          await sleep(200);
          continue;
        }

        let code1 = '';
        let code2 = '';
        let shouldAdvance1 = false;
        let shouldAdvance2 = false;

        if (usesField1 && usesField2) {
          // If Field 1 is locked in, keep locked code and do not advance Queue 1!
          if (lockedField1Code) {
            code1 = lockedField1Code;
            shouldAdvance1 = false;
          } else if (idx1 < q1.length) {
            code1 = q1[idx1];
            shouldAdvance1 = true;
          } else {
            code1 = q1[q1.length - 1] || '';
          }

          // If Field 2 is locked in, keep locked code and do not advance Queue 2!
          if (lockedField2Code) {
            code2 = lockedField2Code;
            shouldAdvance2 = false;
          } else if (idx2 < q2.length) {
            code2 = q2[idx2];
            shouldAdvance2 = true;
          } else {
            code2 = q2[q2.length - 1] || '';
          }

          const f1Done = lockedField1Code ? true : idx1 >= q1.length;
          const f2Done = lockedField2Code ? true : idx2 >= q2.length;
          if (f1Done && f2Done) {
            break;
          }
        } else if (usesField1) {
          if (lockedField1Code) {
            code1 = lockedField1Code;
            shouldAdvance1 = false;
            break;
          } else if (idx1 >= q1.length) {
            break;
          }
          code1 = q1[idx1];
          shouldAdvance1 = true;
        } else if (usesField2) {
          if (lockedField2Code) {
            code2 = lockedField2Code;
            shouldAdvance2 = false;
            break;
          } else if (idx2 >= q2.length) {
            break;
          }
          code2 = q2[idx2];
          shouldAdvance2 = true;
        } else {
          code1 = field1InputValue;
          code2 = field2InputValue;
        }

        const { isHit } = await executePipelineCycle(code1, code2);

        // Auto-Lock Winning Hit if option enabled
        if (isHit && autoLockWinningCodes) {
          if (appliedField1Code && !lockedField1Code) {
            setLockedField1Code(appliedField1Code);
          }
          if (appliedField2Code && !lockedField2Code) {
            setLockedField2Code(appliedField2Code);
          }
        }

        if (shouldAdvance1) {
          idx1++;
          setQueue1((prev) => ({ ...prev, currentIndex: idx1 }));
        }
        if (shouldAdvance2) {
          idx2++;
          setQueue2((prev) => ({ ...prev, currentIndex: idx2 }));
        }

        // STOP AND WAIT FOR REVIEW (Stop on discount hit)
        if (isHit && settings.stopOnChange) {
          setIsRunning(false);
          setIsPaused(true);
          isRunningRef.current = false;
          setCurrentRunningCode(null);
          setHighlightedElementSelector(selectors.priceField);
          setTimeout(() => setHighlightedElementSelector(null), 3500);
          break;
        }

        await sleep(settings.intervalMs);
      }
    } finally {
      setIsRunning(false);
      setCurrentRunningCode(null);
      setCurrentRunningField(null);
      setCurrentRunningStepId(null);
      setHighlightedElementSelector(null);
    }
  };

  const handlePauseAutomation = () => {
    setIsPaused(true);
    isPausedRef.current = true;
  };

  const handleStepAutomation = async () => {
    let q1 = [...queue1.codes];
    let q2 = [...queue2.codes];
    let idx1 = queue1.currentIndex;
    let idx2 = queue2.currentIndex;

    let code1 = idx1 < q1.length ? q1[idx1] : (q1[0] || field1InputValue);
    let code2 = idx2 < q2.length ? q2[idx2] : (q2[0] || field2InputValue);

    await executePipelineCycle(code1, code2);

    if (idx1 < q1.length) {
      setQueue1((prev) => ({ ...prev, currentIndex: idx1 + 1 }));
    }
    if (idx2 < q2.length) {
      setQueue2((prev) => ({ ...prev, currentIndex: idx2 + 1 }));
    }
  };

  const handleResetAutomation = () => {
    setIsRunning(false);
    setIsPaused(false);
    isRunningRef.current = false;
    isPausedRef.current = false;
    setCurrentRunningCode(null);
    setCurrentRunningField(null);
    setCurrentRunningStepId(null);
    setHighlightedElementSelector(null);
    setQueue1((prev) => ({ ...prev, currentIndex: 0 }));
    setQueue2((prev) => ({ ...prev, currentIndex: 0 }));
    handleRemoveDiscount('field1');
    handleRemoveDiscount('field2');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar following Top Bar Contract: Brand Zone — 4-5 Nav Links — 1 Primary Action */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
            <Tag className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            Promo Codes Applier Studio
          </span>
        </div>

        {/* Zone 2: 4-5 single-line clean nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveView('split')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'split' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Studio Workspace
          </button>
          <button
            onClick={() => setActiveView('browser')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'browser' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Browser View
          </button>
          <button
            onClick={() => setActiveView('logs')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'logs' ? 'text-indigo-400 font-semibold' : ''
            }`}
          >
            Validation Telemetry ({logs.length})
          </button>
          <button
            onClick={() => setShowScraperModal(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            Word Scraper & Generator
          </button>
          <button
            onClick={() => setShowRoadmapModal(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            Architecture & Roadmap
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile option */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowApkModal(true)}
            className="px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 border border-slate-750 shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            Android APK / Mobile
          </button>
          <button
            onClick={() => setShowExtensionModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Package className="w-3.5 h-3.5" />
            Export Chrome Extension
          </button>
        </div>
      </header>

      {/* Main Workspace Content */}
      <main className="flex-1 p-4 lg:p-6 flex flex-col gap-6 max-w-[1720px] w-full mx-auto">
        {/* Top Operational Status Strip */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200">Current Target Sandbox:</span>
            <span className="text-indigo-300 font-medium">{currentStore.name}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">{currentStore.category}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <div>
              <span className="text-slate-500">Cart Baseline:</span>{' '}
              <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500">Current Total:</span>{' '}
              <span className="font-mono font-bold text-emerald-400 tabular-nums">
                ${orderTotal.toFixed(2)}
              </span>
            </div>
            {(discountField1Amount > 0 || discountField2Amount > 0) && (
              <div className="text-emerald-400 font-medium font-mono">
                Total Saved: -${(discountField1Amount + discountField2Amount).toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Studio Split Layout */}
        {activeView === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[680px]">
            {/* Left 4 cols: Automation Control Drawer (Screenshot Extension UI) */}
            <div className="lg:col-span-5 xl:col-span-4 h-full min-h-[620px]">
              <AutomationControlPanel
                selectors={selectors}
                onArmInspector={(slot) => setActiveInspectSlot(slot)}
                activeInspectSlot={activeInspectSlot}
                settings={settings}
                onUpdateSettings={(s) => setSettings((prev) => ({ ...prev, ...s }))}
                queue1={queue1}
                queue2={queue2}
                onUpdateQueue={(qId, updates) => {
                  if (qId === 'queue1') setQueue1((prev) => ({ ...prev, ...updates }));
                  else setQueue2((prev) => ({ ...prev, ...updates }));
                }}
                onGenerateQueueCodes={handleGenerateQueueCodes}
                onOpenScraperModal={() => setShowScraperModal(true)}
                isRunning={isRunning}
                isPaused={isPaused}
                onStartAutomation={startAutomation}
                onPauseAutomation={handlePauseAutomation}
                onStepAutomation={handleStepAutomation}
                onResetAutomation={handleResetAutomation}
                activeQueueTab={activeQueueTab}
                onSetActiveQueueTab={setActiveQueueTab}
                currentRunningCode={currentRunningCode}
                currentRunningField={currentRunningField}
                totalAttemptsCount={logs.length}
                activeCooldownSeconds={activeCooldownSeconds}
                cooldownReason={cooldownReason}
                onToggleSequenceStep={handleToggleSequenceStep}
                onMoveSequenceStep={handleMoveSequenceStep}
                onApplySequencePreset={handleApplySequencePreset}
                currentRunningStepId={currentRunningStepId}
                lockedField1Code={lockedField1Code}
                lockedField2Code={lockedField2Code}
                onLockFieldCode={handleLockFieldCode}
                autoLockWinningCodes={autoLockWinningCodes}
                onToggleAutoLock={setAutoLockWinningCodes}
                appliedField1Code={appliedField1Code}
                appliedField2Code={appliedField2Code}
              />
            </div>

            {/* Right 8 cols: Live Interactive Web Browser & Checkout Sandbox */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
              <div className="flex-1 min-h-[480px]">
                <CheckoutSandbox
                  currentStore={currentStore}
                  onSelectStore={setCurrentStore}
                  selectors={selectors}
                  onSelectTarget={handleSelectTarget}
                  activeInspectSlot={activeInspectSlot}
                  onCancelInspect={() => setActiveInspectSlot(null)}
                  appliedField1Code={appliedField1Code}
                  appliedField2Code={appliedField2Code}
                  field1InputValue={field1InputValue}
                  field2InputValue={field2InputValue}
                  onField1InputChange={setField1InputValue}
                  onField2InputChange={setField2InputValue}
                  onApplyField1={handleApplyField1}
                  onApplyField2={handleApplyField2}
                  onRemoveDiscount={handleRemoveDiscount}
                  orderTotal={orderTotal}
                  subtotal={subtotal}
                  discountField1Amount={discountField1Amount}
                  discountField2Amount={discountField2Amount}
                  shippingAmount={effectiveShipping}
                  feedbackMessage={feedbackMessage}
                  highlightedElementSelector={highlightedElementSelector}
                  activeCaptcha={activeCaptcha}
                  onSolveCaptcha={() => setActiveCaptcha(false)}
                  rateLimitActive={rateLimitActive}
                  rateLimitCooldownSeconds={rateLimitCooldownSeconds}
                  onTriggerSimulatedChallenge={() => setActiveCaptcha(true)}
                  sequenceSteps={settings.sequenceSteps}
                  onToggleSequenceStep={handleToggleSequenceStep}
                  onMoveSequenceStep={handleMoveSequenceStep}
                  onApplySequencePreset={handleApplySequencePreset}
                  currentRunningStepId={currentRunningStepId}
                  lockedField1Code={lockedField1Code}
                  lockedField2Code={lockedField2Code}
                  onLockFieldCode={handleLockFieldCode}
                />
              </div>

              {/* Bottom Validation History Strip */}
              <div className="h-[280px]">
                <ValidationLogs
                  logs={logs}
                  onClearLogs={() => setLogs([])}
                  onApplyCodeToSandbox={(field, code) => {
                    if (field === 'field1') handleApplyField1(code);
                    else handleApplyField2(code);
                  }}
                  onLockCode={handleLockFieldCode}
                />
              </div>
            </div>
          </div>
        )}

        {/* View 2: Full Screen Browser View */}
        {activeView === 'browser' && (
          <div className="h-[800px]">
            <CheckoutSandbox
              currentStore={currentStore}
              onSelectStore={setCurrentStore}
              selectors={selectors}
              onSelectTarget={handleSelectTarget}
              activeInspectSlot={activeInspectSlot}
              onCancelInspect={() => setActiveInspectSlot(null)}
              appliedField1Code={appliedField1Code}
              appliedField2Code={appliedField2Code}
              field1InputValue={field1InputValue}
              field2InputValue={field2InputValue}
              onField1InputChange={setField1InputValue}
              onField2InputChange={setField2InputValue}
              onApplyField1={handleApplyField1}
              onApplyField2={handleApplyField2}
              onRemoveDiscount={handleRemoveDiscount}
              orderTotal={orderTotal}
              subtotal={subtotal}
              discountField1Amount={discountField1Amount}
              discountField2Amount={discountField2Amount}
              shippingAmount={effectiveShipping}
              feedbackMessage={feedbackMessage}
              highlightedElementSelector={highlightedElementSelector}
              activeCaptcha={activeCaptcha}
              onSolveCaptcha={() => setActiveCaptcha(false)}
              rateLimitActive={rateLimitActive}
              rateLimitCooldownSeconds={rateLimitCooldownSeconds}
              onTriggerSimulatedChallenge={() => setActiveCaptcha(true)}
              sequenceSteps={settings.sequenceSteps}
              onToggleSequenceStep={handleToggleSequenceStep}
              onMoveSequenceStep={handleMoveSequenceStep}
              onApplySequencePreset={handleApplySequencePreset}
              currentRunningStepId={currentRunningStepId}
              lockedField1Code={lockedField1Code}
              lockedField2Code={lockedField2Code}
              onLockFieldCode={handleLockFieldCode}
            />
          </div>
        )}

        {/* View 3: Full Screen Logs View */}
        {activeView === 'logs' && (
          <div className="h-[800px]">
            <ValidationLogs
              logs={logs}
              onClearLogs={() => setLogs([])}
              onApplyCodeToSandbox={(field, code) => {
                if (field === 'field1') handleApplyField1(code);
                else handleApplyField2(code);
              }}
              onLockCode={handleLockFieldCode}
            />
          </div>
        )}
      </main>

      {/* Chrome Extension Modal */}
      <ExtensionExportModal
        isOpen={showExtensionModal}
        onClose={() => setShowExtensionModal(false)}
        selectors={selectors}
        settings={settings}
        queue1={queue1}
        queue2={queue2}
      />

      {/* Architecture & Feature Roadmap Modal */}
      <RoadmapModal
        isOpen={showRoadmapModal}
        onClose={() => setShowRoadmapModal(false)}
      />

      {/* Promo Code Word Scraper & Generator Modal */}
      <ScraperGeneratorModal
        isOpen={showScraperModal}
        onClose={() => setShowScraperModal(false)}
        onPushToQueue={handlePushScrapedToQueue}
        currentStoreName={currentStore.name}
      />

      {/* Android APK & Mobile Deployment Modal */}
      <ApkExportModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
      />
    </div>
  );
}
