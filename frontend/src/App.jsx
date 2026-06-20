import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useContext, useState } from 'react';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadResume from './pages/UploadResume';
import Dashboard from './pages/Dashboard';
import ResumeAI from './pages/ResumeAI';
import ResumeLatex from './pages/ResumeLatex';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import CoverLetter from './pages/CoverLetter';
import APIKeySettings from './pages/APIKeySettings';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { Button } from './components/ui/Button';

const Logo = ({ compact = false }) => (
  <Link to="/" className="flex items-center gap-2.5">
    <div className="relative grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#5144d8] text-white shadow-[0_12px_24px_rgba(108,92,231,0.22)]">
      <Sparkles className="h-4 w-4" />
      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white" />
    </div>
    {!compact && <span className="text-sm font-bold tracking-tight text-slate-950 dark:text-white">CareerLens</span>}
  </Link>
);

const guestLinks = [{ label: 'Implemented Features', href: '#features' }];

const GuestNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1460px] items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {guestLinks.map((item) => (
            <a key={item.label} href={item.href} className="text-xs font-semibold text-slate-700 transition hover:text-[#6C5CE7]">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login">
            <Button variant="secondary" size="sm" className="rounded-lg px-4 text-xs">Log in</Button>
          </Link>
          <Link to="/register">
            <Button size="sm" className="rounded-lg bg-[#6C5CE7] px-4 text-xs hover:bg-[#594bd7]">Get Started</Button>
          </Link>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-slate-200 bg-white p-4 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {guestLinks.map((item) => (
                <a key={item.label} href={item.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700">
                  {item.label}
                </a>
              ))}
              <Link to="/login"><Button variant="secondary" className="mt-2 w-full">Log in</Button></Link>
              <Link to="/register"><Button className="w-full bg-[#6C5CE7]">Get Started</Button></Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const AppHeader = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user && ['/', '/login', '/register'].includes(location.pathname)) {
    return <GuestNav />;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/92">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-4 px-4 sm:px-6">
        <Logo />
        <div className="hidden flex-1 md:block" />
        <nav className="hidden items-center gap-1 lg:flex">
          <Link to="/" className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">Dashboard</Link>
          <Link to="/upload" className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">Upload</Link>
          <Link to="/resume-ai" className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">Analyzer</Link>
          <Link to="/resume-latex" className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">LaTeX</Link>
          <Link to="/cover-letter" className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">Cover Letter</Link>
          <Link to="/settings/keys" className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">AI Keys</Link>
        </nav>
        {user ? (
          <div className="group relative">
            <button className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 dark:border-slate-800 dark:bg-slate-950">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-900 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900">
                {(user.name || 'S').charAt(0).toUpperCase()}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <div className="invisible absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 dark:border-slate-800 dark:bg-slate-950">
              <Link to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"><User className="h-4 w-4" /> Profile</Link>
              <Link to="/settings/keys" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"><Settings className="h-4 w-4" /> Settings</Link>
              <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"><LogOut className="h-4 w-4" /> Log out</button>
            </div>
          </div>
        ) : (
          <Link to="/login"><Button size="sm">Log in</Button></Link>
        )}
      </div>
    </header>
  );
};

const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="min-h-[calc(100vh-64px)]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-[#FAFBFD] text-slate-950 antialiased dark:bg-slate-950 dark:text-white">
            <AppHeader />
            <Routes>
              <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
              <Route path="/upload" element={<PageWrapper><main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6"><UploadResume /></main></PageWrapper>} />
              <Route path="/profile" element={<PageWrapper><main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6"><Profile /></main></PageWrapper>} />
              <Route path="/resume-ai" element={<PageWrapper><main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6"><ResumeAI /></main></PageWrapper>} />
              <Route path="/cover-letter" element={<PageWrapper><main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6"><CoverLetter /></main></PageWrapper>} />
              <Route path="/resume-latex" element={<PageWrapper><main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6"><ResumeLatex /></main></PageWrapper>} />
              <Route path="/settings/keys" element={<PageWrapper><main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6"><APIKeySettings /></main></PageWrapper>} />
              <Route path="/admin" element={<PageWrapper><main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6"><Admin /></main></PageWrapper>} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
