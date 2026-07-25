import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { useContext, useState, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';

// Lazy-load all authenticated pages — they're behind a login gate
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UploadResume = lazy(() => import('./pages/UploadResume'));
const ResumeAI = lazy(() => import('./pages/ResumeAI'));
const ResumeLatex = lazy(() => import('./pages/ResumeLatex'));
const CoverLetter = lazy(() => import('./pages/CoverLetter'));
const Profile = lazy(() => import('./pages/Profile'));
const APIKeySettings = lazy(() => import('./pages/APIKeySettings'));
const Admin = lazy(() => import('./pages/Admin'));
import { Menu, Sparkles, X } from 'lucide-react';
import { Button } from './components/ui/Button';
import { AppLayout } from './components/layout/AppLayout';

const Logo = ({ compact = false }) => (
  <Link to="/" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm">
    <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-primary-900 dark:bg-primary-800 text-white shadow-sm transition-transform group-hover:scale-105">
      <Sparkles className="h-4 w-4" aria-hidden="true" />
    </div>
    {!compact && <span className="text-[15px] font-display font-bold tracking-tight text-text-main dark:text-text-main">CareerLens</span>}
  </Link>
);

const guestLinks = [{ label: 'Features', href: '#features' }];

const GuestNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border-color bg-bg-main/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {guestLinks.map((item) => (
            <a key={item.label} href={item.href} className="text-sm font-semibold text-text-muted transition hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-sm">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="focus-visible:outline-none rounded-md">
            <Button variant="outline" size="sm">Log in</Button>
          </Link>
          <Link to="/register" className="focus-visible:outline-none rounded-md">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-md border border-border-color md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      <>
        {open && (
          <div className="border-t border-border-color bg-bg-main md:hidden overflow-hidden">
            <div className="flex flex-col gap-2 p-4">
              {guestLinks.map((item) => (
                <a key={item.label} href={item.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                  {item.label}
                </a>
              ))}
              <Link to="/login" className="focus-visible:outline-none"><Button variant="outline" className="mt-2 w-full">Log in</Button></Link>
              <Link to="/register" className="focus-visible:outline-none"><Button className="w-full mt-2">Get Started</Button></Link>
            </div>
          </div>
        )}
      </>
    </header>
  );
};

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg-main">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-500 border-t-transparent" />
  </div>
);

const AppRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  // Defence in depth: the API is the real gate, but rendering an admin screen
  // to a non-admin just to have every request 403 is a poor experience.
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <div className="animate-fade-in">
        {requireAuth ? (
          <AppLayout>
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </AppLayout>
        ) : (
          <>
            <GuestNav />
            {children}
          </>
        )}
      </div>
    </>
  );
};

const RootRoute = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <LoadingSpinner />;
  if (user) return <div className="animate-fade-in"><AppLayout><Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense></AppLayout></div>;
  return <div className="animate-fade-in"><GuestNav /><Landing /></div>;
};

function App() {
  return (
    <ThemeProvider>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-main)',
            border: '1px solid var(--color-border)',
          }
        }} 
      />
      <AuthProvider>
        <TaskProvider>

        <Router>
          <div className="min-h-screen bg-bg-main text-text-main font-sans antialiased">
            <Routes>
              {/* Root handles both Landing and Dashboard based on Auth */}
              <Route path="/" element={<RootRoute />} />
              
              {/* Public Routes */}
              <Route path="/login" element={<AppRoute requireAuth={false}><Login /></AppRoute>} />
              <Route path="/register" element={<AppRoute requireAuth={false}><Register /></AppRoute>} />
              <Route path="/forgot-password" element={<AppRoute requireAuth={false}><ForgotPassword /></AppRoute>} />
              
              {/* Authenticated Routes */}
              <Route path="/upload" element={<AppRoute><UploadResume /></AppRoute>} />
              <Route path="/profile" element={<AppRoute><Profile /></AppRoute>} />
              <Route path="/resume-ai" element={<AppRoute><ResumeAI /></AppRoute>} />
              <Route path="/cover-letter" element={<AppRoute><CoverLetter /></AppRoute>} />
              <Route path="/resume-latex" element={<AppRoute><ResumeLatex /></AppRoute>} />
              <Route path="/settings/keys" element={<AppRoute><APIKeySettings /></AppRoute>} />
              <Route path="/admin" element={<AppRoute requireAdmin><Admin /></AppRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>

        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
