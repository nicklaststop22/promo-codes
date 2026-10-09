export type TargetSlot =
  | 'field1Input'
  | 'field1Apply'
  | 'field2Input'
  | 'field2Apply'
  | 'priceField'
  | 'removeButton'
  | 'statusMessage';

export interface SelectorConfig {
  field1Input: string;
  field1Apply: string;
  field2Input: string;
  field2Apply: string;
  priceField: string;
  removeButton: string;
  statusMessage: string;
}

export type QueueInputMode = 'paste' | 'file' | 'generator';

export interface GeneratorSettings {
  length: number;
  popularPromo: boolean;
  popularWords: boolean;
  specialChars: boolean;
  prefix: string;
  suffix: string;
  count: number;
}

export interface QueueConfig {
  id: 'queue1' | 'queue2';
  name: string;
  fieldTarget: 'field1' | 'field2';
  mode: QueueInputMode;
  rawText: string;
  codes: string[];
  currentIndex: number;
  generatorSettings: GeneratorSettings;
}

export type ExecutionStrategy = 'field1_first' | 'field2_first' | 'interleaved' | 'field1_only' | 'field2_only';

export interface AutomationSettings {
  intervalMs: number;
  timeoutMs: number;
  preClickDelayMs: number; // Adjustable delay between entering fields and pressing button
  stopOnChange: boolean;
  stopOnPriceDrop: boolean;
  strategy: ExecutionStrategy;
  autoRevertAfterFail: boolean;
  typeSpeedDelayMs: number;
  // Anti-Bot & Rate Limiting Protections
  enableAntiBotProtection: boolean;
  enableHumanJitter: boolean;
  minJitterMs: number;
  maxJitterMs: number;
  autoBackoffOn429: boolean;
  backoffMultiplier: number;
  batchCooldownAfterAttempts: number;
  cooldownDurationMs: number;
  detectCaptchaAndPause: boolean;
}

export type ValidationOutcome = 'SUCCESS' | 'INVALID' | 'EXPIRED' | 'NO_CHANGE' | 'ERROR' | 'RATE_LIMITED' | 'CAPTCHA_BLOCKED';

export interface ValidationLogEntry {
  id: string;
  timestamp: string;
  fieldTarget: 'field1' | 'field2' | 'combo';
  fieldName: string;
  code: string;
  outcome: ValidationOutcome;
  beforePrice: number;
  afterPrice: number;
  savings: number;
  savingsPercent: number;
  message: string;
}

export interface StoreItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface StoreDiscountRule {
  type: 'percent' | 'fixed' | 'shipping';
  value: number;
  description: string;
  minSubtotal?: number;
  field: 'field1' | 'field2';
}

export interface StorePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  shippingCost: number;
  items: StoreItem[];
  rules: Record<string, StoreDiscountRule>;
  selectors: SelectorConfig;
}
