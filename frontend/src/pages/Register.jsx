import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(name, email, password, 'user');
      navigate('/');
    } catch (error) {
      alert('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center pt-8 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-2xl opacity-40 mix-blend-multiply"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create an account</h3>
            <p className="text-slate-500 mt-2 text-sm">Join CareerLens to unlock your career path.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name"
                placeholder="Alex Doe"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={name} onChange={(e) => setName(e.target.value)} required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email"
                placeholder="alex@example.com"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={email} onChange={(e) => setEmail(e.target.value)} required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                value={password} onChange={(e) => setPassword(e.target.value)} required 
              />
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 mt-4 text-white bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all disabled:opacity-70"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </motion.button>
            
            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account? <Link to="/login" className="font-bold text-purple-600 hover:text-purple-800 transition-colors">Sign in</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
