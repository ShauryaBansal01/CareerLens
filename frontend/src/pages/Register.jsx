import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(name, email, password, 'user');
      navigate('/');
    } catch {
      setError('Registration failed. This email may already be in use.');
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
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>C</span>
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
          Create your account.
        </h1>
        <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 32 }}>
          Start your AI-powered career journey today.
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
          <div style={{ marginBottom: 16 }}>
            <label className="apple-label" htmlFor="reg-name">Full name</label>
            <input
              id="reg-name"
              type="text"
              className="apple-input"
              placeholder="Shaurya Bansal"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="apple-label" htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              type="email"
              className="apple-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="apple-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="apple-input"
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
            className="btn-apple-rect"
            style={{ marginTop: 28 }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <span className="apple-spinner" />
                Creating account…
              </span>
            ) : 'Create Account'}
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: 14,
              color: '#6e6e73',
              marginTop: 24,
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#0071e3', textDecoration: 'none', fontWeight: 500 }}
            >
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
