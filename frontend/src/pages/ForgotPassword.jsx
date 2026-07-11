import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, Lock, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  useEffect(() => { document.title = 'Reset Password | CareerLens'; }, []);

  const navigate = useNavigate();
  const { forgotPassword: sendResetOtp, resetPassword } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => setOtpCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      const data = await sendResetOtp(email);
      setMessage(data.message || 'OTP has been sent to your email.');
      setOtpCooldown(30);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      setMessage('OTP verified. Please set your new password.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await resetPassword(email, otp, password);
      setMessage(data.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The OTP may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-dark-surface px-4 py-3 text-[15px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors";

  return (
    <div className="min-h-[calc(100vh-54px)] flex items-center justify-center p-4 sm:p-10 bg-gray-50 dark:bg-dark-surface">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-[440px] bg-white dark:bg-dark-card rounded-2xl p-8 sm:p-11 shadow-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary-900 dark:bg-primary-800 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-bold text-base tracking-tight">C</span>
          </div>
          <span className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">
            CareerLens
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-[32px] font-bold text-gray-900 dark:text-white tracking-tight mb-1.5">
          {step === 1 ? 'Reset your password.' : step === 2 ? 'Check your email.' : 'Set new password.'}
        </h1>
        <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-8">
          {step === 1
            ? "Enter your email and we'll send you a reset OTP."
            : step === 2
            ? `We sent a 6-digit code to ${email}.`
            : 'Choose a new password for your account.'}
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

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOtp}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5" htmlFor="reset-email">Email address</label>
                <input
                  id="reset-email"
                  type="email"
                  className={inputClass}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-7 py-3 rounded-lg text-[15px] font-bold text-white bg-accent-700 hover:bg-accent-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Mail size={16} />
                )}
                {isLoading ? 'Sending OTP…' : 'Send OTP'}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-accent-700 dark:text-accent-400 no-underline font-bold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOtp}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5" htmlFor="reset-otp">6-Digit OTP</label>
                <input
                  id="reset-otp"
                  type="text"
                  maxLength={6}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-dark-surface px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
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
                className="w-full mt-7 py-3 rounded-lg text-[15px] font-bold text-white bg-accent-700 hover:bg-accent-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <KeyRound size={16} />
                )}
                {isLoading ? 'Verifying…' : 'Verify OTP'}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Didn't receive it?{' '}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpCooldown > 0}
                  className="text-accent-700 dark:text-accent-400 no-underline font-bold hover:underline bg-transparent border-none cursor-pointer p-0 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed"
                >
                  {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}
                </button>
              </p>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-400 hover:text-gray-500 transition-colors bg-transparent border-none cursor-pointer"
                >
                  ← Back to email
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleResetPassword}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5" htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  className={inputClass}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1.5" htmlFor="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  className={inputClass}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="w-full mt-7 py-3 rounded-lg text-[15px] font-bold text-white bg-accent-700 hover:bg-accent-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Lock size={16} />
                )}
                {isLoading ? 'Resetting…' : 'Reset Password'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
