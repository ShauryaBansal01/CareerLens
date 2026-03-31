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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20 pt-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-white dark:bg-gray-800 shadow-sm text-blue-600 rounded-xl flex items-center justify-center">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Admin System Central</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Manage the platform's career data rules.</p>
        </div>
      </motion.div>
      
      {stats && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm tracking-widest uppercase">Active Roles</p>
            <p className="text-5xl font-black mt-2 text-gray-900 dark:text-white">{stats.rolesCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm tracking-widest uppercase">Project Templates</p>
            <p className="text-5xl font-black mt-2 text-gray-900 dark:text-white">{stats.projectsCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <Map className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm tracking-widest uppercase">Roadmap Nodes</p>
            <p className="text-5xl font-black mt-2 text-gray-900 dark:text-white">{stats.roadmapsCount}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Add Role Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center border-b border-gray-100 dark:border-gray-700 pb-4">
            <Plus className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-500" /> Add New Role
          </h2>
          <form onSubmit={handleAddRole} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Role Name</label>
              <input 
                type="text" 
                value={roleName} 
                onChange={(e) => setRoleName(e.target.value)} 
                required 
                className="apple-input w-full" 
                placeholder="e.g. Frontend Engineer" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Required Skills (Comma separated)</label>
              <input 
                type="text" 
                value={roleSkills} 
                onChange={(e) => setRoleSkills(e.target.value)} 
                required 
                className="apple-input w-full" 
                placeholder="react, tailwind, typescript" 
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="btn-apple-rect w-full mt-4"
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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center border-b border-gray-100 dark:border-gray-700 pb-4">
            <Plus className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-500" /> Add New Project
          </h2>
          <form onSubmit={handleAddProject} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Project Title</label>
              <input 
                type="text" 
                value={projectTitle} 
                onChange={(e) => setProjectTitle(e.target.value)} 
                required 
                className="apple-input w-full" 
                placeholder="e.g. E-Commerce Dashboard" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Target Skills Mapped</label>
              <input 
                type="text" 
                value={projectSkills} 
                onChange={(e) => setProjectSkills(e.target.value)} 
                required 
                className="apple-input w-full" 
                placeholder="react, nodejs, mongodb" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Project Overview</label>
              <textarea 
                value={projectDesc} 
                onChange={(e) => setProjectDesc(e.target.value)} 
                required 
                className="apple-input w-full h-28 resize-none" 
                placeholder="Describe what the user will build..." 
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="btn-apple-rect w-full mt-4"
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
