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
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Sun, Menu, X } from 'lucide-react';

// ─── Apple-style Navbar ───────────────────────────────────────────────────────
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `text-[14px] font-normal px-3.5 py-1.5 rounded-lg text-decoration-none transition-colors duration-150 flex items-center gap-1.5 ${
      isActive(path)
        ? 'text-primary-500 bg-primary-500/10 dark:bg-primary-500/20'
        : 'text-gray-500 dark:text-on-dark-muted hover:bg-surface-variant dark:hover:bg-dark-hover'
    }`;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="apple-nav">
      <div className="max-w-6xl mx-auto px-4 md:px-6 w-full flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 no-underline z-50"
          onClick={closeMenu}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-[14px] tracking-tight">C</span>
          </div>
          <span className="font-semibold text-[17px] text-on-surface dark:text-on-dark tracking-tight">
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
              <Link to="/resume-ai" className={navLinkClass('/resume-ai')}>
                <Sparkles size={13} />
                Resume AI
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
                className="btn-apple text-[14px] px-[18px] py-2"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Theme Toggle (Desktop) */}
          <button
            onClick={toggleTheme}
            className="ml-2 p-2 rounded-full text-gray-500 dark:text-on-dark-muted hover:bg-surface-variant dark:hover:bg-dark-hover transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile Menu Controls */}
        <div className="flex items-center gap-2 md:hidden z-50">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-on-dark-muted hover:bg-surface-variant dark:hover:bg-dark-hover transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
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
              className="absolute top-[54px] left-0 right-0 bg-surface dark:bg-dark-surface border-b border-outline-variant dark:border-white/5 p-4 flex flex-col gap-2 shadow-lg md:hidden"
            >
              {user ? (
                <>
                  <Link to="/" onClick={closeMenu} className={navLinkClass('/')}>
                    Dashboard
                  </Link>
                  <Link to="/upload" onClick={closeMenu} className={navLinkClass('/upload')}>
                    Upload Resume
                  </Link>
                  <Link to="/resume-ai" onClick={closeMenu} className={navLinkClass('/resume-ai')}>
                    <Sparkles size={16} /> Resume AI
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
                    className="btn-apple text-[15px] py-3 w-full"
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
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full flex flex-col min-h-[calc(100vh-54px)]"
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
          <div className="min-h-screen bg-surface dark:bg-dark-surface transition-colors duration-200">
            <Navbar />
            <div className="page-top">
              <Routes>
                <Route path="/"           element={<PageWrapper><Dashboard /></PageWrapper>} />
                <Route path="/login"      element={<PageWrapper><Login /></PageWrapper>} />
                <Route path="/register"   element={<PageWrapper><Register /></PageWrapper>} />
                <Route path="/upload"     element={<PageWrapper><UploadResume /></PageWrapper>} />
                <Route path="/resume-ai"  element={<PageWrapper><ResumeAI /></PageWrapper>} />
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
