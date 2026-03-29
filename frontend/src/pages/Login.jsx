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
        className="w-full max-w-md glass-card rounded-2xl p-8 relativ overflow-hidden"
      >
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400 -mr-16 -mt-16 to-purple-400 rounded-full blur-2xl opacity-40 mix-blend-multiply"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome back</h3>
            <p className="text-slate-500 mt-2 text-sm">Please enter your details to sign in.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                value={email} onChange={(e) => setEmail(e.target.value)} required 
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                 <label className="block text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
                 <a href="#" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Forgot password?</a>
              </div>
              <input 
                type="password" 
                id="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                value={password} onChange={(e) => setPassword(e.target.value)} required 
              />
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 mt-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </motion.button>
            
            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account? <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Sign up</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
