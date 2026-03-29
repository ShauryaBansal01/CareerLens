import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      alert('Failed to login. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center pt-10 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-display font-extrabold text-on-surface tracking-tight">Welcome back</h3>
            <p className="text-on-surface-variant mt-2 text-sm">Please enter your details to sign in.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-2" htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-surface-low border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all placeholder:text-on-surface-variant text-on-surface"
                value={email} onChange={(e) => setEmail(e.target.value)} required 
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                 <label className="block text-sm font-semibold text-on-surface" htmlFor="password">Password</label>
                 <a href="#" className="text-xs text-primary-500 hover:text-primary-600 font-medium">Forgot password?</a>
              </div>
              <input 
                type="password" 
                id="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-surface-low border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all placeholder:text-on-surface-variant text-on-surface"
                value={password} onChange={(e) => setPassword(e.target.value)} required 
              />
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isLoading}
              className="btn-primary w-full py-3.5 mt-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </motion.button>
            
            <p className="text-center text-sm text-on-surface-variant mt-6">
              Don't have an account? <Link to="/register" className="font-bold text-primary-600 hover:opacity-80 transition-colors">Sign up</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
