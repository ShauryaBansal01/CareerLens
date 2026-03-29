import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Briefcase, Map, Plus, Trash2, Database } from 'lucide-react';

const Admin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  
  const [roleName, setRoleName] = useState('');
  const [roleSkills, setRoleSkills] = useState('');
  
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSkills, setProjectSkills] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    } else {
      fetchStats();
    }
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('http://localhost:5000/api/admin/stats', config);
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/admin/role', {
        roleName,
        requiredSkills: roleSkills.split(',').map(s => s.trim())
      }, config);
      alert('Role added successfully');
      setRoleName('');
      setRoleSkills('');
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding role');
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/admin/project', {
        title: projectTitle,
        description: projectDesc,
        requiredSkills: projectSkills.split(',').map(s => s.trim())
      }, config);
      alert('Project added successfully');
      setProjectTitle('');
      setProjectDesc('');
      setProjectSkills('');
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding project');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in pb-20 pt-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin System Central</h1>
          <p className="text-slate-500 font-medium">Manage the platform's career data rules.</p>
        </div>
      </motion.div>
      
      {stats && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass-card bg-gradient-to-br from-indigo-500 to-indigo-600 border-none p-6 rounded-3xl shadow-lg relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <Users className="w-8 h-8 mb-4 text-indigo-200" />
            <p className="text-indigo-100 font-medium text-sm tracking-wide uppercase">Active Roles Data</p>
            <p className="text-5xl font-black mt-1">{stats.rolesCount}</p>
          </div>
          <div className="glass-card bg-gradient-to-br from-purple-500 to-purple-600 border-none p-6 rounded-3xl shadow-lg relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <Briefcase className="w-8 h-8 mb-4 text-purple-200" />
            <p className="text-purple-100 font-medium text-sm tracking-wide uppercase">Project Templates</p>
            <p className="text-5xl font-black mt-1">{stats.projectsCount}</p>
          </div>
          <div className="glass-card bg-gradient-to-br from-pink-500 to-pink-600 border-none p-6 rounded-3xl shadow-lg relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <Map className="w-8 h-8 mb-4 text-pink-200" />
            <p className="text-pink-100 font-medium text-sm tracking-wide uppercase">Roadmap Nodes</p>
            <p className="text-5xl font-black mt-1">{stats.roadmapsCount}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Add Role Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-8 rounded-3xl border border-white/60 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-indigo-500" /> Add New Role
          </h2>
          <form onSubmit={handleAddRole} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Role Name</label>
              <input 
                type="text" 
                value={roleName} 
                onChange={(e) => setRoleName(e.target.value)} 
                required 
                className="w-full bg-white/50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400" 
                placeholder="e.g. Frontend Engineer" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Required Skills (Comma separated)</label>
              <input 
                type="text" 
                value={roleSkills} 
                onChange={(e) => setRoleSkills(e.target.value)} 
                required 
                className="w-full bg-white/50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400" 
                placeholder="react, tailwind, typescript" 
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-4 py-3.5 rounded-xl hover:shadow-lg shadow-indigo-500/30 transition-all mt-4"
            >
              Save Target Role
            </motion.button>
          </form>
        </motion.div>

        {/* Add Project Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-8 rounded-3xl border border-white/60 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-400 to-pink-500"></div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-purple-500" /> Add New Project
          </h2>
          <form onSubmit={handleAddProject} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Project Title</label>
              <input 
                type="text" 
                value={projectTitle} 
                onChange={(e) => setProjectTitle(e.target.value)} 
                required 
                className="w-full bg-white/50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder:text-slate-400" 
                placeholder="e.g. E-Commerce Dashboard" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Target Skills Mapped</label>
              <input 
                type="text" 
                value={projectSkills} 
                onChange={(e) => setProjectSkills(e.target.value)} 
                required 
                className="w-full bg-white/50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder:text-slate-400" 
                placeholder="react, nodejs, mongodb" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Project Overview</label>
              <textarea 
                value={projectDesc} 
                onChange={(e) => setProjectDesc(e.target.value)} 
                required 
                className="w-full bg-white/50 border border-slate-200 rounded-xl p-3 h-28 resize-none focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder:text-slate-400" 
                placeholder="Describe what the user will build..." 
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold px-4 py-3.5 rounded-xl hover:shadow-lg shadow-purple-500/30 transition-all mt-4"
            >
              Deploy Project Template
            </motion.button>
          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default Admin;
