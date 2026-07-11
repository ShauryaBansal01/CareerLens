import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Briefcase, Map, Plus, Database } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Admin = () => {
  useEffect(() => { document.title = 'Admin | CareerLens'; }, []);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const [roleName, setRoleName] = useState('');
  const [roleSkills, setRoleSkills] = useState('');

  const [projectTitle, setProjectTitle] = useState('');
  const [projectSkills, setProjectSkills] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    } else {
      fetchStats();
    }
  }, [user, navigate]);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${API_URL}/admin/stats`, config);
      setStats(res.data);
    } catch (error) {
      console.error(error);
      showFeedback('error', 'Failed to load stats.');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_URL}/admin/role`, {
        roleName,
        requiredSkills: roleSkills.split(',').map(s => s.trim())
      }, config);
      showFeedback('success', 'Role added successfully');
      setRoleName('');
      setRoleSkills('');
      fetchStats();
    } catch (error) {
      showFeedback('error', error.response?.data?.message || 'Error adding role');
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${API_URL}/admin/project`, {
        title: projectTitle,
        description: projectDesc,
        requiredSkills: projectSkills.split(',').map(s => s.trim())
      }, config);
      showFeedback('success', 'Project added successfully');
      setProjectTitle('');
      setProjectDesc('');
      setProjectSkills('');
      fetchStats();
    } catch (error) {
      showFeedback('error', error.response?.data?.message || 'Error adding project');
    }
  };

  if (!user || user.role !== 'admin') return null;

  const inputClass = "w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-dark-surface px-4 py-3 text-[15px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors";

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20 pt-4 bg-gray-50 dark:bg-[#0f0f13] min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-white dark:bg-dark-card shadow-sm text-blue-600 rounded-xl flex items-center justify-center">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Admin System Central</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Manage the platform's career data rules.</p>
        </div>
      </motion.div>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          }`}
        >
          {feedback.message}
        </motion.div>
      )}

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8 animate-pulse">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : stats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm tracking-widest uppercase">Active Roles</p>
            <p className="text-5xl font-black mt-2 text-gray-900 dark:text-white">{stats.rolesCount}</p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm tracking-widest uppercase">Project Templates</p>
            <p className="text-5xl font-black mt-2 text-gray-900 dark:text-white">{stats.projectsCount}</p>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8 flex flex-col justify-between">
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
          className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center border-b border-gray-100 dark:border-white/5 pb-4">
            <Plus className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-500" /> Add New Role
          </h2>
          <form onSubmit={handleAddRole} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2" htmlFor="role-name">Role Name</label>
              <input
                id="role-name"
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
                className={inputClass}
                placeholder="e.g. Frontend Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2" htmlFor="role-skills">Required Skills (Comma separated)</label>
              <input
                id="role-skills"
                type="text"
                value={roleSkills}
                onChange={(e) => setRoleSkills(e.target.value)}
                required
                className={inputClass}
                placeholder="react, tailwind, typescript"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-accent-700 hover:bg-accent-800 text-white rounded-lg font-bold py-3 text-[15px] transition-colors shadow-sm"
            >
              Save Target Role
            </button>
          </form>
        </motion.div>

        {/* Add Project Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center border-b border-gray-100 dark:border-white/5 pb-4">
            <Plus className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-500" /> Add New Project
          </h2>
          <form onSubmit={handleAddProject} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2" htmlFor="project-title">Project Title</label>
              <input
                id="project-title"
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                required
                className={inputClass}
                placeholder="e.g. E-Commerce Dashboard"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2" htmlFor="project-skills">Target Skills Mapped</label>
              <input
                id="project-skills"
                type="text"
                value={projectSkills}
                onChange={(e) => setProjectSkills(e.target.value)}
                required
                className={inputClass}
                placeholder="react, nodejs, mongodb"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2" htmlFor="project-desc">Project Overview</label>
              <textarea
                id="project-desc"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                required
                className={`${inputClass} h-28 resize-none`}
                placeholder="Describe what the user will build..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-accent-700 hover:bg-accent-800 text-white rounded-lg font-bold py-3 text-[15px] transition-colors shadow-sm"
            >
              Deploy Project Template
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default Admin;
