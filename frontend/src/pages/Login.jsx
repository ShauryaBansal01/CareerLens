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
    <div
      style={{
        minHeight: 'calc(100vh - 54px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        background: '#f5f5f7',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#ffffff',
          borderRadius: 20,
          padding: '48px 44px',
          boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
        }}
      >
        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: 'linear-gradient(135deg, #0071e3, #0059b5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>C</span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.02em' }}>
            CareerLens
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#1d1d1f',
            letterSpacing: '-0.03em',
            marginBottom: 6,
          }}
        >
          Welcome back.
        </h1>
        <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 32 }}>
          Sign in to your CareerLens account.
        </p>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(255,59,48,0.08)',
              color: '#c0392b',
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 14,
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label className="apple-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              className="apple-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="apple-label" htmlFor="login-password" style={{ marginBottom: 0 }}>Password</label>
              <a
                href="#"
                style={{ fontSize: 13, color: '#0071e3', textDecoration: 'none', fontWeight: 400 }}
              >
                Forgot password?
              </a>
            </div>
            <input
              id="login-password"
              type="password"
              className="apple-input"
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
            className="btn-apple-rect"
            style={{ marginTop: 24 }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <span className="apple-spinner" />
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>

          {/* Link */}
          <p
            style={{
              textAlign: 'center',
              fontSize: 14,
              color: '#6e6e73',
              marginTop: 24,
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: '#0071e3', textDecoration: 'none', fontWeight: 500 }}
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
