import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'

const dsn = import.meta.env.VITE_SENTRY_DSN

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
  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true, error, errorInfo });
    if (dsn) {
      Sentry.captureException(error, { extra: { componentStack: errorInfo?.componentStack } });
    }
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: 'var(--bg-main)', color: 'var(--text-main)', height: '100vh', overflow: 'auto' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold' }}>Application Crashed</h1>
          <p style={{ marginTop: '10px', fontSize: '20px' }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-card)', color: '#38bdf8', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
