// Algorithmic Promo Code Scraper & Wordlist Generator Engine

export interface ScrapedCodeResult {
  code: string;
  confidence: 'HIGH' | 'MEDIUM' | 'EXPERIMENTAL';
  source: 'PROMO_KEYWORD' | 'PATTERN_MATCH' | 'BRAND_COMBINATION' | 'DISCOUNT_TOKEN';
  contextSnippet?: string;
}

export interface CombinatorOptions {
  brandName: string;
  includePercentages: boolean;
  includeSeasons: boolean;
  includeYears: boolean;
  includeWelcome: boolean;
  includeShipping: boolean;
  includeVip: boolean;
  separators: string[]; // '', '-', '_'
  caseMode: 'UPPER' | 'LOWER';
}

// Common false positives to filter out from raw HTML / text
const STOP_WORDS = new Set([
  'HTML', 'HTTP', 'HTTPS', 'HEAD', 'BODY', 'META', 'SPAN', 'DIV', 'HREF', 'TRUE', 'FALSE',
  'NULL', 'UNDEFINED', 'WIDTH', 'HEIGHT', 'COLOR', 'STYLE', 'CLASS', 'VALUE', 'INPUT',
  'BUTTON', 'SUBMIT', 'FORM', 'SCRIPT', 'LINK', 'IMAGE', 'HEADER', 'FOOTER', 'SECTION',
  'CONTAINER', 'WRAPPER', 'BORDER', 'MARGIN', 'PADDING', 'ORDER', 'CHECKOUT', 'TOTAL',
  'SUBTOTAL', 'PRICE', 'SHIPPING', 'DISCOUNT', 'COUPON', 'PROMO', 'VOUCHER', 'APPLY',
  'REMOVE', 'CANCEL', 'RESET', 'CLEAR', 'TERMS', 'POLICY', 'PRIVACY', 'COOKIE', 'SEARCH',
  'LOGIN', 'SIGNUP', 'LOGOUT', 'ACCOUNT', 'PASSWORD', 'EMAIL', 'PHONE', 'ADDRESS', 'STREET',
  'COUNTRY', 'STATE', 'CITY', 'POSTAL', 'CREDIT', 'CARD', 'EXPIRY', 'MONTH', 'YEAR', 'PAYMENT',
  'PAYPAL', 'APPLE', 'GOOGLE', 'STRIPE', 'AMAZON', 'MASTER', 'VISA', 'DISCOVER', 'RIGHTS',
  'RESERVED', 'COPYRIGHT', 'ABOUT', 'CONTACT', 'RETURN', 'REFUND', 'SUPPORT', 'HELP', 'FAQ'
]);

// Known retail discount prefixes & stems
const DISCOUNT_PREFIXES = ['SAVE', 'OFF', 'GET', 'TAKE', 'EXTRA', 'DISCOUNT', 'PROMO', 'DEAL'];
const DISCOUNT_TIERS = ['5', '10', '15', '20', '25', '30', '35', '40', '50', '60', '70'];
const SEASONS = ['SPRING', 'SUMMER', 'FALL', 'AUTUMN', 'WINTER', 'BF', 'CYBER', 'HOLIDAY', 'EASTER'];
const YEARS = ['26', '2026', '25', '2025'];

/**
 * Scrapes and extracts promo codes from raw text, HTML, or deal posts
 */
export function scrapeCodesFromText(rawText: string): ScrapedCodeResult[] {
  if (!rawText || !rawText.trim()) return [];

  const results = new Map<string, ScrapedCodeResult>();

  // 1. High confidence: Text preceded by "code:", "use code", "coupon:", "promo:", "promo code", etc.
  const contextRegex = /(?:code|coupon|promo|voucher|discount|use|enter)[\s:=#\-–]+([A-Za-z0-9_\-]{3,16})\b/gi;
  let match: RegExpExecArray | null;
  while ((match = contextRegex.exec(rawText)) !== null) {
    const rawMatch = match[1].trim().toUpperCase();
    if (isValidCode(rawMatch)) {
      const start = Math.max(0, match.index - 20);
      const end = Math.min(rawText.length, match.index + match[0].length + 20);
      results.set(rawMatch, {
        code: rawMatch,
        confidence: 'HIGH',
        source: 'PROMO_KEYWORD',
        contextSnippet: rawText.substring(start, end).trim(),
      });
    }
  }

  // 2. High confidence: Standard discount patterns like SAVE20, OFF15, WELCOME10, FREESHIP, VIP50
  const patternRegex = /\b((?:SAVE|OFF|GET|EXTRA|WELCOME|FREESHIP|VIP|DEAL|SUMMER|SPRING|FALL|WINTER|CYBER|BF)[0-9]{1,3}(?:OFF)?)\b/gi;
  while ((match = patternRegex.exec(rawText)) !== null) {
    const code = match[1].trim().toUpperCase();
    if (isValidCode(code) && !results.has(code)) {
      results.set(code, {
        code,
        confidence: 'HIGH',
        source: 'PATTERN_MATCH',
        contextSnippet: `Recognized discount pattern "${code}"`,
      });
    }
  }

  // 3. Medium confidence: Uppercase alphanumeric tokens that look like coupon codes (e.g. FIRST15, APEX20, REF-ALICE)
  const tokenRegex = /\b([A-Z0-9]{2,8}[-_]?[A-Z0-9]{2,8})\b/g;
  while ((match = tokenRegex.exec(rawText)) !== null) {
    const token = match[1].trim().toUpperCase();
    if (
      isValidCode(token) &&
      !results.has(token) &&
      !STOP_WORDS.has(token) &&
      (hasDigitsAndLetters(token) || token.includes('-') || token.includes('_'))
    ) {
      results.set(token, {
        code: token,
        confidence: 'MEDIUM',
        source: 'DISCOUNT_TOKEN',
      });
    }
  }

  return Array.from(results.values());
}

/**
 * Generates an exhaustive combinator wordlist based on brand name and retail patterns
 */
export function generateBrandWordlist(options: CombinatorOptions): ScrapedCodeResult[] {
  const {
    brandName,
    includePercentages,
    includeSeasons,
    includeYears,
    includeWelcome,
    includeShipping,
    includeVip,
    separators,
  } = options;

  const brandClean = brandName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const brandShort = brandClean.slice(0, 6);
  const results = new Map<string, ScrapedCodeResult>();

  const add = (code: string, confidence: 'HIGH' | 'MEDIUM' | 'EXPERIMENTAL') => {
    const clean = options.caseMode === 'LOWER' ? code.toLowerCase() : code.toUpperCase();
    if (isValidCode(clean) && !results.has(clean)) {
      results.set(clean, {
        code: clean,
        confidence,
        source: 'BRAND_COMBINATION',
      });
    }
  };

  // Base general high-probability retail codes
  if (includeWelcome) {
    ['WELCOME10', 'WELCOME15', 'WELCOME20', 'WELCOME', 'FIRST10', 'FIRST15', 'NEW10'].forEach((c) =>
      add(c, 'HIGH')
    );
    if (brandClean) {
      add(`WELCOME${brandClean}`, 'HIGH');
      add(`${brandClean}WELCOME`, 'HIGH');
    }
  }

  if (includeShipping) {
    ['FREESHIP', 'SHIPFREE', 'FREE50', 'FREESHIPPING', 'SHIPFREE50'].forEach((c) =>
      add(c, 'HIGH')
    );
    if (brandClean) {
      add(`${brandClean}FREE`, 'MEDIUM');
      add(`${brandClean}SHIP`, 'MEDIUM');
    }
  }

  if (includeVip) {
    ['VIP10', 'VIP20', 'VIP50', 'VIP', 'MEMBER10', 'MEMBER15', 'INSIDER10'].forEach((c) =>
      add(c, 'HIGH')
    );
    if (brandClean) {
      add(`${brandClean}VIP`, 'MEDIUM');
      add(`VIP${brandClean}`, 'MEDIUM');
    }
  }

  // Brand + Tier Combinations
  if (brandClean && includePercentages) {
    DISCOUNT_TIERS.forEach((tier) => {
      separators.forEach((sep) => {
        add(`${brandClean}${sep}${tier}`, 'HIGH');
        add(`SAVE${sep}${tier}`, 'HIGH');
        add(`${tier}OFF`, 'HIGH');
        add(`${brandClean}${sep}${tier}OFF`, 'MEDIUM');
        add(`EXTRA${sep}${tier}`, 'MEDIUM');

        if (brandShort && brandShort !== brandClean) {
          add(`${brandShort}${sep}${tier}`, 'MEDIUM');
        }
      });
    });
  }

  // Brand + Season Combinations
  if (includeSeasons) {
    SEASONS.forEach((season) => {
      DISCOUNT_TIERS.slice(1, 5).forEach((tier) => {
        add(`${season}${tier}`, 'HIGH');
        if (brandClean) {
          add(`${brandClean}${season}`, 'MEDIUM');
          add(`${season}${brandClean}`, 'MEDIUM');
        }
      });
    });
  }

  // Brand + Year Combinations
  if (includeYears) {
    YEARS.forEach((yr) => {
      add(`FALL${yr}`, 'HIGH');
      add(`SPRING${yr}`, 'HIGH');
      add(`SUMMER${yr}`, 'HIGH');
      if (brandClean) {
        add(`${brandClean}${yr}`, 'MEDIUM');
      }
    });
  }

  return Array.from(results.values());
}

function isValidCode(code: string): boolean {
  if (!code) return false;
  if (code.length < 3 || code.length > 20) return false;
  if (/^\d+$/.test(code)) return false; // purely numbers like 1000 or 2026 is usually not a promo code
  return true;
}

function hasDigitsAndLetters(str: string): boolean {
  return /[A-Z]/.test(str) && /\d/.test(str);
}

export const SAMPLE_SCRAPER_TEXTS = [
  {
    title: 'Newsletter Email Dump',
    description: 'Promotional marketing email with active discount codes and banners',
    text: `Thanks for joining the Apex Gear community!
Here is your welcome gift: Take 20% off your entire first order with coupon code WELCOME20 at checkout.
Also, orders over $150 qualify for free express shipping with code FREESHIP.
Ambassador perk: Use partner promo REF-ALICE or PARTNER20 to receive an extra $10 store credit!
Other seasonal offers: Try FALL2026 for 10% off trail gear, or VIP50 on qualifying bulk orders.`,
  },
  {
    title: 'Deal Forum & Reddit Thread',
    description: 'Community shared retail coupon list with mixed comments and codes',
    text: `Thread: Tested working coupons for October 2026!
User1: SAVE20 just worked for 20% off backpack order!
User2: If SAVE20 expires, try SAVE15 or SAVE10.
User3: Entering code FREESHIP saves $15 on delivery charges.
User4: Creator voucher CREATOR10 gave me $15 credit in Field 2.
User5: Anyone know if DISCOUNT5 or SUMMER26 is still active? Try them before Friday!`,
  },
  {
    title: 'Web Page HTML Markup',
    description: 'Raw HTML source snippet containing coupon banners and checkout tags',
    text: `<div class="promotions-wrapper" data-campaign="fall_sale">
  <span class="banner-heading">Exclusive Online Savings!</span>
  <div class="promo-box">Use promo code <strong>SAVE20</strong> for 20% instant discount.</div>
  <input type="hidden" name="active_coupon_code" value="WELCOME20" />
  <div class="shipping-perk">Enter code <code>FREESHIP</code> for zero shipping cost.</div>
  <div class="referral-banner">Referral program: apply <b>REF-ALICE</b> or <b>PARTNER20</b>.</div>
</div>`,
  },
];
