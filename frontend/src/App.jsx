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
      className="sticky top-0 z-50 glass-panel shadow-sm border-b border-indigo-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mr-3 shadow-md shadow-indigo-300">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight">
              CareerLens
            </Link>
          </motion.div>
          <div className="flex items-center space-x-1 sm:space-x-6 hidden md:flex">
            {user ? (
              <>
                <Link to="/" className={`flex items-center px-3 py-2 rounded-md text-sm font-semibold transition-all ${location.pathname === '/' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-500 hover:bg-slate-50'}`}>
                  <LayoutDashboard className="w-4 h-4 mr-1.5" /> Dashboard
                </Link>
                <Link to="/upload" className={`flex items-center px-3 py-2 rounded-md text-sm font-semibold transition-all ${location.pathname === '/upload' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-500 hover:bg-slate-50'}`}>
                  <UploadCloud className="w-4 h-4 mr-1.5" /> Upload Resume
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className={`flex items-center px-3 py-2 rounded-md text-sm font-semibold transition-all ${location.pathname === '/admin' ? 'text-purple-600 bg-purple-50' : 'text-slate-600 hover:text-purple-500 hover:bg-slate-50'}`}>
                    <Settings className="w-4 h-4 mr-1.5" /> Admin
                  </Link>
                )}
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <button 
                  onClick={logout} 
                  className="flex items-center text-sm font-semibold text-rose-500 hover:text-rose-600 px-3 py-2 hover:bg-rose-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1.5" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium px-4 py-2">Sign In</Link>
                <Link to="/register" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-full font-medium shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 transition-all">
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
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    <div className="absolute inset-0 bg-white/50 backdrop-blur-[100px]"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 relative selection:bg-indigo-100 selection:text-indigo-900 font-sans text-slate-900 flex flex-col">
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
