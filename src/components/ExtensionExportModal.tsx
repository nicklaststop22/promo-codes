import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Package,
  FileCode,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import {
  generateManifestJson,
  generatePopupHtml,
  generatePopupCss,
  generatePopupJs,
  generateContentJs,
  createChromeExtensionZip
} from '../utils/extensionGenerator';
import { SelectorConfig, AutomationSettings, QueueConfig } from '../types';

interface ExtensionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectors: SelectorConfig;
  settings: AutomationSettings;
  queue1: QueueConfig;
  queue2: QueueConfig;
}

export const ExtensionExportModal: React.FC<ExtensionExportModalProps> = ({
  isOpen,
  onClose,
  selectors,
  settings,
  queue1,
  queue2,
}) => {
  const [activeFile, setActiveFile] = useState<
    'manifest.json' | 'popup.html' | 'popup.css' | 'popup.js' | 'content.js' | 'README.md'
  >('manifest.json');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const getFileContent = () => {
    switch (activeFile) {
      case 'manifest.json':
        return generateManifestJson();
      case 'popup.html':
        return generatePopupHtml();
      case 'popup.css':
        return generatePopupCss();
      case 'popup.js':
        return generatePopupJs(selectors, settings, queue1.codes, queue2.codes);
      case 'content.js':
        return generateContentJs();
      case 'README.md':
        return `# Promo & Coupon Codes Applier - Chrome Extension

## Quick Installation Guide:
1. Extract the downloaded ZIP file into a local folder.
2. In Google Chrome, go to chrome://extensions in the URL bar.
3. Turn on "Developer mode" in the top-right corner.
4. Click "Load unpacked" in the top left and select your extracted folder.
5. The extension is now active on all ecommerce checkout sites!`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFileContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const zipBlob = await createChromeExtensionZip(
        selectors,
        settings,
        queue1.codes,
        queue2.codes
      );
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promo-codes-applier-extension-v3.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Chrome Extension Package Generator (Manifest v3)
              </h3>
              <p className="text-[11px] text-slate-400">
                Pre-configured with your active dual selectors, wordlists, and DOM watcher logic.
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

        {/* Instructions banner */}
        <div className="bg-indigo-950/40 border-b border-indigo-900/50 px-4 py-2.5 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Extract the zip archive and load via <strong>chrome://extensions</strong> with <strong>Developer Mode</strong> enabled.
            </span>
          </div>
          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Packaging...' : 'Download .ZIP'}
          </button>
        </div>

        {/* Code tabs & Viewer */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50 text-xs">
            <div className="flex gap-1 overflow-x-auto">
              {(
                [
                  'manifest.json',
                  'popup.html',
                  'popup.css',
                  'popup.js',
                  'content.js',
                  'README.md',
                ] as const
              ).map((fileName) => (
                <button
                  key={fileName}
                  onClick={() => setActiveFile(fileName)}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    activeFile === fileName
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {fileName}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Code'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-slate-950 text-slate-300">
            <pre className="whitespace-pre-wrap leading-relaxed select-all">
              {getFileContent()}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Manifest V3 compatible with Chrome 102+, Microsoft Edge, Brave, and Opera.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
