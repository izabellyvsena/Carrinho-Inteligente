import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App.tsx';
import './index.css';

// Sentry Real-time Error Surveillance configuration
Sentry.init({
  dsn: (import.meta as any).env?.VITE_SENTRY_DSN || "https://bfebd337ecbb2777b707470659691b01@o4507025875206144.ingest.us.sentry.io/4507025876385792",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring sample rates
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// PWA Service Worker dynamic registration
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('PechinchaBot PWA Service Worker registrado!', reg.scope))
      .catch((err) => console.error('PWA Service Worker falhou:', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={({ error, resetError }) => (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl text-center">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20 text-xl font-bold">
            !
          </div>
          <h2 className="text-base font-bold tracking-tight mb-2">PechinchaBot encontrou um problema</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Uma falha inesperada ocorreu na aplicação. O assistente de telemetria do Sentry em tempo real já registrou este erro automaticamente.
          </p>
          <pre className="p-4 bg-slate-950/80 rounded-2xl text-rose-450 text-xs font-mono text-left mb-6 max-h-32 overflow-auto whitespace-pre-wrap select-all border border-rose-950/20">
            {error instanceof Error ? error.message : String(error)}
          </pre>
          <button
            type="button"
            onClick={resetError}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer text-white"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);

