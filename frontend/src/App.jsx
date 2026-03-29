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
import { LogOut, UploadCloud, LayoutDashboard, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const navItemVariants = {
    hover: { scale: 1.05, textShadow: "0px 0px 8px rgb(255,255,255)" }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-surface/70 backdrop-blur-[24px] shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mr-3 shadow-ambient">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <Link to="/" className="text-2xl font-display font-bold text-on-surface tracking-tight">
              CareerLens
            </Link>
          </motion.div>
          <div className="flex items-center space-x-1 sm:space-x-4 hidden md:flex">
            {user ? (
              <>
                <Link to="/" className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-primary-600' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  Dashboard
                </Link>
                <Link to="/upload" className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${location.pathname === '/upload' ? 'text-primary-600' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  Upload Resume
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${location.pathname === '/admin' ? 'text-primary-600' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    Admin
                  </Link>
                )}
                <div className="h-6 w-px bg-surface-variant mx-2"></div>
                <button 
                  onClick={logout} 
                  className="flex items-center text-sm font-medium text-error hover:opacity-80 px-3 transition-opacity"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-on-surface-variant hover:text-on-surface font-medium px-4 py-2">Sign In</Link>
                <Link to="/register" className="btn-primary">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

// Animated Page wrapper
const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const BackgroundBlobs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1] bg-surface">
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-surface relative flex flex-col">
          <BackgroundBlobs />
          <Navbar />
          <div className="flex-1 w-full pt-8 pb-16">
            <Routes>
              <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
              <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
              <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
              <Route path="/upload" element={<PageWrapper><UploadResume /></PageWrapper>} />
              <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
