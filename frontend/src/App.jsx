import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
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
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Sun, Menu, X, FileText, Palette } from 'lucide-react';

// ─── Apple-style Navbar ───────────────────────────────────────────────────────
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, setTheme, toggleTheme, themes } = useContext(ThemeContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const activeTheme = themes.find(item => item.id === theme) || themes[0];
  const isDarkTheme = activeTheme.mode === 'dark';

  const navLinkClass = (path) =>
    `text-[14px] font-medium px-3.5 py-1.5 rounded-lg text-decoration-none transition-colors duration-150 flex items-center gap-1.5 ${
      isActive(path)
        ? 'text-on-surface dark:text-on-dark bg-surface-variant/70 dark:bg-dark-hover'
        : 'text-gray-500 dark:text-on-dark-muted hover:bg-surface-variant dark:hover:bg-dark-hover'
    }`;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="glass-nav">
      <div className="max-w-6xl mx-auto px-4 md:px-6 w-full flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 no-underline z-50"
          onClick={closeMenu}
        >
          <div className="w-8 h-8 rounded-lg border border-outline-variant bg-surface-low flex items-center justify-center shrink-0">
            <span className="text-on-surface font-bold text-[15px] tracking-tight">C</span>
          </div>
          <span className="font-bold text-[18px] text-on-surface dark:text-on-dark tracking-tight">
            CareerLens
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {user && (
            <>
              <Link to="/" className={navLinkClass('/')}>
                Dashboard
              </Link>
              <Link to="/upload" className={navLinkClass('/upload')}>
                Upload Resume
              </Link>
              <Link to="/profile" className={navLinkClass('/profile')}>
                Profile
              </Link>
              <Link to="/resume-ai" className={navLinkClass('/resume-ai')}>
                <Sparkles size={13} />
                Resume AI
              </Link>
              <Link to="/cover-letter" className={navLinkClass('/cover-letter')}>
                <FileText size={13} />
                Cover Letter
              </Link>
              <Link to="/resume-latex" className={navLinkClass('/resume-latex')}>
                LaTeX Builder
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className={navLinkClass('/admin')}>
                  Admin
                </Link>
              )}
              <div className="w-px h-4 bg-outline-variant dark:bg-dark-border mx-2" />
              <button
                onClick={logout}
                className="text-[14px] font-normal text-gray-500 dark:text-on-dark-muted hover:text-error dark:hover:text-error px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors duration-150"
              >
                Logout
              </button>
            </>
          )}

          {!user && (
            <div className="flex items-center gap-3 ml-4">
              <Link
                to="/login"
                className="text-[14px] font-normal text-gray-500 dark:text-on-dark-muted hover:text-on-surface dark:hover:text-on-dark transition-colors px-3.5 py-1.5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-premium text-[14px] px-[20px] py-2"
              >
                Get Started
              </Link>
            </div>
          )}

          <div className="ml-2 flex items-center gap-1.5 rounded-lg border border-outline-variant dark:border-dark-border bg-surface-low dark:bg-dark-card px-2 py-1">
            <Palette size={15} className="text-primary-500" />
            <select
              value={theme}
              onChange={event => setTheme(event.target.value)}
              className="bg-transparent text-[13px] font-medium text-on-surface dark:text-on-dark outline-none cursor-pointer"
              aria-label="Select theme"
            >
              {themes.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-on-dark-muted hover:bg-surface-variant dark:hover:bg-dark-hover transition-colors"
            aria-label="Cycle theme"
            title="Cycle theme"
          >
            {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile Menu Controls */}
        <div className="flex items-center gap-2 md:hidden z-50">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-on-dark-muted hover:bg-surface-variant dark:hover:bg-dark-hover transition-colors"
            aria-label="Cycle theme"
          >
            {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-on-surface dark:text-on-dark"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-[64px] left-0 right-0 bg-white/90 dark:bg-[#0a0a0c]/95 backdrop-blur-glass border-b border-black/5 dark:border-white/5 p-4 flex flex-col gap-2 shadow-ambient-hover md:hidden"
            >
              {user ? (
                <>
                  <Link to="/" onClick={closeMenu} className={navLinkClass('/')}>
                    Dashboard
                  </Link>
                  <Link to="/upload" onClick={closeMenu} className={navLinkClass('/upload')}>
                    Upload Resume
                  </Link>
                  <Link to="/profile" onClick={closeMenu} className={navLinkClass('/profile')}>
                    Profile
                  </Link>
                  <Link to="/resume-ai" onClick={closeMenu} className={navLinkClass('/resume-ai')}>
                    <Sparkles size={16} /> Resume AI
                  </Link>
                  <Link to="/cover-letter" onClick={closeMenu} className={navLinkClass('/cover-letter')}>
                    <FileText size={16} /> Cover Letter
                  </Link>
                  <Link to="/resume-latex" onClick={closeMenu} className={navLinkClass('/resume-latex')}>
                    LaTeX Builder
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={closeMenu} className={navLinkClass('/admin')}>
                      Admin
                    </Link>
                  )}
                  <div className="h-px w-full bg-outline-variant dark:bg-dark-border my-2" />
                  <label className="px-3.5 py-2 text-[13px] font-semibold text-on-surface-variant dark:text-on-dark-muted flex items-center justify-between gap-3">
                    Theme
                    <select
                      value={theme}
                      onChange={event => setTheme(event.target.value)}
                      className="premium-input py-1.5 px-2 text-[13px] max-w-[150px]"
                    >
                      {themes.map(item => (
                        <option key={item.id} value={item.id}>{item.label}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={() => { logout(); closeMenu(); }}
                    className="text-left text-[14px] font-normal text-error px-3.5 py-2 hover:bg-surface-variant dark:hover:bg-dark-hover rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="text-center text-[15px] font-medium text-on-surface dark:text-on-dark py-3 rounded-lg hover:bg-surface-variant dark:hover:bg-dark-hover"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="btn-premium text-[15px] py-3 w-full"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

// ─── Page transition wrapper ──────────────────────────────────────────────────
const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full flex flex-col min-h-[calc(100vh-64px)]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-transparent transition-colors duration-300">
            <Navbar />
            <div className="page-top">
              <Routes>
                <Route path="/"           element={<PageWrapper><Dashboard /></PageWrapper>} />
                <Route path="/login"      element={<PageWrapper><Login /></PageWrapper>} />
                <Route path="/register"   element={<PageWrapper><Register /></PageWrapper>} />
                <Route path="/upload"     element={<PageWrapper><UploadResume /></PageWrapper>} />
                <Route path="/profile"    element={<PageWrapper><Profile /></PageWrapper>} />
                <Route path="/resume-ai"  element={<PageWrapper><ResumeAI /></PageWrapper>} />
                <Route path="/cover-letter" element={<PageWrapper><CoverLetter /></PageWrapper>} />
                <Route path="/resume-latex" element={<PageWrapper><ResumeLatex /></PageWrapper>} />
                <Route path="/admin"      element={<PageWrapper><Admin /></PageWrapper>} />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
