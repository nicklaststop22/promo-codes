import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Terminal,
  ExternalLink,
  ShieldCheck,
  PackageCheck,
  HelpCircle
} from 'lucide-react';

interface ApkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkExportModal: React.FC<ApkExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const capacitorConfig = `{
  "appId": "com.promostudio.applier",
  "appName": "Promo Codes Applier",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Android APK & Mobile Deployment Guide
              </h3>
              <p className="text-[11px] text-slate-400">
                How to run and build this automation suite as an Android APK or mobile app.
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
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          {/* Environment Capability Clarification */}
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
              <PackageCheck className="w-4 h-4 text-indigo-400" />
              <span>Can an APK file be compiled directly here?</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Because AI Studio is a web cloud sandbox running Node.js (and does not include the 15GB+ Android SDK, Gradle compiler, and Java virtual machine), an APK binary file cannot be directly generated on the server without those native toolchains. However, we have pre-configured this app so you can convert it to an APK in minutes, or install it on Android right away via the two options below:
            </p>
          </div>

          {/* Option A: PWA Instant Install on Android */}
          <div className="bg-slate-950 border border-emerald-800/40 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-emerald-300 flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Method 1: Instant PWA Install on Android (No build tools needed)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-700/50 rounded">
                Recommended
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Open the shared web app URL on your Android device in Google Chrome, tap the menu (three dots <strong>⋮</strong>), and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>. It launches as a standalone, fullscreen native-like app on your Android home screen with zero downloading of APK files required!
            </p>
          </div>

          {/* Option B: Android Chromium Extension (Kiwi Browser) */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
            <div className="font-semibold text-indigo-300 flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Method 2: Run Extension on Android (Kiwi Browser)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Desktop Chrome on Android doesn't support extensions, but <strong>Kiwi Browser</strong> or <strong>Lemur Browser</strong> (free on Google Play Store) allows full Chrome Extensions! Simply download the <strong>.ZIP Extension</strong> from this app, open <code className="text-indigo-300 font-mono">chrome://extensions</code> in Kiwi Browser, and load it to test coupons on real mobile checkouts!
            </p>
          </div>

          {/* Option C: Compile APK with Capacitor in 3 Steps */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-3">
            <div className="font-semibold text-slate-200 flex items-center gap-2 text-xs">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>Method 3: Build a Standalone .APK File (Capacitor / Android Studio)</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              If you need an actual <code className="text-amber-300 font-mono">.apk</code> binary to distribute or upload to the Google Play Store, you can run these 3 standard Capacitor commands on any machine with Android Studio:
            </p>

            <div className="space-y-2 text-[11px] font-mono">
              {/* Step 1: Build the web assets */}
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-sans text-[10px] block">Step 1: Build web assets into dist/</span>
                  <code>npm run build</code>
                </div>
                <button
                  onClick={() => copyToClipboard('npm run build', 0)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copiedStep === 0 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Step 2: Install Capacitor */}
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-sans text-[10px] block">Step 2: Install Capacitor dependencies</span>
                  <code>npm install @capacitor/core @capacitor/cli @capacitor/android</code>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'npm install @capacitor/core @capacitor/cli @capacitor/android',
                      1
                    )
                  }
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copiedStep === 1 ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Step 3: Initialize with --web-dir dist */}
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-sans text-[10px] block">Step 3: Initialize (Type 'dist' when asked for Web asset directory)</span>
                  <code>npx cap init "Promo Codes Applier" "com.promostudio.applier" --web-dir dist</code>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'npx cap init "Promo Codes Applier" "com.promostudio.applier" --web-dir dist',
                      2
                    )
                  }
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copiedStep === 2 ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Step 4: Add Android platform & open Android Studio */}
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-sans text-[10px] block">Step 4: Add Android platform and open in Android Studio</span>
                  <code>npx cap add android && npx cap open android</code>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard('npx cap add android && npx cap open android', 3)
                  }
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copiedStep === 3 ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-amber-950/40 border border-amber-800/50 rounded text-[11px] text-amber-200">
              💡 <strong>Important for Vite projects:</strong> When Capacitor prompts <em>"What is the web asset directory for your app?"</em>, type <code className="bg-amber-900/60 px-1 py-0.5 rounded font-mono font-bold text-white">dist</code> (not <code className="line-through opacity-70">www</code>).
            </div>

            <p className="text-[10px] text-slate-500">
              Once built, this outputs your APK at <code className="font-mono text-slate-400">android/app/build/outputs/apk/debug/app-debug.apk</code>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
