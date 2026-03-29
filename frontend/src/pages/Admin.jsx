import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  
  // Forms
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
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in">
      <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow border">
            <h3 className="text-gray-500">Total Roles</h3>
            <p className="text-3xl font-bold">{stats.rolesCount}</p>
          </div>
          <div className="bg-white p-6 rounded shadow border">
            <h3 className="text-gray-500">Total Projects</h3>
            <p className="text-3xl font-bold">{stats.projectsCount}</p>
          </div>
          <div className="bg-white p-6 rounded shadow border">
            <h3 className="text-gray-500">Total Roadmaps</h3>
            <p className="text-3xl font-bold">{stats.roadmapsCount}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Add Role Form */}
        <div className="bg-white p-6 rounded shadow border">
          <h2 className="text-xl font-bold mb-4">Add New Role</h2>
          <form onSubmit={handleAddRole} className="space-y-4">
            <div>
              <label className="block text-sm">Role Name</label>
              <input type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} required className="w-full border rounded p-2" placeholder="e.g. UX Designer" />
            </div>
            <div>
              <label className="block text-sm">Required Skills (comma separated)</label>
              <input type="text" value={roleSkills} onChange={(e) => setRoleSkills(e.target.value)} required className="w-full border rounded p-2" placeholder="figma, sketch, wireframing" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Role</button>
          </form>
        </div>

        {/* Add Project Form */}
        <div className="bg-white p-6 rounded shadow border">
          <h2 className="text-xl font-bold mb-4">Add New Project</h2>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div>
              <label className="block text-sm">Project Title</label>
              <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required className="w-full border rounded p-2" placeholder="Job Board Platform" />
            </div>
            <div>
              <label className="block text-sm">Target Skills (comma separated)</label>
              <input type="text" value={projectSkills} onChange={(e) => setProjectSkills(e.target.value)} required className="w-full border rounded p-2" placeholder="react, tailwind, node" />
            </div>
            <div>
              <label className="block text-sm">Project Description</label>
              <textarea value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} required className="w-full border rounded p-2" placeholder="A brief overview..." />
            </div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Project</button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Admin;
