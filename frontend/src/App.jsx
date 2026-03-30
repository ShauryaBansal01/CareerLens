import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadResume from './pages/UploadResume';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Apple-style Navbar ───────────────────────────────────────────────────────
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="apple-nav">
      <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 no-underline"
          style={{ textDecoration: 'none' }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0071e3, #0059b5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em' }}>C</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: 17, color: '#1d1d1f', letterSpacing: '-0.02em' }}>
            CareerLens
          </span>
        </Link>

        {/* Nav links */}
        {user ? (
          <div className="flex items-center gap-1">
            <Link
              to="/"
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: isActive('/') ? '#0071e3' : '#6e6e73',
                padding: '6px 14px',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: isActive('/upload') ? '#0071e3' : '#6e6e73',
                padding: '6px 14px',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              Upload Resume
            </Link>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: isActive('/admin') ? '#0071e3' : '#6e6e73',
                  padding: '6px 14px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
              >
                Admin
              </Link>
            )}
            <div style={{ width: 1, height: 16, background: '#d2d2d7', margin: '0 8px' }} />
            <button
              onClick={logout}
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: '#6e6e73',
                background: 'none',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ff3b30'}
              onMouseLeave={e => e.currentTarget.style.color = '#6e6e73'}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: '#6e6e73',
                textDecoration: 'none',
                padding: '6px 14px',
              }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-apple"
              style={{ fontSize: 14, padding: '8px 18px', textDecoration: 'none' }}
            >
              Get Started
            </Link>
          </div>
        )}
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
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen" style={{ background: '#f5f5f7' }}>
          <Navbar />
          <div className="page-top">
            <Routes>
              <Route path="/"        element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="/login"   element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
              <Route path="/upload"  element={<PageWrapper><UploadResume /></PageWrapper>} />
              <Route path="/admin"   element={<PageWrapper><Admin /></PageWrapper>} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
