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
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-display font-extrabold text-on-surface tracking-tight">Create an account</h3>
            <p className="text-on-surface-variant mt-2 text-sm">Join CareerLens to unlock your career path.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name"
                placeholder="Alex Doe"
                className="w-full px-4 py-3 bg-surface-low border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all placeholder:text-on-surface-variant text-on-surface"
                value={name} onChange={(e) => setName(e.target.value)} required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email"
                placeholder="alex@example.com"
                className="w-full px-4 py-3 bg-surface-low border border-transparent rounded-xl focus:outline-none focus:border-primary-500 transition-all placeholder:text-on-surface-variant text-on-surface"
                value={email} onChange={(e) => setEmail(e.target.value)} required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="password">Password</label>
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
              className="btn-primary w-full py-3.5 mt-4 transition-all disabled:opacity-70"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </motion.button>
            
            <p className="text-center text-sm text-on-surface-variant mt-6">
              Already have an account? <Link to="/login" className="font-bold text-primary-600 hover:opacity-80 transition-colors">Sign in</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
