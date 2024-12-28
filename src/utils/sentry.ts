import * as Sentry from "@sentry/react";

export const initSentry = () => {
  Sentry.init({
    dsn: "https://fb91a387d5c8df8b5fc05753bc3fffc0@o372762.ingest.us.sentry.io/4508546038628352",
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/api\.mylocalmasjid\.com/,
      /^https:\/\/mylocalmasjid\.com/,
    ],
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions will be recorded
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors will be recorded
    
    // Environment
    environment: import.meta.env.MODE,
    
    // Enable debug in development
    debug: import.meta.env.DEV,
  });
}; 