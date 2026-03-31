import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-[calc(100vh-54px)] flex items-center justify-center p-4 sm:p-10 bg-gray-50 dark:bg-dark-surface">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-[440px] bg-white dark:bg-dark-card rounded-2xl p-8 sm:p-11 shadow-sm"
      >
        {/* Logo mark */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-base tracking-tight">C</span>
          </div>
          <span className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight">
            CareerLens
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-[32px] font-bold text-gray-900 dark:text-white tracking-tight mb-1.5">
          Welcome back.
        </h1>
        <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-8">
          Sign in to your CareerLens account.
        </p>

        {/* Error */}
        {error && (
          <motion.div
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
            <label className="apple-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              className="apple-input w-full"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1.5">
              <label className="apple-label !mb-0" htmlFor="login-password">Password</label>
              <a
                href="#"
                className="text-[13px] text-blue-600 dark:text-blue-400 no-underline font-normal hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="login-password"
              type="password"
              className="apple-input w-full"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-apple-rect w-full mt-6"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2.5">
                <span className="apple-spinner" />
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>

          {/* Link */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-600 dark:text-blue-400 no-underline font-medium hover:underline"
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
