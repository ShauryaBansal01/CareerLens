import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { useContext, useState } from 'react';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadResume from './pages/UploadResume';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import ResumeAI from './pages/ResumeAI';
import ResumeLatex from './pages/ResumeLatex';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import CoverLetter from './pages/CoverLetter';
import APIKeySettings from './pages/APIKeySettings';
import { motion, AnimatePresence } from 'framer-motion';
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
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border-color bg-bg-main md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-2 p-4">
              {guestLinks.map((item) => (
                <a key={item.label} href={item.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500">
                  {item.label}
                </a>
              ))}
              <Link to="/login" className="focus-visible:outline-none"><Button variant="outline" className="mt-2 w-full">Log in</Button></Link>
              <Link to="/register" className="focus-visible:outline-none"><Button className="w-full mt-2">Get Started</Button></Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const AppRoute = ({ children, requireAuth = true }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-bg-main"><div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-500 border-t-transparent" /></div>;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {requireAuth ? (
          <AppLayout>{children}</AppLayout>
        ) : (
          <>
            <GuestNav />
            {children}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const RootRoute = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-bg-main"><div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-500 border-t-transparent" /></div>;
  if (user) return <AppLayout><Dashboard /></AppLayout>;
  return <><GuestNav /><Landing /></>;
};

function App() {
  return (
    <ThemeProvider>
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
              
              {/* Authenticated Routes */}
              <Route path="/upload" element={<AppRoute><UploadResume /></AppRoute>} />
              <Route path="/profile" element={<AppRoute><Profile /></AppRoute>} />
              <Route path="/resume-ai" element={<AppRoute><ResumeAI /></AppRoute>} />
              <Route path="/cover-letter" element={<AppRoute><CoverLetter /></AppRoute>} />
              <Route path="/resume-latex" element={<AppRoute><ResumeLatex /></AppRoute>} />
              <Route path="/settings/keys" element={<AppRoute><APIKeySettings /></AppRoute>} />
              <Route path="/admin" element={<AppRoute><Admin /></AppRoute>} />
            </Routes>
          </div>
        </Router>
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
