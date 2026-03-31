import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
  const [step, setStep]         = useState(1);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp]           = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { register, sendOtp } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      await sendOtp(email);
      setMessage('OTP has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. This email may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(name, email, password, 'user', otp);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP or registration failed.');
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-500 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-base tracking-tight">C</span>
          </div>
          <span className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight">
            CareerLens
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-[32px] font-bold text-gray-900 dark:text-white tracking-tight mb-1.5">
          {step === 1 ? 'Create your account.' : 'Verify your email.'}
        </h1>
        <p className="text-[15px] text-gray-500 dark:text-on-dark-muted mb-8">
          {step === 1 
            ? 'Start your AI-powered career journey today.' 
            : `We sent a 6-digit code to ${email}.`}
        </p>

        {/* Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-5 font-medium"
            >
              {error}
            </motion.div>
          )}
          {message && !error && (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm mb-5 font-medium"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp}
            >
              <div className="mb-4">
                <label className="apple-label" htmlFor="reg-name">Full name</label>
                <input
                  id="reg-name"
                  type="text"
                  className="apple-input w-full"
                  placeholder="Shaurya Bansal"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="apple-label" htmlFor="reg-email">Email address</label>
                <input
                  id="reg-email"
                  type="email"
                  className="apple-input w-full"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="apple-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  className="apple-input w-full"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-apple-rect w-full mt-7"
              >
                {isLoading ? 'Sending OTP…' : 'Continue'}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-on-dark-muted mt-6">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-indigo-600 dark:text-indigo-400 no-underline font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleRegister}
            >
              <div className="mb-4">
                <label className="apple-label" htmlFor="reg-otp">6-Digit OTP</label>
                <input
                  id="reg-otp"
                  type="text"
                  maxLength={6}
                  className="apple-input w-full text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="------"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="btn-apple-rect w-full mt-7"
              >
                {isLoading ? 'Verifying…' : 'Verify & Create Account'}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-on-dark-muted mt-6">
                Didn't receive it?{' '}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-indigo-600 dark:text-indigo-400 no-underline font-medium hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Resend OTP
                </button>
              </p>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
                >
                  ← Back to details
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Register;
