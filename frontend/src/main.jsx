import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'

const dsn = import.meta.env.VITE_SENTRY_DSN
const isDev = import.meta.env.DEV

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  })
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // getDerivedStateFromError flips the UI during the same render pass;
  // componentDidCatch is only for the side effect of reporting.
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (dsn) {
      Sentry.captureException(error, { extra: { componentStack: errorInfo?.componentStack } });
    }
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        className="min-h-screen bg-bg-main text-text-main flex items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
          <p className="text-text-muted mb-8 leading-relaxed">
            The page hit an unexpected error. Reloading usually fixes it — your saved work isn&apos;t affected.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            >
              Reload page
            </button>
            <a
              href="/"
              className="rounded-md border border-border-color px-5 py-2.5 text-sm font-semibold text-text-main transition hover:bg-bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            >
              Go to dashboard
            </a>
          </div>

          {/* Stack traces are a developer tool — in production they only leak
              internals and alarm the user. Sentry still receives the full one. */}
          {isDev && this.state.error && (
            <details className="mt-10 text-left">
              <summary className="cursor-pointer text-sm font-semibold text-text-muted hover:text-text-main">
                Error details (development only)
              </summary>
              <pre className="mt-3 max-h-80 overflow-auto rounded-lg border border-border-color bg-bg-card p-4 text-xs leading-relaxed text-text-muted">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
