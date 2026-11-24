import React, { useState, useEffect, useCallback } from 'react';
import {
  KeyRound,
  CheckCircle2,
  RefreshCw,
  XCircle,
  HelpCircle,
  WifiOff
} from 'lucide-react';

/**
 * Detailed Health Report interface returned by checkGeminiApiHealth
 */
export interface GeminiHealthReport {
  isConfigured: boolean;
  status: 'healthy' | 'missing_key' | 'offline' | 'error';
  model: string;
  message: string;
  timestamp: string;
  alertInfo?: {
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    description: string;
    badgeText: string;
    resolutionGuide: string;
  };
}

/**
 * Diagnostic health-check function to verify the presence and readiness of GEMINI_API_KEY.
 * Prevents unexpected runtime errors in production and provides actionable telemetry.
 *
 * @param timeoutMs Maximum duration to wait before timing out (default 5000ms)
 * @returns Promise<GeminiHealthReport>
 */
export async function checkGeminiApiHealth(timeoutMs: number = 5000): Promise<GeminiHealthReport> {
  const timestamp = new Date().toISOString();

  // Check if browser is offline first
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      isConfigured: false,
      status: 'offline',
      model: 'local-cached-socratic',
      message: 'Browser is currently offline. Offline Socratic guidance is active.',
      timestamp,
      alertInfo: {
        type: 'info',
        title: 'Offline Learning Active',
        description: 'You are working without an internet connection. The AI Tutor and offline modules continue operating using local curriculum files.',
        badgeText: 'Offline Mode',
        resolutionGuide: 'Reconnect to Wi-Fi or cellular network to restore live Gemini cloud generation.',
      },
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch('/api/health/gemini', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Health diagnostic responded with HTTP ${response.status} (${response.statusText || 'Error'})`);
    }

    const data = await response.json();
    const isConfigured = Boolean(data.isConfigured);
    const model = data.model || 'gemini-3.7-flash';

    if (isConfigured) {
      return {
        isConfigured: true,
        status: 'healthy',
        model,
        message: data.message || 'Gemini API Key is verified and operational.',
        timestamp: data.timestamp || timestamp,
        alertInfo: {
          type: 'success',
          title: 'Gemini AI Engine Active',
          description: `Live AI reasoning powered by ${model}. Socratic hints, search grounding, and multimodal tools are enabled.`,
          badgeText: 'Active & Verified',
          resolutionGuide: 'All cloud AI services are ready for production learners.',
        },
      };
    } else {
      return {
        isConfigured: false,
        status: 'missing_key',
        model,
        message: 'GEMINI_API_KEY is not configured on the backend service.',
        timestamp: data.timestamp || timestamp,
        alertInfo: {
          type: 'warning',
          title: 'AI Studio Key Configuration Notice',
          description: 'The Gemini API key is currently missing in the environment. The application has automatically activated the built-in Socratic offline tutor so learners experience zero disruption.',
          badgeText: 'Demo Fallback Active',
          resolutionGuide: 'To enable live generative responses, open the Settings / Secrets menu in AI Studio and configure GEMINI_API_KEY.',
        },
      };
    }
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    const isAbort = error instanceof Error && error.name === 'AbortError';

    console.warn('[Gemini Health Check Diagnostic Warning]:', errMessage);

    return {
      isConfigured: false,
      status: 'error',
      model: 'socratic-fallback-engine',
      message: isAbort ? 'Diagnostic check timed out.' : errMessage,
      timestamp,
      alertInfo: {
        type: 'warning',
        title: 'AI Connection Diagnostic Warning',
        description: isAbort
          ? 'Health check timed out. Socratic fallback response system is active.'
          : 'Unable to reach the AI backend endpoint. Offline Socratic guidance will handle student queries.',
        badgeText: 'Fallback Active',
        resolutionGuide: 'Check backend server status or network connection.',
      },
    };
  }
}

/**
 * Custom React Hook to monitor and diagnose GEMINI_API_KEY status with automatic polling and refresh
 */
export function useGeminiApiHealth(autoCheck: boolean = true) {
  const [health, setHealth] = useState<GeminiHealthReport | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const performCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const report = await checkGeminiApiHealth();
      setHealth(report);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (autoCheck) {
      performCheck();
    }
  }, [autoCheck, performCheck]);

  return {
    health,
    isChecking,
    recheckHealth: performCheck,
    isConfigured: health?.isConfigured ?? false,
    status: health?.status ?? 'healthy',
  };
}

/**
 * Props for GeminiHealthAlert UI component
 */
export interface GeminiHealthAlertProps {
  healthReport?: GeminiHealthReport | null;
  onDismiss?: () => void;
  onRefresh?: () => void;
  isChecking?: boolean;
  className?: string;
  showWhenHealthy?: boolean;
}

/**
 * User-Friendly UI Alert Component to notify users and developers if GEMINI_API_KEY configuration is missing.
 * Implemented with React.createElement to maintain pure TypeScript compatibility in .ts files.
 */
export const GeminiHealthAlert: React.FC<GeminiHealthAlertProps> = ({
  healthReport,
  onDismiss,
  onRefresh,
  isChecking = false,
  className = '',
  showWhenHealthy = false,
}) => {
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  if (dismissed || !healthReport) {
    return null;
  }

  // If healthy and showWhenHealthy is false, hide the banner
  if (healthReport.isConfigured && !showWhenHealthy) {
    return null;
  }

  const alert = healthReport.alertInfo || {
    type: healthReport.isConfigured ? 'success' : 'warning',
    title: healthReport.isConfigured ? 'Gemini AI Ready' : 'Gemini Key Missing',
    description: healthReport.message,
    badgeText: healthReport.status,
    resolutionGuide: 'Configure GEMINI_API_KEY in the environment secrets.',
  };

  const isWarningOrError = alert.type === 'warning' || alert.type === 'error';

  const containerClasses = `rounded-2xl p-4 transition-all duration-300 shadow-xs border text-xs ${
    isWarningOrError
      ? 'bg-amber-50/95 border-amber-300 text-amber-950'
      : alert.type === 'info'
      ? 'bg-blue-50/95 border-blue-300 text-blue-950'
      : 'bg-emerald-50/95 border-emerald-300 text-emerald-950'
  } ${className}`;

  const iconBgClass = `p-2 rounded-xl shrink-0 mt-0.5 ${
    isWarningOrError
      ? 'bg-amber-200/80 text-amber-900'
      : alert.type === 'info'
      ? 'bg-blue-200/80 text-blue-900'
      : 'bg-emerald-200/80 text-emerald-900'
  }`;

  const badgeClass = `text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
    isWarningOrError
      ? 'bg-amber-200 text-amber-900'
      : alert.type === 'info'
      ? 'bg-blue-200 text-blue-900'
      : 'bg-emerald-200 text-emerald-900'
  }`;

  return React.createElement(
    'div',
    {
      id: 'gemini-api-health-alert-banner',
      role: 'alert',
      className: containerClasses,
    },
    React.createElement(
      'div',
      { className: 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3' },
      
      // Left side: icon & textual details
      React.createElement(
        'div',
        { className: 'flex items-start gap-3' },
        React.createElement(
          'div',
          { className: iconBgClass },
          isWarningOrError
            ? React.createElement(KeyRound, { className: 'w-4 h-4' })
            : alert.type === 'info'
            ? React.createElement(WifiOff, { className: 'w-4 h-4' })
            : React.createElement(CheckCircle2, { className: 'w-4 h-4' })
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { className: 'flex flex-wrap items-center gap-2' },
            React.createElement('h4', { className: 'font-bold text-sm tracking-tight' }, alert.title),
            React.createElement('span', { className: badgeClass }, alert.badgeText),
            healthReport.model
              ? React.createElement('span', { className: 'text-[10px] text-slate-500 font-mono' }, healthReport.model)
              : null
          ),
          React.createElement('p', { className: 'mt-1 text-slate-700 leading-relaxed max-w-2xl' }, alert.description),
          
          // Details toggle
          React.createElement(
            'div',
            { className: 'mt-2 flex items-center gap-3' },
            React.createElement(
              'button',
              {
                type: 'button',
                id: 'btn-gemini-diagnostic-toggle',
                onClick: () => setShowDetails((prev) => !prev),
                className: 'text-[11px] font-semibold text-amber-900 hover:text-amber-950 underline inline-flex items-center gap-1 cursor-pointer',
              },
              React.createElement(HelpCircle, { className: 'w-3 h-3' }),
              showDetails ? 'Hide Setup Guidance' : 'How to configure GEMINI_API_KEY'
            )
          ),

          showDetails
            ? React.createElement(
                'div',
                { className: 'mt-2.5 p-3 bg-white/80 border border-amber-200 rounded-xl space-y-1.5 text-slate-700' },
                React.createElement('p', { className: 'font-semibold text-slate-900 text-[11px]' }, '💡 Production & Development Setup Steps:'),
                React.createElement(
                  'ul',
                  { className: 'list-disc list-inside space-y-1 text-[11px] text-slate-600' },
                  React.createElement('li', null, alert.resolutionGuide),
                  React.createElement(
                    'li',
                    null,
                    'In AI Studio Build, the key is securely injected server-side via ',
                    React.createElement('code', { className: 'bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]' }, 'process.env.GEMINI_API_KEY'),
                    '.'
                  ),
                  React.createElement('li', null, 'Students and teachers can continue using all offline Socratic questions without disruption.')
                )
              )
            : null
        )
      ),

      // Right side: action buttons
      React.createElement(
        'div',
        { className: 'flex items-center gap-2 shrink-0 self-end sm:self-center' },
        onRefresh
          ? React.createElement(
              'button',
              {
                type: 'button',
                id: 'btn-gemini-health-recheck',
                onClick: onRefresh,
                disabled: isChecking,
                className: 'px-3 py-1.5 bg-amber-700 hover:bg-amber-800 active:scale-95 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50',
                title: 'Recheck Gemini API configuration',
              },
              React.createElement(RefreshCw, { className: `w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}` }),
              React.createElement('span', null, isChecking ? 'Checking...' : 'Check Status')
            )
          : null,
        React.createElement(
          'button',
          {
            type: 'button',
            id: 'btn-gemini-health-dismiss',
            onClick: () => {
              setDismissed(true);
              if (onDismiss) onDismiss();
            },
            className: 'p-1.5 text-amber-800 hover:text-amber-950 hover:bg-amber-200/60 rounded-xl transition-colors cursor-pointer',
            title: 'Dismiss notification',
          },
          React.createElement(XCircle, { className: 'w-4 h-4' })
        )
      )
    )
  );
};
