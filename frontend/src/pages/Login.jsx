import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  useEffect(() => { document.title = 'Sign In | CareerLens'; }, []);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Incorrect email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-54px)] flex items-center justify-center p-4 sm:p-10 bg-bg-main">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-[440px] bg-bg-card rounded-2xl p-8 sm:p-11 shadow-sm border border-border-color"
      >
        {/* Logo mark */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary-900 dark:bg-primary-800 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-bold text-base tracking-tight">C</span>
          </div>
          <span className="text-[17px] font-bold text-text-main dark:text-text-main tracking-tight">
            CareerLens
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-[32px] font-bold text-text-main tracking-tight mb-1.5">
          Welcome back.
        </h1>
        <p className="text-[15px] text-text-muted mb-8">
          Sign in to your CareerLens account.
        </p>

        {/* Error */}
        {error && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-5 font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-main mb-1.5" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              className="w-full rounded-xl border border-border-color bg-bg-card px-4 py-3 text-[15px] text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
              placeholder="you@example.com"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-text-main" htmlFor="login-password">Password</label>
              <Link
                to="/forgot-password"
                className="text-[13px] text-accent-700 dark:text-accent-400 no-underline font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="w-full rounded-xl border border-border-color bg-bg-card px-4 py-3 pr-10 text-[15px] text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main bg-transparent border-none cursor-pointer p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 py-3 rounded-lg text-[15px] font-bold text-white bg-accent-700 hover:bg-accent-800 transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2.5">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>

          {/* Link */}
          <p className="text-center text-sm text-text-muted mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-accent-700 dark:text-accent-400 no-underline font-bold hover:underline"
            >
              Create one
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
