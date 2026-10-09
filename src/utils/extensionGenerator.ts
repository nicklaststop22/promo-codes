import JSZip from 'jszip';
import { SelectorConfig, AutomationSettings, QueueConfig } from '../types';

export function generateManifestJson(): string {
  return JSON.stringify(
    {
      manifest_version: 3,
      name: 'Promo & Coupon Codes Applier',
      version: '1.2.0',
      description: 'Automated multi-field coupon and promo code tester with price tracking and DOM inspector.',
      permissions: ['activeTab', 'scripting', 'storage', 'contextMenus'],
      action: {
        default_popup: 'popup.html',
        default_icon: {
          '16': 'icon16.png',
          '48': 'icon48.png',
          '128': 'icon128.png',
        },
      },
      icons: {
        '16': 'icon16.png',
        '48': 'icon48.png',
        '128': 'icon128.png',
      },
    },
    null,
    2
  );
}

export function generatePopupHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Promo Codes Applier</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="header">
    <div class="logo-title">
      <svg class="icon-tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      </svg>
      <h1>Promo Codes Applier</h1>
    </div>
  </div>

  <div class="tabs">
    <button class="tab-btn active" data-tab="setup">Target Selectors</button>
    <button class="tab-btn" data-tab="queue1">Field 1 (Coupon)</button>
    <button class="tab-btn" data-tab="queue2">Field 2 (Promo)</button>
    <button class="tab-btn" data-tab="logs">Logs & Hits</button>
  </div>

  <div id="tab-setup" class="tab-content active">
    <div class="selector-group">
      <label class="section-label">Field 1 Targets (Coupon)</label>
      <button class="picker-btn" id="pick-input-1">
        <span class="icon">⌶</span> Input Field 1: <span id="label-input-1" class="val">Not picked</span>
      </button>
      <button class="picker-btn" id="pick-apply-1">
        <span class="icon">👆</span> Apply Button 1: <span id="label-apply-1" class="val">Not picked</span>
      </button>
    </div>

    <div class="selector-group">
      <label class="section-label">Field 2 Targets (Promo / Voucher)</label>
      <button class="picker-btn" id="pick-input-2">
        <span class="icon">⌶</span> Input Field 2: <span id="label-input-2" class="val">Not picked</span>
      </button>
      <button class="picker-btn" id="pick-apply-2">
        <span class="icon">👆</span> Apply Button 2: <span id="label-apply-2" class="val">Not picked</span>
      </button>
    </div>

    <div class="selector-group">
      <label class="section-label">Validation Signals</label>
      <button class="picker-btn" id="pick-price">
        <span class="icon">$</span> Price Field: <span id="label-price" class="val">Not picked</span>
      </button>
      <button class="picker-btn" id="pick-remove">
        <span class="icon">✖</span> Remove Button: <span id="label-remove" class="val">Optional</span>
      </button>
    </div>

    <div class="form-row">
      <label>Interval (ms) <span class="help">Time between attempts</span></label>
      <input type="number" id="interval-input" value="2000" min="400" step="100">
    </div>

    <div class="form-row">
      <label>Timeout (ms) <span class="help">Wait after clicking apply</span></label>
      <input type="number" id="timeout-input" value="1000" min="200" step="100">
    </div>

    <div class="form-row">
      <label>Pre-Click Delay (ms) <span class="help">Pause between typing and clicking Apply</span></label>
      <input type="number" id="preclick-input" value="500" min="100" max="3000" step="50">
    </div>

    <div class="toggle-row">
      <span>Anti-Bot Jitter (±80ms)</span>
      <label class="switch">
        <input type="checkbox" id="toggle-human-jitter" checked>
        <span class="slider"></span>
      </label>
    </div>

    <div class="toggle-row">
      <span>Auto Backoff on 429</span>
      <label class="switch">
        <input type="checkbox" id="toggle-backoff" checked>
        <span class="slider"></span>
      </label>
    </div>

    <div class="form-row">
      <label>Code Length</label>
      <input type="number" id="code-length" value="6" min="3" max="20">
    </div>

    <div class="toggle-row">
      <span>Popular promo codes</span>
      <label class="switch">
        <input type="checkbox" id="toggle-popular-promo" checked>
        <span class="slider"></span>
      </label>
    </div>

    <div class="toggle-row">
      <span>Popular words</span>
      <label class="switch">
        <input type="checkbox" id="toggle-popular-words" checked>
        <span class="slider"></span>
      </label>
    </div>

    <div class="toggle-row">
      <span>Special chars</span>
      <label class="switch">
        <input type="checkbox" id="toggle-special-chars">
        <span class="slider"></span>
      </label>
    </div>
  </div>

  <div id="tab-queue1" class="tab-content">
    <label class="section-label">Field 1 Code List (One per line or paste)</label>
    <textarea id="queue1-text" rows="8" placeholder="SAVE10&#10;SAVE20&#10;WELCOME15&#10;FREESHIP"></textarea>
    <div class="meta-info">Total codes in Queue 1: <strong id="queue1-count">0</strong></div>
  </div>

  <div id="tab-queue2" class="tab-content">
    <label class="section-label">Field 2 Promo List (Secondary queue)</label>
    <textarea id="queue2-text" rows="8" placeholder="REF-ALICE&#10;PARTNER20&#10;VIPREWARD&#10;AMBASSADOR"></textarea>
    <div class="meta-info">Total codes in Queue 2: <strong id="queue2-count">0</strong></div>
  </div>

  <div id="tab-logs" class="tab-content">
    <div class="logs-header">
      <label class="section-label">Validation History</label>
      <button id="clear-logs-btn" class="mini-btn">Clear</button>
    </div>
    <div id="logs-container" class="logs-list">
      <div class="log-empty">No attempts logged yet.</div>
    </div>
  </div>

  <div class="footer-actions">
    <button id="btn-start" class="btn-primary">Start Automation</button>
    <button id="btn-stop" class="btn-secondary" style="display:none;">Stop Automation</button>
  </div>

  <script src="popup.js"></script>
</body>
</html>`;
}

export function generatePopupCss(): string {
  return `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  width: 320px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #ffffff;
  color: #1e293b;
  font-size: 13px;
  padding: 14px;
}
.header {
  margin-bottom: 12px;
}
.logo-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon-tag {
  width: 20px;
  height: 20px;
  stroke: #4f46e5;
}
h1 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}
.tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: 6px;
  padding: 2px;
  margin-bottom: 12px;
}
.tab-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 6px 4px;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  border-radius: 4px;
}
.tab-btn.active {
  background: #ffffff;
  color: #1e293b;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.tab-content { display: none; }
.tab-content.active { display: block; }
.selector-group {
  margin-bottom: 12px;
}
.section-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}
.picker-btn {
  width: 100%;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  color: #334155;
  margin-bottom: 6px;
  cursor: pointer;
  text-align: left;
}
.picker-btn:hover { background: #f8fafc; border-color: #94a3b8; }
.picker-btn .icon { margin-right: 8px; font-size: 14px; color: #6366f1; }
.picker-btn .val { margin-left: auto; font-size: 11px; color: #64748b; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.form-row {
  margin-bottom: 10px;
}
.form-row label {
  display: block;
  font-size: 12px;
  color: #475569;
  margin-bottom: 4px;
}
.form-row .help {
  display: block;
  font-size: 10px;
  color: #94a3b8;
}
.form-row input {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
}
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12px;
  color: #334155;
}
.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #cbd5e1;
  transition: .2s;
  border-radius: 20px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .2s;
  border-radius: 50%;
}
input:checked + .slider { background-color: #6366f1; }
input:checked + .slider:before { transform: translateX(16px); }

textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 8px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
}
.meta-info { font-size: 11px; color: #64748b; margin-top: 4px; }
.logs-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.mini-btn { background: none; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; font-size: 10px; cursor: pointer; }
.logs-list { max-height: 240px; overflow-y: auto; font-family: monospace; font-size: 11px; }
.log-item { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
.log-item.hit { background: #f0fdf4; color: #166534; font-weight: 600; }
.log-empty { text-align: center; color: #94a3b8; padding: 20px 0; font-size: 12px; }

.footer-actions { margin-top: 14px; }
.btn-primary {
  width: 100%;
  background: #5046e5;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.btn-primary:hover { background: #4338ca; }
.btn-secondary {
  width: 100%;
  background: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
`;
}

export function generatePopupJs(
  selectors: SelectorConfig,
  settings: AutomationSettings,
  queue1Codes: string[],
  queue2Codes: string[]
): string {
  return `// Promo & Coupon Codes Applier - Popup Controller
let currentTab = 'setup';
let isRunning = false;
let config = {
  selectors: ${JSON.stringify(selectors, null, 2)},
  interval: ${settings.intervalMs},
  timeout: ${settings.timeoutMs},
  codeLength: 6,
  popularPromo: true,
  popularWords: true,
  specialChars: false,
  queue1: ${JSON.stringify(queue1Codes.slice(0, 30))},
  queue2: ${JSON.stringify(queue2Codes.slice(0, 30))},
  logs: []
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  // Load saved config if exists
  const saved = await chrome.storage.local.get(['promoConfig']);
  if (saved.promoConfig) {
    config = { ...config, ...saved.promoConfig };
  }
  updateUI();
  setupTabs();
  setupPickers();
  setupInputs();
  setupButtons();
});

function updateUI() {
  document.getElementById('label-input-1').textContent = config.selectors.field1Input || 'Not picked';
  document.getElementById('label-apply-1').textContent = config.selectors.field1Apply || 'Not picked';
  document.getElementById('label-input-2').textContent = config.selectors.field2Input || 'Not picked';
  document.getElementById('label-apply-2').textContent = config.selectors.field2Apply || 'Not picked';
  document.getElementById('label-price').textContent = config.selectors.priceField || 'Not picked';
  document.getElementById('label-remove').textContent = config.selectors.removeButton || 'Optional';
  document.getElementById('interval-input').value = config.interval;
  document.getElementById('timeout-input').value = config.timeout;
  document.getElementById('queue1-text').value = config.queue1.join('\\n');
  document.getElementById('queue2-text').value = config.queue2.join('\\n');
  document.getElementById('queue1-count').textContent = config.queue1.length;
  document.getElementById('queue2-count').textContent = config.queue2.length;
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = 'tab-' + btn.getAttribute('data-tab');
      document.getElementById(targetId)?.classList.add('active');
    });
  });
}

function setupPickers() {
  const map = [
    { btn: 'pick-input-1', slot: 'field1Input', label: 'label-input-1' },
    { btn: 'pick-apply-1', slot: 'field1Apply', label: 'label-apply-1' },
    { btn: 'pick-input-2', slot: 'field2Input', label: 'label-input-2' },
    { btn: 'pick-apply-2', slot: 'field2Apply', label: 'label-apply-2' },
    { btn: 'pick-price', slot: 'priceField', label: 'label-price' },
    { btn: 'pick-remove', slot: 'removeButton', label: 'label-remove' }
  ];

  map.forEach(item => {
    document.getElementById(item.btn)?.addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;

      chrome.tabs.sendMessage(tab.id, { action: 'START_PICKER', slot: item.slot }, response => {
        if (response && response.selector) {
          config.selectors[item.slot] = response.selector;
          document.getElementById(item.label).textContent = response.selector;
          chrome.storage.local.set({ promoConfig: config });
        }
      });
    });
  });
}

function setupInputs() {
  document.getElementById('queue1-text').addEventListener('input', e => {
    config.queue1 = e.target.value.split('\\n').map(s => s.trim()).filter(Boolean);
    document.getElementById('queue1-count').textContent = config.queue1.length;
    chrome.storage.local.set({ promoConfig: config });
  });

  document.getElementById('queue2-text').addEventListener('input', e => {
    config.queue2 = e.target.value.split('\\n').map(s => s.trim()).filter(Boolean);
    document.getElementById('queue2-count').textContent = config.queue2.length;
    chrome.storage.local.set({ promoConfig: config });
  });

  document.getElementById('interval-input').addEventListener('change', e => {
    config.interval = parseInt(e.target.value) || 2000;
    chrome.storage.local.set({ promoConfig: config });
  });

  document.getElementById('timeout-input').addEventListener('change', e => {
    config.timeout = parseInt(e.target.value) || 1000;
    chrome.storage.local.set({ promoConfig: config });
  });
}

function setupButtons() {
  const startBtn = document.getElementById('btn-start');
  const stopBtn = document.getElementById('btn-stop');

  startBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    isRunning = true;
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';

    chrome.tabs.sendMessage(tab.id, {
      action: 'START_RUNNER',
      config: config
    });
  });

  stopBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    isRunning = false;
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';

    chrome.tabs.sendMessage(tab.id, { action: 'STOP_RUNNER' });
  });

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'CODE_RESULT') {
      addLogEntry(message.entry);
      if (message.stopForReview) {
        isRunning = false;
        startBtn.style.display = 'block';
        stopBtn.style.display = 'none';
      }
    }
  });
}

function addLogEntry(entry) {
  config.logs.unshift(entry);
  const container = document.getElementById('logs-container');
  if (container.querySelector('.log-empty')) {
    container.innerHTML = '';
  }
  const div = document.createElement('div');
  div.className = 'log-item ' + (entry.isHit ? 'hit' : '');
  div.innerHTML = '<span>' + entry.code + ' (' + entry.field + ')</span><span>' + (entry.isHit ? 'WIN: ' + entry.savings : 'Invalid') + '</span>';
  container.prepend(div);
}
`;
}

export function generateContentJs(): string {
  return `// Promo & Coupon Codes Applier - Content Script
(function() {
  let isPicking = false;
  let currentPickSlot = null;
  let runnerActive = false;
  let hoverEl = null;

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'START_PICKER') {
      isPicking = true;
      currentPickSlot = request.slot;
      document.body.style.cursor = 'crosshair';
      createPickerNotification(request.slot);
      
      const onPick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const selector = generateSelector(e.target);
        cleanupPicker();
        sendResponse({ selector: selector });
      };

      document.addEventListener('click', onPick, { once: true, capture: true });
      return true; // Keep message port open for async response
    }

    if (request.action === 'START_RUNNER') {
      runnerActive = true;
      runAutomation(request.config);
    }

    if (request.action === 'STOP_RUNNER') {
      runnerActive = false;
    }
  });

  function createPickerNotification(slot) {
    let bar = document.getElementById('promo-picker-banner');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'promo-picker-banner';
      bar.style.position = 'fixed';
      bar.style.top = '12px';
      bar.style.left = '50%';
      bar.style.transform = 'translateX(-50%)';
      bar.style.background = '#1e1b4b';
      bar.style.color = '#e0e7ff';
      bar.style.padding = '8px 18px';
      bar.style.borderRadius = '9999px';
      bar.style.fontSize = '13px';
      bar.style.fontWeight = '600';
      bar.style.zIndex = '999999';
      bar.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
      document.body.appendChild(bar);
    }
    bar.textContent = '🎯 Click any element on page to set: ' + slot;
  }

  function cleanupPicker() {
    isPicking = false;
    document.body.style.cursor = 'default';
    const bar = document.getElementById('promo-picker-banner');
    if (bar) bar.remove();
  }

  function generateSelector(el) {
    if (el.id) return '#' + el.id;
    if (el.getAttribute('name')) return el.tagName.toLowerCase() + '[name="' + el.getAttribute('name') + '"]';
    if (el.className && typeof el.className === 'string') {
      const cls = el.className.split(' ').filter(c => c && !c.includes(':'))[0];
      if (cls) return el.tagName.toLowerCase() + '.' + cls;
    }
    return el.tagName.toLowerCase();
  }

  // Parse numeric price from text
  function parsePrice(text) {
    if (!text) return null;
    const match = text.replace(/,/g, '').match(/\\d+(\\.\\d{2})?/);
    return match ? parseFloat(match[0]) : null;
  }

  // Automation runner loop
  async function runAutomation(config) {
    const queue1 = [...(config.queue1 || [])];
    const queue2 = [...(config.queue2 || [])];
    const { selectors, interval, timeout } = config;

    const priceEl = document.querySelector(selectors.priceField);
    let initialPrice = priceEl ? parsePrice(priceEl.textContent) : null;

    // Helper to simulate realistic typing and input event
    function setInputValue(input, val) {
      input.focus();
      input.value = val;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Process Queue 1 first
    for (let i = 0; i < queue1.length; i++) {
      if (!runnerActive) break;
      const code = queue1[i];
      const input = document.querySelector(selectors.field1Input);
      const applyBtn = document.querySelector(selectors.field1Apply);

      if (!input || !applyBtn) {
        console.warn('Field 1 elements not found');
        break;
      }

      const beforePrice = priceEl ? parsePrice(priceEl.textContent) : initialPrice;
      setInputValue(input, code);

      // Human-like hesitation delay between entering field & clicking button
      const preClick = (config.preClickDelay || 500) + (config.enableHumanJitter ? (Math.random() * 100 - 50) : 0);
      await sleep(Math.max(100, preClick));

      // Check for captcha before clicking
      if (document.querySelector('iframe[src*="captcha"], iframe[src*="turnstile"], .cf-turnstile, .g-recaptcha')) {
        runnerActive = false;
        alert('⚠️ Captcha / Security challenge detected. Solve the challenge and click Start to resume.');
        return;
      }

      applyBtn.click();
      await sleep(timeout);

      // Check for rate limit response
      if (document.body.innerText.includes('Too many requests') || document.body.innerText.includes('Rate limit')) {
        if (config.autoBackoff) {
          console.warn('Rate limit hit, backing off...');
          await sleep(8000); // 8 second cooldown
        }
      }

      const afterPrice = priceEl ? parsePrice(priceEl.textContent) : beforePrice;
      const isHit = beforePrice !== null && afterPrice !== null && afterPrice < beforePrice;

      chrome.runtime.sendMessage({
        action: 'CODE_RESULT',
        entry: {
          code: code,
          field: 'Field 1',
          beforePrice: beforePrice,
          afterPrice: afterPrice,
          savings: isHit ? (beforePrice - afterPrice).toFixed(2) : 0,
          isHit: isHit
        },
        stopForReview: isHit
      });

      if (isHit) {
        // Stop and wait for review as requested!
        runnerActive = false;
        alert('🎉 Discount hit found: ' + code + '! Automation paused for review.');
        return;
      }

      await sleep(interval);
    }
  }

  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
})();`;
}

// Generate a valid 16x16 PNG for Chrome Extension icon
function generateMinimalPngBase64(): string {
  // 1x1 transparent/indigo PNG pixel data url fallback
  return 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZElEQVQ4T2NkoBAwUqifYdQAIgb8//+fQcZkGBgYGBh+/f/PQEQeH2BsbIykgYGBgWH9+vVI7iAHA07T0fUgJ1FcA3A4B2vCYDSE7nCgKkGMDl70GkF2L15nkBwYpHsBAPWwTxf6/Xb3AAAAAElFTkSuQmCC';
}

export async function createChromeExtensionZip(
  selectors: SelectorConfig,
  settings: AutomationSettings,
  queue1Codes: string[],
  queue2Codes: string[]
): Promise<Blob> {
  const zip = new JSZip();

  zip.file('manifest.json', generateManifestJson());
  zip.file('popup.html', generatePopupHtml());
  zip.file('popup.css', generatePopupCss());
  zip.file('popup.js', generatePopupJs(selectors, settings, queue1Codes, queue2Codes));
  zip.file('content.js', generateContentJs());
  zip.file(
    'README.md',
    `# Promo & Coupon Codes Applier - Chrome Extension

## How to Install in Google Chrome / Brave / Edge:
1. Extract all files from this .zip archive into a folder (e.g. \`promo-applier-extension\`).
2. Open Google Chrome and go to \`chrome://extensions\`.
3. Toggle ON **Developer mode** in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the extracted folder.
6. The Promo Codes Applier icon will appear in your Chrome toolbar!
7. Navigate to any checkout page, open the extension, pick your fields, and click **Start Automation**!`
  );

  // Add dummy icon bytes
  const iconBase64 = generateMinimalPngBase64();
  zip.file('icon16.png', iconBase64, { base64: true });
  zip.file('icon48.png', iconBase64, { base64: true });
  zip.file('icon128.png', iconBase64, { base64: true });

  return await zip.generateAsync({ type: 'blob' });
}
