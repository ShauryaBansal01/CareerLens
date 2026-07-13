import { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, Home, LayoutDashboard } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const NotFound = () => {
  useEffect(() => {
    document.title = '404 — Page Not Found | CareerLens';
  }, []);
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-bg-main">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-[420px]"
      >
        <div className="w-16 h-16 rounded-2xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-8 h-8 text-accent-700 dark:text-accent-400" />
        </div>
        <h1 className="text-5xl font-black text-text-main mb-3">404</h1>
        <p className="text-lg text-text-muted mb-8">
          This page doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-accent-700 hover:bg-accent-800 text-white rounded-lg font-bold px-6 py-3 text-sm transition-colors shadow-sm"
        >
          {user ? <LayoutDashboard size={16} /> : <Home size={16} />}
          {user ? 'Go to Dashboard' : 'Back to Home'}
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
